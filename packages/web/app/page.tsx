"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { KpiCard } from "@/components/KpiCard";
import { DailyChart } from "@/components/DailyChart";
import { Heatmap } from "@/components/Heatmap";
import { Breakdown } from "@/components/Breakdown";
import { PresencePanel } from "@/components/PresencePanel";
import { Compare } from "@/components/Compare";
import { getSummary, getPresence, type SummaryResponse, type PresenceState } from "@/lib/api";
import { fmtDuration, fmtHM } from "@/lib/format";
import { useCountUp } from "@/hooks/useCountUp";

const RANGES = [
  { d: 7, label: "7d" },
  { d: 14, label: "14d" },
  { d: 30, label: "30d" },
  { d: 90, label: "90d" },
];

function TodayStat({ seconds }: { seconds: number }) {
  const count = useCountUp(seconds, 1200);
  const { value, unit } = fmtDuration(count);
  return (
    <span className="hero-title">
      {value}
      <em> {unit}</em>
    </span>
  );
}

export default function Page() {
  const [range, setRange] = useState(14);
  const [user, setUser] = useState("all");
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [presence, setPresence] = useState<PresenceState[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getPresence().then(setPresence).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setErr(null);
    getSummary(range, user)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setErr(String(e)));
    return () => {
      alive = false;
    };
  }, [range, user]);

  const summary = data
    ? user === "all"
      ? data.combined
      : data.users.find((u) => u.user === user) ?? data.combined
    : null;
  const users = data?.users ?? [];
  const friend = data?.users[0] ? users[users.length - 1] : null;

  const spark = useMemo(() => summary?.byDay.map((d) => d.seconds) ?? [], [summary]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todaySec = summary?.byDay.find((d) => d.date === todayKey)?.seconds ?? 0;

  const fmtRange = () => {
    if (!data) return "";
    const f = new Date(data.range.from * 1000);
    const t = new Date(data.range.to * 1000);
    const o = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${o(f)} – ${o(t)}`;
  };

  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="shell">
      <Sidebar active="overview" presence={presence} />
      <main className="main">
        <div className="hero">
          <div>
            <div className="hero-kicker">{today}</div>
            {summary ? (
              <>
                <TodayStat seconds={todaySec} />
                <div className="hero-meta">
                  <span>{todaySec > 0 ? "in flow today" : "no flow recorded yet today"}</span>
                  <span className="sep">/</span>
                  <span>streak <b style={{ color: "var(--accent)" }}>{summary.flowStreak}d</b></span>
                  <span className="sep">/</span>
                  <span>{fmtHM(summary.totalSeconds)} in {range}d</span>
                </div>
              </>
            ) : (
              <>
                <h1 className="hero-title" style={{ color: "var(--dim)" }}>…</h1>
                <div className="hero-meta">loading workspace</div>
              </>
            )}
          </div>
          <div className="controls">
            <select className="select" value={user} onChange={(e) => setUser(e.target.value)}>
              <option value="all">Everyone</option>
              {users.map((u) => (
                <option key={u.user} value={u.user}>
                  {u.name}
                </option>
              ))}
            </select>
            <div className="seg">
              {RANGES.map((r) => (
                <button key={r.d} className={range === r.d ? "on" : ""} onClick={() => setRange(r.d)}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {err && <div className="loading">Can't reach the server at {process.env.NEXT_PUBLIC_API}</div>}

        {summary && (
          <>
            <div className="kpi-row">
              <KpiCard
                label="Focus time"
                accent
                animate
                value={`${Math.round(summary.totalSeconds / 3600)}`}
                unit="h total"
                foot={<span className="tick-up">▲ {Math.round(summary.avgSessionSeconds / 60)} min avg session</span>}
                spark={spark}
              />
              <KpiCard
                label="Active days"
                animate
                value={`${summary.activeDays}`}
                unit={`of ${range}`}
                foot={<span className="tick-flat">{Math.round((summary.activeDays / range) * 100)}% of days</span>}
              />
              <KpiCard
                label="Flow streak"
                animate
                value={`${summary.flowStreak}`}
                unit="days"
                foot={<span className="tick-up">▲ still running</span>}
              />
              <KpiCard
                label="Sessions"
                animate
                value={`${summary.sessions}`}
                unit="total"
                foot={<span className="tick-flat">{summary.writes.toLocaleString()} code events</span>}
              />
            </div>

            {friend && user === "all" && <Compare you={users[0]!} friend={friend} />}

            <div className="grid-2">
              <div className="grid-stack">
                <section className="card flush">
                  <div className="section-head">
                    <div className="section-title">Daily focus</div>
                    <div className="section-note">{fmtRange()} · hours of deep work</div>
                  </div>
                  <DailyChart byDay={summary.byDay} days={range} />
                </section>

                <section className="card flush">
                  <div className="section-head">
                    <div className="section-title">Consistency</div>
                    <div className="section-note">last 16 weeks</div>
                  </div>
                  <Heatmap byDay={summary.byDay} weeks={16} />
                </section>
              </div>

              <div className="grid-stack">
                <section className="card flush">
                  <div className="section-head">
                    <div className="section-title">Presence</div>
                    <div className="section-note">live</div>
                  </div>
                  <PresencePanel initial={presence} />
                </section>

                <section className="card flush">
                  <div className="section-head">
                    <div className="section-title">Languages</div>
                    <div className="section-note">{summary.byLanguage.length} tracked</div>
                  </div>
                  <Breakdown items={summary.byLanguage} mode="lang" />
                </section>

                <section className="card flush">
                  <div className="section-head">
                    <div className="section-title">Projects</div>
                    <div className="section-note">{summary.byProject.length} tracked</div>
                  </div>
                  <Breakdown items={summary.byProject} mode="single" />
                </section>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
