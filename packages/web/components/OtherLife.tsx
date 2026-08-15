"use client";

import { useEffect, useState } from "react";

const ITEMS = [
  "4 dinners at a Michelin-starred spot in the Mission",
  "1/5 of a room in SF with a view of the bridge",
  "3 Waymo rides across the city, no driver, no drama",
  "a month of oat-milk lattes at Blue Bottle",
  "12 burritos at La Taqueria (your treat)",
  "a climbing gym membership for 3 months",
  "2 rooftop happy hours with the team that pays you",
  "half a flight to NYC to visit the office",
];

const LOOPS = [
  "Google: 5 rounds deep — one whiteboard DP even the staff engineer can't solve",
  "Meta: coding + 5 'tell me about a time you owned it' stories. prep all five",
  "OpenAI: they ask about your most impressive build. make the answer true",
  "Anthropic: 'describe a frontier model behavior you find concerning' — real question",
  "Google: 'not googley enough' is a literal rejection reason. bring personality",
  "Meta: every answer must end with '…and I owned the outcome'",
  "OpenAI: 5 rounds with staff engineers — your Sunday grinds are the prep",
  "Anthropic: 'what would make you refuse to ship this?' — think about it now",
];

export function OtherLife({ todaySec }: { todaySec: number }) {
  const usd = Math.round(((todaySec / 3600) * 150) / 5) * 5;
  const [i, setI] = useState(0);
  const [j, setJ] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % ITEMS.length), 4500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setJ((v) => (v + 1) % LOOPS.length), 7200);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="card other-life">
      <div className="ol-skyline" aria-hidden>
        <svg viewBox="0 0 400 80" preserveAspectRatio="none">
          <g className="ol-buildings">
            <rect x="0" y="46" width="22" height="34" />
            <rect x="24" y="30" width="18" height="50" />
            <rect x="44" y="52" width="26" height="28" />
            <rect x="72" y="22" width="16" height="58" />
            <rect x="90" y="40" width="30" height="40" />
            <rect x="122" y="14" width="14" height="66" />
            <rect x="138" y="36" width="24" height="44" />
            <rect x="164" y="26" width="20" height="54" />
            <rect x="186" y="48" width="28" height="32" />
            <rect x="216" y="18" width="16" height="62" />
            <rect x="234" y="42" width="22" height="38" />
            <rect x="258" y="30" width="18" height="50" />
            <path className="ol-bridge" d="M292 80 C 302 24, 322 24, 332 80" />
            <path className="ol-bridge" d="M296 80 C 304 36, 320 36, 328 80" />
            <rect x="282" y="44" width="3" height="36" />
            <rect x="327" y="44" width="3" height="36" />
            <rect x="334" y="56" width="30" height="24" />
            <rect x="366" y="40" width="14" height="40" />
            <rect x="382" y="52" width="18" height="28" />
          </g>
          <g className="ol-lights">
            <rect x="12" y="58" width="3" height="3" />
            <rect x="30" y="42" width="3" height="3" />
            <rect x="35" y="56" width="3" height="3" />
            <rect x="52" y="62" width="3" height="3" />
            <rect x="78" y="34" width="3" height="3" />
            <rect x="104" y="52" width="3" height="3" />
            <rect x="110" y="60" width="3" height="3" />
            <rect x="128" y="26" width="3" height="3" />
            <rect x="133" y="48" width="3" height="3" />
            <rect x="148" y="50" width="3" height="3" />
            <rect x="170" y="38" width="3" height="3" />
            <rect x="176" y="58" width="3" height="3" />
            <rect x="194" y="58" width="3" height="3" />
            <rect x="222" y="30" width="3" height="3" />
            <rect x="228" y="52" width="3" height="3" />
            <rect x="240" y="54" width="3" height="3" />
            <rect x="264" y="42" width="3" height="3" />
            <rect x="344" y="66" width="3" height="3" />
            <rect x="372" y="52" width="3" height="3" />
          </g>
        </svg>
      </div>
      <div className="section-head">
        <div className="section-title">The other life</div>
        <div className="section-note">what today buys in SF</div>
      </div>
      <div className="ol-value">${usd}</div>
      <div className="ol-item" key={i}>
        ≈ {ITEMS[i]}
      </div>
      <div className="ol-sep" />
      <div className="ol-next" key={`n${j}`}>
        <span className="ol-arrow">→</span>
        {LOOPS[j]}
      </div>
      <div className="ol-foot">the bench pays in &ldquo;great effort&rdquo; slips</div>
    </section>
  );
}
