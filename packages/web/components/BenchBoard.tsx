export function BenchBoard({ usd, inr }: { usd: number; inr: string }) {
  return (
    <section className="card hp-card board">
      <div className="section-head">
        <div className="section-title">Appreciation units</div>
        <div className="section-note">scoreboard</div>
      </div>
      <div className="board">
        <div className="board-side dim">
          <div className="board-name">the bench</div>
          <div className="board-score">∞</div>
          <div className="board-sub">appreciation units · ₹800/hr</div>
        </div>
        <div className="board-vs">vs</div>
        <div className="board-side accent">
          <div className="board-name">you</div>
          <div className="board-score">${usd}</div>
          <div className="board-sub">₹{inr} today · real money</div>
        </div>
      </div>
      <div className="board-foot">scoreboard says: the bench is losing on purpose</div>
    </section>
  );
}
