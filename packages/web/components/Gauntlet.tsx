"use client";

import { useEffect, useState } from "react";

const COMPANIES = ["Google", "Meta", "OpenAI", "Anthropic"];

const ROUNDS = [
  { n: "recruiter", line: "'expected TC?' — say the number without flinching" },
  { n: "phone screen", line: "live coding in a shared doc. no autocomplete" },
  { n: "coding", line: "a whiteboard DP even the staff engineer can't solve" },
  { n: "system design", line: "scale your weekend project to 1B users. casually" },
  { n: "behavioral", line: "5 stories where you 'owned the outcome'" },
  { n: "team match", line: "pray they don't read your commit times" },
];

export function Gauntlet() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % ROUNDS.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="card hp-card gauntlet">
      <div className="section-head">
        <div className="section-title">The gauntlet</div>
        <div className="section-note">every round, mocked</div>
      </div>
      <div className="g-comp">
        {COMPANIES.map((c) => (
          <span key={c} className="g-chip">
            {c}
          </span>
        ))}
      </div>
      <div className="g-list">
        {ROUNDS.map((r, k) => (
          <div key={k} className={`g-row ${k === i ? "g-cur" : ""}`}>
            <span className="g-dot" />
            <span className="g-n">{r.n}</span>
            <span className="g-line">{r.line}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
