"use client";

import type { UserSummary } from "@/lib/api";
import { fmtHM } from "@/lib/format";
import { Avatar } from "@/components/Avatar";
import { useCountUp } from "@/hooks/useCountUp";

function Bar({ name, seconds, max, friend }: { name: string; seconds: number; max: number; friend?: boolean }) {
  const w = useCountUp(max > 0 ? Math.round((seconds / max) * 100) : 0, 1000);
  return (
    <div className="vs-row">
      <Avatar name={name} size="sm" />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span className="name">{name}</span>
          <span className="val">{fmtHM(seconds)}</span>
        </div>
        <div className="vs-bar">
          <div className={`fill ${friend ? "friend" : ""}`} style={{ width: `${w}%` }}>
            {seconds > 0 ? `${w}%` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Compare({ you, friend, range }: { you: UserSummary; friend: UserSummary; range: number }) {
  const max = Math.max(you.totalSeconds, friend.totalSeconds, 1);
  const delta = Math.abs(you.totalSeconds - friend.totalSeconds);
  const leader = you.totalSeconds >= friend.totalSeconds ? you : friend;
  const pct = Math.round((delta / max) * 100);

  return (
    <section className="card compare">
      <div className="compare-vs">
        <div className="vs-title">
          <Avatar name={you.name} size="sm" />
          <span>{you.name}</span>
          <span className="vs-title-sep">vs</span>
          <span>{friend.name}</span>
          <Avatar name={friend.name} size="sm" />
        </div>
        <div className="vs-delta">
          {delta === 0 ? (
            "Dead even — as it should be."
          ) : (
            <>
              <b>{leader.name}</b> is ahead by {fmtHM(delta)} ({pct}% of the range total)
            </>
          )}
        </div>
        <div className="section-note" style={{ color: "var(--faint)", textTransform: "none", fontFamily: "var(--font-mono)", fontSize: 11 }}>
          focus time, last {range} days · friendly rivalry only
        </div>
        <div className="vs-burn">
          at bench rates (₹800/hr) this sprint bills ₹
          {Math.round(((you.totalSeconds + friend.totalSeconds) / 3600) * 800).toLocaleString("en-IN")} —
          you're pricing yourselves wrong.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
        <Bar name={you.name} seconds={you.totalSeconds} max={max} />
        <Bar name={friend.name} seconds={friend.totalSeconds} max={max} friend />
      </div>
    </section>
  );
}
