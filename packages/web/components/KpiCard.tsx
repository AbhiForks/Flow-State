"use client";

import { Sparkline } from "./Sparkline";
import { useCountUp } from "@/hooks/useCountUp";

export function KpiCard({
  label,
  value,
  unit,
  foot,
  spark,
  accent = false,
  animate = false,
}: {
  label: string;
  value: string;
  unit?: string;
  foot?: React.ReactNode;
  spark?: number[];
  accent?: boolean;
  animate?: boolean;
}) {
  const count = useCountUp(parseFloat(value) || 0, 1100);
  const display = animate && /^\d+(\.\d+)?$/.test(value) ? String(count) : value;

  return (
    <div className={`card kpi ${accent ? "accent" : ""}`}>
      <div className="kpi-label">
        {label}
        {spark && spark.length > 1 && (
          <svg width="36" height="10" viewBox="0 0 36 10">
            <Sparkline data={spark} height={10} width={36} />
          </svg>
        )}
      </div>
      <div className="kpi-value">
        {display}
        {unit ? <span className="u">{unit}</span> : null}
      </div>
      {foot ? <div className="kpi-foot">{foot}</div> : null}
    </div>
  );
}
