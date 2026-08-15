"use client";

import { useMemo, useRef, useState } from "react";
import type { DayBucket } from "@/lib/api";
import { fmtHM } from "@/lib/format";

function dateList(days: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function shortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(`${iso}T00:00:00Z`).getUTCDay()]!;
  return `${weekday} ${d}`;
}

function smooth(points: [number, number][]): string {
  if (points.length < 2) return points.length === 1 ? `M${points[0][0]},${points[0][1]}` : "";
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

export function DailyChart({ byDay, days }: { byDay: DayBucket[]; days: number }) {
  const map = useMemo(() => new Map(byDay.map((d) => [d.date, d.seconds])), [byDay]);
  const dates = useMemo(() => dateList(days), [days]);
  const series = useMemo(() => dates.map((date) => map.get(date) ?? 0), [dates, map]);
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const W = 720;
  const H = 290;
  const padL = 40;
  const padR = 14;
  const padT = 18;
  const padB = 30;
  const maxSec = Math.max(...series, 3600);
  const maxH = Math.ceil(maxSec / 3600);
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const step = innerW / (series.length - 1 || 1);

  const x = (i: number) => padL + i * step;
  const y = (s: number) => padT + innerH - (s / (maxH * 3600)) * innerH;

  const points = series.map((s, i) => [x(i), y(s)] as [number, number]);
  const line = smooth(points);
  const area = `${line} L${x(series.length - 1).toFixed(1)},${padT + innerH} L${padL},${padT + innerH} Z`;

  const ticks = Array.from({ length: maxH + 1 }, (_, i) => i);
  const labelEvery = Math.ceil(series.length / 6);

  const active = series.filter((s) => s > 0);
  const avgSec = active.length ? Math.round(active.reduce((a, b) => a + b, 0) / active.length) : 0;
  const avgY = y(avgSec);
  const avgH = avgSec / 3600;

  function onMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const rx = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round((rx - padL) / step);
    if (idx >= 0 && idx < series.length) {
      setHover(idx);
      setPos({ x: e.clientX, y: e.clientY });
    } else {
      setHover(null);
    }
  }

  return (
    <div className="chart-wrap" ref={ref} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t * 3600)} y2={y(t * 3600)} stroke="var(--border)" strokeWidth={1} strokeDasharray="2 5" />
            <text x={padL - 9} y={y(t * 3600) + 3} textAnchor="end" fontSize={10} fill="var(--faint)" fontFamily="var(--font-mono)">
              {t}h
            </text>
          </g>
        ))}

        <path d={area} fill="url(#dg)" />
        <path className="draw-line" pathLength={1} d={line} fill="none" stroke="var(--accent)" strokeWidth={2.2} filter="url(#glow)" strokeLinecap="round" />

        {avgSec > 0 && (
          <g>
            <line x1={padL} x2={W - padR} y1={avgY} y2={avgY} stroke="var(--faint)" strokeWidth={1} strokeDasharray="4 4" opacity={0.7} />
            <text x={W - padR} y={avgY - 5} textAnchor="end" fontSize={9.5} fill="var(--faint)" fontFamily="var(--font-mono)">
              avg {avgH >= 1 ? `${avgH.toFixed(1)}h` : `${Math.round(avgSec / 60)}m`}
            </text>
          </g>
        )}

        {dates.map((date, i) =>
          i % labelEvery === 0 ? (
            <text key={date} x={x(i)} y={H - 8} textAnchor="middle" fontSize={9.5} fill="var(--faint)" fontFamily="var(--font-mono)">
              {shortDate(date)}
            </text>
          ) : null,
        )}

        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + innerH} stroke="var(--border-2)" strokeWidth={1} />
            <circle cx={x(hover)} cy={y(series[hover]!)} r={4} fill="var(--accent)" stroke="#0a0a0c" strokeWidth={2} />
            <circle cx={x(hover)} cy={y(series[hover]!)} r={8} fill="none" stroke="var(--accent)" strokeWidth={1} opacity={0.5} />
          </g>
        )}
      </svg>
      {hover !== null && pos && (
        <div className="tip" style={{ left: pos.x, top: pos.y }}>
          <div className="t-date">{dates[hover]}</div>
          <div className="t-val">{fmtHM(series[hover]!)}</div>
        </div>
      )}
    </div>
  );
}
