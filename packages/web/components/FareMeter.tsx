"use client";

import { useEffect, useRef, useState } from "react";

const USD_PER_SEC = 150 / 3600;
const USD_TO_INR = 85;

const CAPTIONS = [
  "same hour billed ₹800/hr on a service bench",
  "SF rent ≈ ₹4L/month — your flow covers it",
  "SF brunch ≈ ₹4,200 — your today pays for the week",
  "walk to your desk: 10 steps. an SF commute: 1hr + $8 coffee",
  "SF parking ≈ ₹7k/day — your setup is free and air-conditioned",
  "matcha in SF: $9. chai at home: ₹20. same brain, better fuel",
  "₹40k/mo rent in Bangalore vs ₹4L/mo in SF — the gap is the market, not you",
];

export function FareMeter({ todaySec }: { todaySec: number }) {
  const mount = useRef(Date.now());
  const [usd, setUsd] = useState(todaySec * USD_PER_SEC);
  const [c, setC] = useState(0);

  useEffect(() => {
    mount.current = Date.now();
    const id = setInterval(() => {
      setUsd(todaySec + ((Date.now() - mount.current) / 1000) * USD_PER_SEC);
    }, 250);
    return () => clearInterval(id);
  }, [todaySec]);

  useEffect(() => {
    const id = setInterval(() => setC((v) => (v + 1) % CAPTIONS.length), 6500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fare">
      <div className="fare-left">
        <div className="fare-label">
          <span className="pulse-dot" />
          billing live
        </div>
        <div className="fare-sub">your flow at SF comp rates — $150/hr</div>
      </div>
      <div className="fare-num">${usd.toFixed(2)}</div>
      <div className="fare-right">
        <div className="fare-inr">₹{Math.round(usd * USD_TO_INR).toLocaleString("en-IN")}</div>
        <div className="fare-sub" key={c}>
          {CAPTIONS[c]!}
        </div>
      </div>
    </div>
  );
}
