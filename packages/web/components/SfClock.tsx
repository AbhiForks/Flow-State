"use client";

import { useEffect, useMemo, useState } from "react";

const fmtTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

const fmtDay = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  weekday: "short",
  month: "short",
  day: "numeric",
});

const fmtParts = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  weekday: "long",
  hour: "numeric",
  hour12: false,
});

const RING_R = 38;
const C = 2 * Math.PI * RING_R;

function sfParts(date: Date) {
  const p = Object.fromEntries(fmtParts.formatToParts(date).map((x) => [x.type, x.value]));
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    weekday: p.weekday ?? "",
    hour: Number(p.hour ?? "0"),
  };
}

function holiday(p: { year: number; month: number; day: number; weekday: string }): string | null {
  if (p.month === 1 && p.day === 1) return "hungover";
  if (p.month === 2 && p.weekday === "Sunday" && p.day >= 8 && p.day <= 14) return "on the Super Bowl";
  if (p.month === 7 && p.day === 4) return "BBQing";
  if (p.month === 10 && p.day === 31) return "in a costume";
  if (p.month === 11 && p.day >= 22 && p.day <= 28 && p.weekday === "Thursday") return "on turkey duty";
  if (p.month === 12 && p.day === 25) return "off for Christmas";
  if (p.weekday === "Sunday") return "brunching";
  return null;
}

function stage(p: { hour: number }): string {
  if (p.hour < 7) return "asleep";
  if (p.hour < 9) return "waking up";
  if (p.hour < 10.5) return "morning standup";
  if (p.hour < 12.5) return "deep work";
  if (p.hour < 13.5) return "at lunch";
  if (p.hour < 16) return "sprinting";
  if (p.hour < 17.5) return "happy hour";
  if (p.hour < 20) return "wrapping up";
  return "asleep";
}

const FLAVOR = [
  "in a standup",
  "on a coffee run",
  "fighting a merge conflict",
  "naming a branch",
  "arguing about tabs",
  "writing a RFC for a footer",
  "on a call that could've been an email",
  "trying to get the printer to work",
  "grinding a Google hard",
  "on hold with an OpenAI recruiter",
  "rehearsing a Meta behavioral",
  "waiting on an Anthropic email",
  "coding a live interview round",
];

export function SfClock() {
  const [now, setNow] = useState(() => new Date());
  const [ready, setReady] = useState(false);
  const [flavor, setFlavor] = useState<string | null>(null);

  useEffect(() => {
    setReady(true);
    setFlavor(Math.random() < 0.12 ? FLAVOR[Math.floor(Math.random() * FLAVOR.length)] : null);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const p = ready ? sfParts(now) : { hour: 0, minute: 0, second: 0, weekday: "", month: 1, day: 1, year: 2024 };
  const holi = holiday(p);
  const night = p.hour >= 20 || p.hour < 7;
  const state = holi ?? stage(p);
  const title = ready
    ? holi
      ? `SF is ${holi}`
      : night
        ? "SF is asleep — everyone's asleep while you grind. go take the money."
        : `SF is ${state} — the market's open. bill accordingly.`
    : "San Francisco";

  const dayLen = (13 / 24) * C;
  const dayOff = -(7 / 24) * C;
  const nightLen = (11 / 24) * C;
  const nightOff = -(20 / 24) * C;
  const ang = ((p.hour % 24) / 24) * 360 - 90;
  const rad = (ang * Math.PI) / 180;
  const dotX = Math.round((48 + RING_R * Math.cos(rad)) * 100) / 100;
  const dotY = Math.round((48 + RING_R * Math.sin(rad)) * 100) / 100;
  const ticks = Array.from({ length: 24 }, (_, h) => {
    const a = ((h % 24) / 24) * 360 - 90;
    const r = (a * Math.PI) / 180;
    const q = (n: number) => Math.round(n * 100) / 100;
    return {
      h,
      x1: q(48 + 42 * Math.cos(r)),
      y1: q(48 + 42 * Math.sin(r)),
      x2: q(48 + 46 * Math.cos(r)),
      y2: q(48 + 46 * Math.sin(r)),
    };
  });

  return (
    <div className={`sf-panel ${night ? "sf-night" : "sf-day"}`} title={title}>
      <svg className="sf-ring" width="96" height="96" viewBox="0 0 96 96">
        <defs>
          <linearGradient id="sfDayArc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d6f27e" />
            <stop offset="100%" stopColor="#7eb3ff" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r="38" className="ring-track" />
        <circle
          cx="48"
          cy="48"
          r="38"
          className="ring-night"
          strokeDasharray={`${nightLen} ${C - nightLen}`}
          strokeDashoffset={nightOff}
          transform="rotate(-90 48 48)"
        />
        <circle
          cx="48"
          cy="48"
          r="38"
          className="ring-day"
          stroke="url(#sfDayArc)"
          strokeDasharray={`${dayLen} ${C - dayLen}`}
          strokeDashoffset={dayOff}
          transform="rotate(-90 48 48)"
        />
        {ticks.map((t) => (
          <line key={t.h} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} className={t.h === p.hour ? "tick-cur" : "tick"} />
        ))}
        <circle cx={dotX} cy={dotY} r="4.5" className="ring-dot" />
        <g className="sf-glyph">
          {night ? (
            <>
              <circle cx="48" cy="48" r="8" fill="#7eb3ff" />
              <circle cx="51.5" cy="45.5" r="8" fill="#0a0a0c" />
            </>
          ) : (
            <>
              <circle cx="48" cy="48" r="6.5" fill="#d6f27e" />
              {Array.from({ length: 8 }, (_, k) => {
                const a = (k / 8) * 360 * (Math.PI / 180);
                return (
                  <line
                    key={k}
                    x1={48 + 9.5 * Math.cos(a)}
                    y1={48 + 9.5 * Math.sin(a)}
                    x2={48 + 12.5 * Math.cos(a)}
                    y2={48 + 12.5 * Math.sin(a)}
                    stroke="#d6f27e"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                );
              })}
            </>
          )}
        </g>
      </svg>
      <div className="sf-info">
        <div className="sf-city">San Francisco</div>
        <div className="sf-time">{ready ? fmtTime.format(now) : "--:--:--"}</div>
        <div className="sf-sub">
          <span className="sf-dot" />
          {ready ? `${state} · ${fmtDay.format(now)}` : ""}
          {ready && flavor && !holi && !night ? ` · sf ${flavor}` : ""}
        </div>
      </div>
    </div>
  );
}
