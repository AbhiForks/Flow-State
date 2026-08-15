"use client";

import { useEffect, useMemo, useState } from "react";

const BIRTHDAYS: Record<string, string> = {
  Abhilash: "12 Dec 2004",
  Roshan: "23 Nov 2003",
};

function age(name: string): number | null {
  const b = BIRTHDAYS[name];
  if (!b) return null;
  const [d, mon, y] = b.split(" ");
  const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(mon!);
  const now = new Date();
  let a = now.getFullYear() - Number(y);
  if (now.getMonth() < m || (now.getMonth() === m && now.getDate() < Number(d))) a--;
  return a;
}

export function MotivationStrip({
  todaySec,
  streak,
  youName,
  friendName,
  friendDeltaSec,
  activeDays,
  range,
}: {
  todaySec: number;
  streak: number;
  youName: string;
  friendName: string | null;
  friendDeltaSec: number;
  activeDays: number;
  range: number;
}) {
  const phrases = useMemo(() => {
    const out: string[] = [];
    const h = Math.floor(todaySec / 3600);
    const m = Math.floor((todaySec % 3600) / 60);
    const todayStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

    const yAge = age(youName);
    const fAge = friendName ? age(friendName) : null;
    const older = yAge !== null && fAge !== null ? (yAge >= fAge ? youName : friendName) : null;
    const younger = yAge !== null && fAge !== null ? (yAge >= fAge ? friendName : youName) : null;
    const gap = yAge !== null && fAge !== null ? Math.abs(yAge - fAge) : null;

    if (todaySec > 0) {
      out.push(`${todayStr} in flow today — the bench would call this a quarter's worth.`);
    }
    if (streak > 0) out.push(`streak ${streak}d — the top 1% just show up daily.`);
    if (friendName && Math.abs(friendDeltaSec) >= 60) {
      const mins = Math.abs(Math.round(friendDeltaSec / 60));
      out.push(
        friendDeltaSec > 0
          ? `you're ${mins}m ahead of ${friendName}. widen it.`
          : `${friendName} is ${mins}m up — one deep session flips it.`,
      );
    }
    if (activeDays > 0) out.push(`${activeDays}/${range} active days. consistency compounds harder than talent.`);
    if (yAge !== null && fAge !== null && older && younger && gap) {
      out.push(`${older} (${gap}yr older) has a head start on earth, not on skill. ${younger} can still catch the offer first.`);
      out.push(`${younger} is cracking product companies while ${older} finishes another year of being 'coachable'.`);
    }
    out.push("your notice period at a mass recruiter: 90 days. at a product company: 'when can you start?'");
    out.push("₹40L vs ₹4L a year — the gap isn't skill, it's which interview you sat for.");
    out.push("your ₹20 chai fuels the same focus SF pays $150/hr for.");
    return out;
  }, [todaySec, streak, youName, friendName, friendDeltaSec, activeDays, range]);

  const [i, setI] = useState(0);

  useEffect(() => {
    if (phrases.length <= 1) return;
    const id = setInterval(() => setI((v) => (v + 1) % phrases.length), 6500);
    return () => clearInterval(id);
  }, [phrases.length]);

  return (
    <div className="mote">
      <span className="mote-tag">flow note</span>
      <span className="mote-text" key={i}>
        {phrases[i] ?? ""}
      </span>
    </div>
  );
}
