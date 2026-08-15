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
  start.setDate(start.getDate() - start.getDay()); // back to Sunday

  const cells: { date: string; seconds: number; inRange: boolean }[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const iso = cur.toISOString().slice(0, 10);
    cells.push({ date: iso, seconds: map.get(iso) ?? 0, inRange: cur <= end });
    cur.setDate(cur.getDate() + 1);
  }
  const cols: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7));
  return cols;
}

export function Heatmap({ byDay, weeks = 16 }: { byDay: DayBucket[]; weeks?: number }) {
  const cols = useMemo(() => buildGrid(byDay, weeks), [byDay, weeks]);
  const [tip, setTip] = useState<{ x: number; y: number; date: string; sec: number } | null>(null);

  const pos = byDay.map((d) => d.seconds).filter((s) => s > 0);
  const max = Math.max(...pos, 1);
  const q = (p: number) => (max * p);
  function level(s: number) {
    if (s <= 0) return 0;
    if (s <= q(0.25)) return 1;
    if (s <= q(0.5)) return 2;
    if (s <= q(0.75)) return 3;
    return 4;
  }

  return (
    <div className="heat" onMouseLeave={() => setTip(null)}>
      {cols.map((col, ci) => (
        <div className="heat-col" key={ci}>
          {col.map((c) => (
            <div
              key={c.date}
              className="heat-cell"
              data-lvl={c.inRange ? level(c.seconds) : -1}
              style={c.inRange ? undefined : { visibility: "hidden" }}
              onMouseEnter={(e) => setTip({ x: e.clientX, y: e.clientY, date: c.date, sec: c.seconds })}
            />
          ))}
        </div>
      ))}
      {tip && (
        <div className="tip" style={{ left: tip.x, top: tip.y }}>
          <div className="t-date">{tip.date}</div>
          <div className="t-val">{fmtHM(tip.sec)}</div>
        </div>
      )}
    </div>
  );
}
