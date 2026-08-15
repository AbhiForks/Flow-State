const MILESTONES = [
  { d: 3, l: "interview prep unlocked" },
  { d: 7, l: "system design grind" },
  { d: 14, l: "onsite week" },
  { d: 21, l: "offer negotiation" },
  { d: 30, l: "TC reset" },
];

export function StreakBounty({ streak }: { streak: number }) {
  const claimed = MILESTONES.filter((m) => m.d <= streak).length;
  const next = MILESTONES.find((m) => m.d > streak);

  return (
    <section className="card hp-card bounty">
      <div className="section-head">
        <div className="section-title">Streak bounty</div>
        <div className="section-note">
          streak {streak}d · {claimed}/{MILESTONES.length} claimed
        </div>
      </div>
      <div className="bounty-row">
        {MILESTONES.map((m) => {
          const on = m.d <= streak;
          const isNext = m === next;
          return (
            <div key={m.d} className={`bounty-tile ${on ? "on" : ""} ${isNext ? "next" : ""}`}>
              <div className="bounty-d">{m.d}d</div>
              <div className="bounty-l">{m.l}</div>
              <div className="bounty-state">{on ? "claimed" : isNext ? "next up" : "locked"}</div>
            </div>
          );
        })}
      </div>
      <div className="bounty-foot">
        {next ? `keep the streak — ${next.d}d unlocks "${next.l}".` : "all claimed. go get the bag."}
      </div>
    </section>
  );
}
