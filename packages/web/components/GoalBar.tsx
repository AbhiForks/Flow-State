import { fmtDuration } from "@/lib/format";

const DAILY_GOAL = 4 * 3600;

export function GoalBar({ todaySec }: { todaySec: number }) {
  const pct = Math.min((todaySec / DAILY_GOAL) * 100, 100);
  const { value, unit } = fmtDuration(todaySec);
  const label = unit === "min" ? `${value}m` : `${value}${unit}`;
  const done = todaySec >= DAILY_GOAL;
  const usd = Math.round((todaySec / 3600) * 150);

  return (
    <div className="goal">
      <div className="goal-track">
        <div className="goal-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="goal-meta">
        <span>{label}</span>
        <span className="goal-sep">/</span>
        <span>4h daily goal</span>
        {done && <span className="goal-done">hit — beast mode</span>}
        <span className="goal-amt">≈ ${usd}</span>
      </div>
    </div>
  );
}
