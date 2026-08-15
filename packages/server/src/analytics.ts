import { db } from "./db.js";
import type {
  Breakdown,
  DayBucket,
  SummaryResponse,
  UserSummary,
} from "./types.js";

const HEARTBEAT_TIMEOUT = 300; // cap gaps between pings at 5 min
const SESSION_GAP = 15 * 60; // >15 min gap = new session
const FLOW_THRESHOLD = 10 * 60; // a "flow day" needs >=10 min

interface Row {
  user: string;
  time: number;
  language: string | null;
  project: string | null;
  is_write: number;
}

function dayKey(unixSec: number): string {
  return new Date(unixSec * 1000).toISOString().slice(0, 10);
}

function emptySummary(user: string, name: string): UserSummary {
  return {
    user,
    name,
    totalSeconds: 0,
    activeDays: 0,
    flowStreak: 0,
    sessions: 0,
    avgSessionSeconds: 0,
    writes: 0,
    byDay: [],
    byLanguage: [],
    byProject: [],
  };
}

function compute(nameById: Map<string, string>, rows: Row[]): UserSummary {
  const user = rows[0]?.user ?? "";
  const name = nameById.get(user) ?? user;
  const base = emptySummary(user, name);
  if (rows.length === 0) return base;

  const times = rows.map((r) => r.time).sort((a, b) => a - b);

  // total + breakdowns via delta walking
  const byDay = new Map<string, number>();
  const byLanguage = new Map<string, number>();
  const byProject = new Map<string, number>();
  let total = 0;
  let writes = 0;
  let prev: number | null = null;

  for (const r of rows.sort((a, b) => a.time - b.time)) {
    const delta = prev === null ? 0 : Math.min(r.time - prev, HEARTBEAT_TIMEOUT);
    if (delta > 0) {
      total += delta;
      const d = dayKey(r.time);
      byDay.set(d, (byDay.get(d) ?? 0) + delta);
      if (r.language) byLanguage.set(r.language, (byLanguage.get(r.language) ?? 0) + delta);
      if (r.project) byProject.set(r.project, (byProject.get(r.project) ?? 0) + delta);
    }
    if (r.is_write) writes++;
    prev = r.time;
  }

  // sessions
  let sessions = 0;
  let sessionStart: number | null = null;
  let prevT: number | null = null;
  for (const t of times) {
    if (prevT === null || t - prevT > SESSION_GAP) {
      sessions++;
      sessionStart = t;
    }
    prevT = t;
  }
  const avgSessionSeconds = sessions > 0 ? total / sessions : 0;

  // active days + flow streak
  const dayTotals = new Map<string, number>(byDay);
  const activeDays = dayTotals.size;
  // Flow streak: consecutive days (ending today or yesterday) with >= FLOW_THRESHOLD.
  let flowStreak = 0;
  const now = Math.floor(Date.now() / 1000);
  for (let i = 0; ; i++) {
    const d = dayKey(now - i * 86400);
    const secs = dayTotals.get(d) ?? 0;
    if (secs >= FLOW_THRESHOLD) {
      flowStreak++;
      continue;
    }
    // today or yesterday may be a partial/incomplete day — skip and keep looking back
    if (i <= 1) continue;
    break;
  }
  if (flowStreak === 0 && (dayTotals.get(dayKey(now)) ?? 0) >= FLOW_THRESHOLD) {
    flowStreak = 1;
  }

  const toBreakdown = (m: Map<string, number>): Breakdown[] =>
    [...m.entries()]
      .map(([key, seconds]) => ({ key, seconds }))
      .sort((a, b) => b.seconds - a.seconds);

  const byDayArr: DayBucket[] = [...byDay.entries()]
    .map(([date, seconds]) => ({ date, seconds }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    ...base,
    totalSeconds: total,
    activeDays,
    flowStreak,
    sessions,
    avgSessionSeconds,
    writes,
    byDay: byDayArr,
    byLanguage: toBreakdown(byLanguage),
    byProject: toBreakdown(byProject),
  };
}

export function buildSummary(days: number, userFilter?: string): SummaryResponse {
  const to = Math.floor(Date.now() / 1000);
  const from = to - days * 86400;

  const profiles = db
    .prepare(`SELECT user, name FROM profiles`)
    .all() as { user: string; name: string }[];
  const nameById = new Map(profiles.map((p) => [p.user, p.name]));

  const wanted = userFilter
    ? profiles.filter((p) => p.user === userFilter)
    : profiles;

  const users: UserSummary[] = [];
  for (const p of wanted) {
    const rows = db
      .prepare(
        `SELECT user, time, language, project, is_write FROM heartbeats
         WHERE user = ? AND time >= ? AND time <= ?
         ORDER BY time ASC`,
      )
      .all(p.user, from, to) as Row[];
    users.push(compute(nameById, rows));
  }

  const combined = mergeSummaries(users, "all", "Everyone");
  return {
    generatedAt: Math.floor(Date.now() / 1000),
    range: { from, to, days },
    users,
    combined,
  };
}

function mergeSummaries(list: UserSummary[], user: string, name: string): UserSummary {
  const totalSeconds = list.reduce((s, u) => s + u.totalSeconds, 0);
  const writes = list.reduce((s, u) => s + u.writes, 0);
  const sessions = list.reduce((s, u) => s + u.sessions, 0);
  const activeDays = new Set(list.flatMap((u) => u.byDay.map((d) => d.date))).size;
  const flowStreak = list.reduce((m, u) => Math.max(m, u.flowStreak), 0);

  const dayMap = new Map<string, number>();
  const langMap = new Map<string, number>();
  const projMap = new Map<string, number>();
  for (const u of list) {
    for (const d of u.byDay) dayMap.set(d.date, (dayMap.get(d.date) ?? 0) + d.seconds);
    for (const l of u.byLanguage) langMap.set(l.key, (langMap.get(l.key) ?? 0) + l.seconds);
    for (const p of u.byProject) projMap.set(p.key, (projMap.get(p.key) ?? 0) + p.seconds);
  }
  const byDay = [...dayMap.entries()]
    .map(([date, seconds]) => ({ date, seconds }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const toBreakdown = (m: Map<string, number>): Breakdown[] =>
    [...m.entries()].map(([key, seconds]) => ({ key, seconds })).sort((a, b) => b.seconds - a.seconds);

  return {
    user,
    name,
    totalSeconds,
    activeDays,
    flowStreak,
    sessions,
    avgSessionSeconds: sessions > 0 ? totalSeconds / sessions : 0,
    writes,
    byDay,
    byLanguage: toBreakdown(langMap),
    byProject: toBreakdown(projMap),
  };
}
