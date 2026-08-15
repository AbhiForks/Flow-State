"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { KpiCard } from "@/components/KpiCard";
import { DailyChart } from "@/components/DailyChart";
import { Heatmap } from "@/components/Heatmap";
import { Breakdown } from "@/components/Breakdown";
import { PresencePanel } from "@/components/PresencePanel";
import { getSummary, getPresence, type SummaryResponse, type PresenceState } from "@/lib/api";
import { fmtDuration, fmtClock } from "@/lib/format";

const RANGES = [
  { d: 7, label: "7d" },
  { d: 14, label: "14d" },
  { d: 30, label: "30d" },
  { d: 90, label: "90d" },
];

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

  const summary = data ? (user === "all" ? data.combined : data.users.find((u) => u.user === user) ?? data.combined) : null;
  const users = data?.users ?? [];

  const spark = useMemo(() => (summary?.byDay.map((d) => d.seconds) ?? []), [summary]);

  const fmtRange = () => {
    if (!data) return "";
    const f = new Date(data.range.from * 1000);
    const t = new Date(data.range.to * 1000);
    const o = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `Last ${range}d · ${o(f)} – ${o(t)}`;
  };

  return (
    <div className="shell">
      <Sidebar active="overview" presence={presence} />
      <main className="main">
        <div className="topbar">
          <div>
            <h1 className="page-title">Overview</h1>
            <div className="page-sub">{fmtRange() || "Loading…"}</div>
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

        {err && <div className="loading">Couldn’t reach the server at {process.env.NEXT_PUBLIC_API}. Start it with <code>npm run dev</code>.</div>}
        {!data && !err && <div className="loading">Loading workspace…</div>}

        {summary && (
          <>
            <div className="kpi-row">
              <KpiCard
                label="Focus time"
                accent
                value={fmtDuration(summary.totalSeconds).value}
                unit={fmtDuration(summary.totalSeconds).unit}
                foot={<span className="tick-up">▲ live</span>}
                spark={spark}
              />
              <KpiCard
                label="Active days"
                value={`${summary.activeDays}`}
                unit={`/ ${range}`}
                foot={<span>across the range</span>}
              />
              <KpiCard
                label="Flow streak"
                value={`${summary.flowStreak}`}
                unit="days"
                foot={<span className="tick-up">keep it going</span>}
              />
              <KpiCard
                label="Avg session"
                value={fmtClock(summary.avgSessionSeconds).split(" ")[0]}
                unit={fmtClock(summary.avgSessionSeconds).split(" ")[1]}
                foot={<span>{summary.sessions} sessions logged</span>}
              />
            </div>

            <div className="grid-2">
              <div className="grid-stack">
                <section className="card flush">
                  <div className="section-head">
                    <div className="section-title">Daily focus</div>
                    <div className="section-note">hours of deep work per day</div>
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
                    <div className="section-note">real-time</div>
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
