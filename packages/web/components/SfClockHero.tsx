"use client";

import { useEffect, useState } from "react";

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
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
});

const R = 100;
const C = 2 * Math.PI * R;

function sfParts(date: Date) {
  const p = Object.fromEntries(fmtParts.formatToParts(date).map((x) => [x.type, x.value]));
  return {
    hour: Number(p.hour ?? "0"),
    minute: Number(p.minute ?? "0"),
    second: Number(p.second ?? "0"),
  };
}

function stage(hour: number): string {
  if (hour < 7) return "asleep";
  if (hour < 9) return "waking up";
  if (hour < 10.5) return "morning standup";
  if (hour < 12.5) return "deep work";
  if (hour < 13.5) return "at lunch";
  if (hour < 16) return "sprinting";
  if (hour < 17.5) return "happy hour";
  if (hour < 20) return "wrapping up";
  return "asleep";
}

export function SfClockHero() {
  const [now, setNow] = useState(() => new Date());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const p = ready ? sfParts(now) : { hour: 0, minute: 0, second: 0 };
  const h24 = p.hour + p.minute / 60 + p.second / 3600;
  const angle = (h24 / 24) * 360;
  const night = p.hour >= 20 || p.hour < 7;
  const state = stage(p.hour);

  const dayLen = (13 / 24) * C;
  const dayOff = -(7 / 24) * C;
  const nightLen = (11 / 24) * C;
  const nightOff = -(20 / 24) * C;

  const ticks = Array.from({ length: 24 }, (_, h) => {
    const a = ((h % 24) / 24) * 360 - 90;
    const r = (a * Math.PI) / 180;
    const q = (n: number) => Math.round(n * 100) / 100;
    return {
      h,
      x1: q(140 + 106 * Math.cos(r)),
      y1: q(140 + 106 * Math.sin(r)),
      x2: q(140 + 110 * Math.cos(r)),
      y2: q(140 + 110 * Math.sin(r)),
      cur: h === p.hour,
    };
  });

  return (
    <div className={`hpc ${night ? "hpc-night" : "hpc-day"}`} title={ready ? `SF is ${state}` : "San Francisco"}>
      <svg className="hpc-svg" width="190" height="190" viewBox="0 0 280 280">
        <defs>
          <linearGradient id="hpcDayArc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d6f27e" />
            <stop offset="100%" stopColor="#7eb3ff" />
          </linearGradient>
        </defs>
        <circle cx="140" cy="140" r="100" className="hpc-track" />
        <circle
          cx="140"
          cy="140"
          r="100"
          className="hpc-arc-night"
          strokeDasharray={`${nightLen} ${C - nightLen}`}
          strokeDashoffset={nightOff}
          transform="rotate(-90 140 140)"
        />
        <circle
          cx="140"
          cy="140"
          r="100"
          className="hpc-arc-day"
          stroke="url(#hpcDayArc)"
          strokeDasharray={`${dayLen} ${C - dayLen}`}
          strokeDashoffset={dayOff}
          transform="rotate(-90 140 140)"
        />
        {ticks.map((t) => (
          <line
            key={t.h}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            className={t.cur ? "hpc-tick hpc-tick-cur" : "hpc-tick"}
          />
        ))}
        <g className="hpc-hand" transform={`rotate(${angle} 140 140)`}>
          <circle cx="140" cy="40" r="6.5" className="hpc-dot" />
        </g>
        <g className="hpc-glyph">
          {night ? (
            <>
              <circle cx="140" cy="140" r="17" fill="#7eb3ff" />
              <circle cx="146" cy="135" r="17" fill="#0a0a0c" />
            </>
          ) : (
            <>
              <circle cx="140" cy="140" r="13" fill="#d6f27e" />
              {Array.from({ length: 12 }, (_, k) => {
                const a = (k / 12) * 2 * Math.PI;
                return (
                  <line
                    key={k}
                    x1={140 + 20 * Math.cos(a)}
                    y1={140 + 20 * Math.sin(a)}
                    x2={140 + 26 * Math.cos(a)}
                    y2={140 + 26 * Math.sin(a)}
                    stroke="#d6f27e"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    opacity="0.75"
                  />
                );
              })}
            </>
          )}
        </g>
      </svg>
      <div className="hpc-info">
        <div className="hpc-city">San Francisco</div>
        <div className="hpc-time">{ready ? fmtTime.format(now) : "--:--:--"}</div>
        <div className="hpc-state">
          <span className="hpc-dot" />
          {ready ? `${state} · ${fmtDay.format(now)}` : ""}
        </div>
      </div>
    </div>
  );
}
