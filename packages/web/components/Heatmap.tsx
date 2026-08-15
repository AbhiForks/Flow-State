"use client";

import { useMemo, useState } from "react";
import type { DayBucket } from "@/lib/api";
import { fmtHM } from "@/lib/format";

function buildGrid(byDay: DayBucket[], weeks: number) {
  const map = new Map(byDay.map((d) => [d.date, d.seconds]));
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  let start = new Date(end);
  start.setDate(end.getDate() - (weeks * 7 - 1));
  start.setDate(start.getDate() - start.getDay());

  const cells: { date: string; seconds: number; inRange: boolean }[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const iso = cur.toISOString().slice(0, 10);
    cells.push({ date: iso, seconds: map.get(iso) ?? 0, inRange: true });
    cur.setDate(cur.getDate() + 1);
  }
  const cols: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7));
  return cols;
}

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

export function Heatmap({ byDay, weeks = 16 }: { byDay: DayBucket[]; weeks?: number }) {
  const cols = useMemo(() => buildGrid(byDay, weeks), [byDay, weeks]);
  const [tip, setTip] = useState<{ x: number; y: number; date: string; sec: number } | null>(null);

  const max = Math.max(...byDay.map((d) => d.seconds).filter((s) => s > 0), 1);
  const q = (p: number) => max * p;
  function level(s: number) {
    if (s <= 0) return 0;
    if (s <= q(0.25)) return 1;
    if (s <= q(0.5)) return 2;
    if (s <= q(0.75)) return 3;
    return 4;
  }

  const total = byDay.reduce((a, b) => a + b.seconds, 0);

  return (
    <div>
      <div className="heat-wrap" onMouseLeave={() => setTip(null)}>
        <div className="heat-days">
          {DAY_LABELS.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
        <div className="heat">
          {cols.map((col, ci) => (
            <div className="heat-col" key={ci}>
              {col.map((c) => (
                <div
                  key={c.date}
                  className="heat-cell"
                  data-lvl={level(c.seconds)}
                  onMouseEnter={(e) => setTip({ x: e.clientX, y: e.clientY, date: c.date, sec: c.seconds })}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="legend">
        <span className="legend-item">less</span>
        {[1, 2, 3, 4].map((l) => (
          <span key={l} className="legend-item">
            <span className="swatch" style={{ background: `rgba(214, 242, 126, ${[0.16, 0.34, 0.58, 1][l - 1]})` }} />
          </span>
        ))}
        <span className="legend-item">more</span>
        <span className="legend-item faint" style={{ marginLeft: "auto" }}>
          {fmtHM(total)} in range
        </span>
      </div>
      {tip && (
        <div className="tip" style={{ left: tip.x, top: tip.y }}>
          <div className="t-date">{tip.date}</div>
          <div className="t-val">{fmtHM(tip.sec)}</div>
        </div>
      )}
    </div>
  );
}
