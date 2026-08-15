// curated, muted categorical palette — avoids rainbow "slop"
const LANG_COLORS: Record<string, string> = {
  TypeScript: "#4f9dd6",
  JavaScript: "#e0b15c",
  Rust: "#e07a5f",
  Python: "#6da06c",
  Go: "#7fa6c9",
  SQL: "#b58db6",
  Markdown: "#8a8a93",
  HTML: "#d98b6a",
  CSS: "#6a9bd9",
  Java: "#c98b54",
  Kotlin: "#9a7fd0",
  Ruby: "#d96a8b",
  C: "#7c8aa0",
  "C++": "#9a7f7f",
  Shell: "#8aa07c",
};

const FALLBACK = ["#c8f169", "#ff8a5c", "#6ea8fe", "#7ee0a0", "#ffcf6e", "#b58db6", "#9a7fd0"];

export function colorFor(key: string, index = 0): string {
  if (LANG_COLORS[key]) return LANG_COLORS[key];
  // deterministic hash -> fallback
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return FALLBACK[h % FALLBACK.length]!;
}

export const AVATAR_COLORS = ["#c8f169", "#6ea8fe", "#ff8a5c", "#7ee0a0", "#b58db6"];

export function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length]!;
}
