"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SfClockHero } from "@/components/SfClockHero";
import { getSummary, type SummaryResponse } from "@/lib/api";

const BENCH = [
  "TCS calls a week of your flow a quarter's deliverable",
  "Infosys pays ₹3.6L/yr for 12x the hours you just put in",
  "Wipro's bench is 90 days. your bench is zero — you ship",
  "Cognizant bills offshore for what you did in one session",
  "HCL: 'effort appreciated'. SF: effort priced at $150/hr",
  "the bench sells time. you sell outcomes. different market",
  "₹40L vs ₹4L a year — same brain, different interview",
];

const ROUNDS = [
  { n: "recruiter", l: "expected TC — say the number without flinching" },
  { n: "phone screen", l: "live coding in a shared doc, no autocomplete" },
  { n: "coding", l: "a whiteboard DP even the staff engineer can't solve" },
  { n: "system design", l: "scale your weekend project to 1B users. casually" },
  { n: "behavioral", l: "5 stories where you owned the outcome" },
  { n: "team match", l: "pray they don't read your commit times" },
];

const MILESTONES = [
  { d: 3, l: "interview prep" },
  { d: 7, l: "system design" },
  { d: 14, l: "onsite week" },
  { d: 21, l: "offer negotiation" },
  { d: 30, l: "TC reset" },
];

export default function Home() {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [round, setRound] = useState(0);
  const [burn, setBurn] = useState(0);

  useEffect(() => {
    getSummary(7, "all").then(setData).catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => setRound((v) => (v + 1) % ROUNDS.length), 2600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setBurn((v) => (v + 1) % BENCH.length), 5200);
    return () => clearInterval(id);
  }, []);

  const users = data?.users ?? [];
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaySec = users[0]?.byDay.find((d) => d.date === todayKey)?.seconds ?? 3.6 * 3600;
  const usd = Math.round((todaySec / 3600) * 150);
  const inr = (usd * 85).toLocaleString("en-IN");
  const total = data ? Math.round(data.combined.totalSeconds / 3600) : 42;
  const streak = data?.combined.flowStreak ?? 12;
  const annual = usd * 1800 / 150;
  const pct = Math.min((annual / 300000) * 100, 100);

  return (
    <div className="hp">
      <header className="hp-top">
        <Link href="/home" className="hp-brand">
          <span className="hp-mark">F</span>
          <span>Flow State</span>
        </Link>
        <Link href="/" className="hp-open">
          Open dashboard →
        </Link>
      </header>

      <section className="hp-hero">
        <div className="hp-hero-left">
          <div className="hp-kicker">two friends · one leaderboard · zero excuses</div>
          <h1 className="hp-title">
            Refuse the bench.
            <br />
            <em>Bill like you live in SF.</em>
          </h1>
          <p className="hp-sub">
            a self-hosted developer analytics tracker with a live presence layer. your hours are
            priced at SF rates, your streak is public, and the service companies stay mad.
          </p>
          <div className="hp-cta">
            <Link href="/" className="hp-btn">
              Open the dashboard →
            </Link>
            <a href="#the-money" className="hp-link">
              see the math ↓
            </a>
          </div>
          <div className="hp-ledger">
            <span>focus {total}h · 7d</span>
            <span className="hp-ledger-sep">/</span>
            <span>streak {streak}d</span>
            <span className="hp-ledger-sep">/</span>
            <span>≈ ${usd} · ₹{inr} today</span>
          </div>
        </div>
        <div className="hp-hero-clock">
          <SfClockHero />
        </div>
      </section>

      <div className="hp-marquee" aria-hidden>
        <div className="hp-marquee-track">
          {[...BENCH, ...BENCH].map((m, i) => (
            <span className="hp-marquee-item" key={i}>
              {m}
              <span className="hp-marquee-dot">·</span>
            </span>
          ))}
        </div>
      </div>

      <section className="hp-sec" id="the-money">
        <div className="hp-sec-label">
          <span>01</span> the money
        </div>
        <div className="hp-ladder">
          <div className="hp-ladder-bar">
            <div className="hp-ladder-fill" style={{ width: `${pct}%` }} />
            <div className="hp-ladder-marker" style={{ left: `calc(${pct}% - 3px)` }} />
            {[
              { v: "₹4L", l: "mass recruiter" },
              { v: "₹36L", l: "product co" },
              { v: "$150k", l: "google L4" },
              { v: "$250k", l: "meta E5" },
              { v: "$300k+", l: "L5 · SF" },
            ].map((r, i) => (
              <div
                key={r.v}
                className="hp-ladder-rung"
                style={{ left: `${(i / 4) * 100}%` }}
              >
                <div className="hp-ladder-tick" />
                <div className="hp-ladder-v">{r.v}</div>
                <div className="hp-ladder-l">{r.l}</div>
              </div>
            ))}
          </div>
          <div className="hp-ladder-foot">
            your flow pace ≈ ${annual.toLocaleString()}/yr —{" "}
            {pct >= 95
              ? "the ladder has nowhere left to go."
              : pct >= 60
                ? "above the bench. keep climbing."
                : "the bench is below you now. don't look down."}
          </div>
        </div>
      </section>

      <section className="hp-sec">
        <div className="hp-sec-label">
          <span>02</span> the gauntlet
        </div>
        <div className="hp-comps">google · meta · openai · anthropic</div>
        <div className="hp-gauntlet">
          {ROUNDS.map((r, i) => (
            <div key={r.n} className={`hp-gr ${i === round ? "cur" : ""}`}>
              <span className="hp-gr-i">{String(i + 1).padStart(2, "0")}</span>
              <span className="hp-gr-n">{r.n}</span>
              <span className="hp-gr-l">{r.l}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="hp-sec">
        <div className="hp-sec-label">
          <span>03</span> the streak
        </div>
        <div className="hp-bounty">
          {MILESTONES.map((m) => {
            const on = m.d <= streak;
            const next = !on && MILESTONES.find((x) => x.d > streak) === m;
            return (
              <div key={m.d} className={`hp-bn ${on ? "on" : ""} ${next ? "next" : ""}`}>
                <div className="hp-bn-d">{m.d}d</div>
                <div className="hp-bn-l">{m.l}</div>
                <div className="hp-bn-s">{on ? "claimed" : next ? "next up" : "locked"}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="hp-sec">
        <div className="hp-sec-label">
          <span>04</span> the score
        </div>
        <div className="hp-score">
          <div className="hp-score-side">
            <div className="hp-score-name">the bench</div>
            <div className="hp-score-v dim">∞</div>
            <div className="hp-score-sub">appreciation units · ₹800/hr</div>
          </div>
          <div className="hp-score-vs">vs</div>
          <div className="hp-score-side">
            <div className="hp-score-name">you</div>
            <div className="hp-score-v">${usd}</div>
            <div className="hp-score-sub">₹{inr} today · real money</div>
          </div>
        </div>
        <div className="hp-score-foot">the scoreboard says: the bench is losing on purpose</div>
      </section>

      <section className="hp-end">
        <h2 className="hp-end-title">
          You vs the bench.
          <br />
          <em>Pick a side.</em>
        </h2>
        <Link href="/" className="hp-btn hp-end-btn">
          Open the dashboard →
        </Link>
      </section>

      <footer className="hp-foot">
        <div className="hp-foot-brand">
          <span className="hp-mark">F</span> Flow State
        </div>
        <div className="hp-foot-line">self-hosted · presence layer · zero excuses</div>
        <Link href="/" className="hp-link">
          go to the dashboard →
        </Link>
      </footer>
    </div>
  );
}
