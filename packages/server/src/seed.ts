import { db, insertHeartbeat, upsertProfile, countHeartbeats } from "./db.js";

interface Profile {
  user: string;
  name: string;
}

const PROFILES: Profile[] = [
  { user: "abhilash", name: "Abhilash" },
  { user: "roshan", name: "Roshan" },
];

const LANGS = [
  { language: "TypeScript", weight: 5, projects: ["flowstate", "atlas-cli", "ledger-ui"] },
  { language: "Rust", weight: 3, projects: ["engine", "pulse-core"] },
  { language: "Python", weight: 3, projects: ["data-pipeline", "ml-experiments"] },
  { language: "Go", weight: 2, projects: ["gateway", "scheduler"] },
  { language: "SQL", weight: 1, projects: ["data-pipeline"] },
  { language: "Markdown", weight: 1, projects: ["wiki"] },
];

const EDITORS = ["vscode", "jetbrains"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function weightedLang() {
  const total = LANGS.reduce((s, l) => s + l.weight, 0);
  let r = Math.random() * total;
  for (const l of LANGS) {
    r -= l.weight;
    if (r <= 0) return l;
  }
  return LANGS[0]!;
}

// deterministic-ish PRNG so the demo data is stable-ish per day
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedUser(profile: Profile, dayOffset: number, rand: () => number) {
  // 1-3 coding windows that day
  const windows = 1 + Math.floor(rand() * 3);
  for (let w = 0; w < windows; w++) {
    // start between 09:00 and 20:00
    const startHour = 9 + Math.floor(rand() * 11);
    const startMin = Math.floor(rand() * 60);
    let t =
      Math.floor(Date.now() / 1000) -
      dayOffset * 86400 +
      startHour * 3600 +
      startMin * 60;
    const sessionLen = 25 + Math.floor(rand() * 95); // minutes
    const steps = Math.floor((sessionLen * 60) / 120);
    const lang = weightedLang();
    const project = pick(lang.projects);
    const editor = pick(EDITORS);
    const branch = rand() > 0.5 ? "main" : `feat/${pick(["auth", "perf", "ui", "fix"])}`;
    for (let s = 0; s < steps; s++) {
      insertHeartbeat.run(
        profile.user,
        t,
        `/home/${profile.user}/code/${project}/src/file.${ext(lang.language)}`,
        "coding",
        "file",
        lang.language,
        project,
        branch,
        editor,
        rand() > 0.6 ? 1 : 0,
      );
      t += 120;
    }
  }
}

function ext(lang: string): string {
  switch (lang) {
    case "TypeScript":
      return "ts";
    case "Rust":
      return "rs";
    case "Python":
      return "py";
    case "Go":
      return "go";
    case "SQL":
      return "sql";
    default:
      return "md";
  }
}

export function seedIfEmpty() {
  const { n } = countHeartbeats.get() as { n: number };
  if (n > 0) return;

  for (const p of PROFILES) upsertProfile.run(p.user, p.name);

  const days = 21;
  for (let d = days; d >= 0; d--) {
    for (const p of PROFILES) {
      // skip a few days to make streaks/active-days realistic
      if (d > 1 && Math.random() < 0.18) continue;
      const rand = mulberry32(d * 1000 + p.user.length * 7 + p.name.charCodeAt(0));
      seedUser(p, d, rand);
    }
  }
  console.log(`[seed] generated demo heartbeats for ${PROFILES.length} users over ${days} days`);
}
