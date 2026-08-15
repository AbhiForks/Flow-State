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

export function DailyChart({ byDay, days }: { byDay: DayBucket[]; days: number }) {
  const map = useMemo(() => new Map(byDay.map((d) => [d.date, d.seconds])), [byDay]);
  const series = useMemo(() => dateList(days).map((date) => map.get(date) ?? 0), [days, map]);
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const W = 720;
  const H = 260;
  const padL = 38;
  const padR = 12;
  const padT = 14;
  const padB = 26;
  const maxSec = Math.max(...series, 3600);
  const maxH = Math.ceil(maxSec / 3600);
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const step = innerW / (series.length - 1 || 1);

  const x = (i: number) => padL + i * step;
  const y = (s: number) => padT + innerH - (s / (maxH * 3600)) * innerH;

  const line = series.map((s, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(s).toFixed(1)}`).join(" ");
  const area = `${line} L${x(series.length - 1).toFixed(1)},${padT + innerH} L${padL},${padT + innerH} Z`;

  const ticks = Array.from({ length: maxH + 1 }, (_, i) => i);

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
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t * 3600)} y2={y(t * 3600)} stroke="var(--line)" strokeWidth={1} />
            <text x={padL - 8} y={y(t * 3600) + 3} textAnchor="end" fontSize={10} fill="var(--text-faint)" fontFamily="var(--mono)">
              {t}h
            </text>
          </g>
        ))}
        <path d={area} fill="url(#dg)" />
        <path d={line} fill="none" stroke="var(--accent)" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + innerH} stroke="var(--line-2)" strokeWidth={1} />
            <circle cx={x(hover)} cy={y(series[hover]!)} r={3.5} fill="var(--accent)" stroke="#0a0a0b" strokeWidth={1.5} />
          </g>
        )}
      </svg>
      {hover !== null && pos && (
        <div className="tip" style={{ left: pos.x, top: pos.y }}>
          <div className="t-date">{dateList(days)[hover]}</div>
          <div className="t-val">{fmtHM(series[hover]!)}</div>
        </div>
      )}
    </div>
  );
}
