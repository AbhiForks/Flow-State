"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { KpiCard } from "@/components/KpiCard";
import { DailyChart } from "@/components/DailyChart";
import { Heatmap } from "@/components/Heatmap";
import { Breakdown } from "@/components/Breakdown";
import { PresencePanel } from "@/components/PresencePanel";
import { Compare } from "@/components/Compare";
import { SfClock } from "@/components/SfClock";
import { GoalBar } from "@/components/GoalBar";
import { FareMeter } from "@/components/FareMeter";
import { OtherLife } from "@/components/OtherLife";
import { MotivationStrip } from "@/components/MotivationStrip";
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
  const [tick, setTick] = useState(0);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("fs.rail") === "1";
  });

  useEffect(() => {
    localStorage.setItem("fs.rail", collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    getPresence().then(setPresence).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setErr(null);
    setData(null);
    getSummary(range, user)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setErr(String(e)));
    return () => {
      alive = false;
    };
  }, [range, user, tick]);

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

  const dayMap = useMemo(() => new Map((summary?.byDay ?? []).map((d) => [d.date, d.seconds])), [summary]);
  const last7 = useMemo(() => {
    const out: { date: string; on: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      out.push({ date: iso, on: (dayMap.get(iso) ?? 0) >= 600 });
    }
    return out;
  }, [dayMap]);

  const yesterdaySec = useMemo(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return dayMap.get(y.toISOString().slice(0, 10)) ?? 0;
  }, [dayMap]);

  const delta = todaySec - yesterdaySec;
  const deltaPct = yesterdaySec > 0 ? Math.round((delta / yesterdaySec) * 100) : null;

  const flowUsd = summary ? Math.round(((todaySec / 3600) * 150) / 5) * 5 : 0;
  const flowInr = (flowUsd * 85).toLocaleString("en-IN");

  const fmtRange = () => {
    if (!data) return "";
    const f = new Date(data.range.from * 1000);
    const t = new Date(data.range.to * 1000);
    const o = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${o(f)} – ${o(t)}`;
  };

  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className={`shell ${collapsed ? "rail" : ""}`}>
      <Sidebar active="overview" presence={presence} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
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
                <GoalBar todaySec={todaySec} />
              </>
            ) : (
              <>
                <h1 className="hero-title" style={{ color: "var(--dim)" }}>…</h1>
                <div className="hero-meta">loading workspace</div>
              </>
            )}
          </div>
          <div className="hero-side">
            <SfClock />
            <div className="controls">
              {summary && (
                <span
                  className="chip"
                  title="Rough value of today's flow at SF L5 comp rates, converted to INR"
                >
                  ≈ ${flowUsd} · ₹{flowInr}
                  <span className="chip-label">flow value</span>
                </span>
              )}
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
        </div>

        {err && (
          <div className="loading">
            <div>Can't reach the server at {process.env.NEXT_PUBLIC_API}</div>
            <button className="retry-btn" onClick={() => setTick((t) => t + 1)}>
              retry
            </button>
          </div>
        )}

        {summary && (
          <MotivationStrip
            todaySec={todaySec}
            streak={summary.flowStreak}
            youName={users[0]?.name ?? "you"}
            friendName={user === "all" ? friend?.name ?? null : null}
            friendDeltaSec={user === "all" && friend ? users[0]!.totalSeconds - friend.totalSeconds : 0}
            activeDays={summary.activeDays}
            range={range}
          />
        )}

        {!data && !err && (
          <>
            <div className="kpi-row">
              {[0, 1, 2, 3].map((i) => (
                <div className="card kpi" key={i}>
                  <div className="sk sk-line" />
                  <div className="sk sk-num" />
                  <div className="sk sk-line" />
                </div>
              ))}
            </div>
            <div className="sk sk-chart" />
          </>
        )}

        {summary && (
          <>
            <div className="kpi-row">
              <KpiCard
                label="Focus time"
                accent
                animate
                value={`${Math.round(summary.totalSeconds / 3600)}`}
                unit="h total"
                foot={
                  deltaPct === null || delta === 0 ? (
                    <span className="tick-flat">no change vs yesterday</span>
                  ) : delta > 0 ? (
                    <span className="tick-up">▲ {deltaPct}% vs yesterday</span>
                  ) : (
                    <span style={{ color: "var(--coral)" }}>▼ {Math.abs(deltaPct)}% vs yesterday</span>
                  )
                }
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
                foot={
                  <div className="days">
                    {last7.map((d, i) => (
                      <span key={d.date} className={`day-dot ${d.on ? "on" : ""} ${i === 6 ? "today" : ""}`} />
                    ))}
                    <span className="tick-flat" style={{ marginLeft: 4 }}>last 7 days</span>
                  </div>
                }
              />
              <KpiCard
                label="Sessions"
                animate
                value={`${summary.sessions}`}
                unit="total"
                foot={<span className="tick-flat">{summary.writes.toLocaleString()} code events</span>}
              />
            </div>

            <FareMeter todaySec={todaySec} />

            <div className="mid-row">
              {friend && user === "all" && <Compare you={users[0]!} friend={friend} range={range} />}
              <OtherLife todaySec={todaySec} />
            </div>

            <div className="grid-2">
              <div className="grid-stack">
                <section className="card flush">
                  <div className="section-head">
                    <div className="section-title">Daily focus</div>
                    <div className="section-note">{fmtRange()} · hours of deep work</div>
                  </div>
                  <DailyChart byDay={summary.byDay} days={range} key={range} />
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
