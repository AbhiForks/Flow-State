import { Sparkline } from "./Sparkline";

export function KpiCard({
  label,
  value,
  unit,
  foot,
  spark,
  accent = false,
}: {
  label: string;
  value: string;
  unit?: string;
  foot?: React.ReactNode;
  spark?: number[];
  accent?: boolean;
}) {
  return (
    <div className="card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={accent ? { color: "var(--accent)" } : undefined}>
        {value}
        {unit ? <span className="u">{unit}</span> : null}
      </div>
      {foot ? <div className="kpi-foot">{foot}</div> : null}
      {spark && spark.length > 1 ? <Sparkline data={spark} /> : null}
    </div>
  );
}
