const RUNGS = [
  { v: "₹4L", l: "mass recruiter" },
  { v: "₹36L", l: "product co" },
  { v: "$150k", l: "Google L4" },
  { v: "$250k", l: "Meta E5" },
  { v: "$300k+", l: "L5 SF" },
];

export function TcLadder({ usdPerHr }: { usdPerHr: number }) {
  const annual = Math.round(usdPerHr * 1800);
  const pct = Math.min((annual / 300000) * 100, 100);

  const note =
    pct >= 95
      ? "your pace ≈ $300k — the ladder has nowhere left to go."
      : pct >= 60
        ? `your flow pace ≈ $${annual.toLocaleString()}/yr. above the bench, keep climbing.`
        : "the bench is below you now — don't look down.";

  return (
    <section className="card hp-card ladder">
      <div className="section-head">
        <div className="section-title">The TC ladder</div>
        <div className="section-note">your pace vs the market</div>
      </div>
      <div className="ladder-bar">
        <div className="ladder-fill" style={{ width: `${pct}%` }} />
        <div className="ladder-marker" style={{ left: `calc(${pct}% - 8px)` }} />
        <div className="ladder-rungs">
          {RUNGS.map((r, i) => (
            <span
              key={r.v}
              className="ladder-rung"
              style={{ left: `${(i / (RUNGS.length - 1)) * 100}%` }}
              title={r.l}
            >
              {r.v}
            </span>
          ))}
        </div>
      </div>
      <div className="ladder-foot">{note}</div>
    </section>
  );
}
