import type { Breakdown } from "@/lib/api";
import { fmtHM } from "@/lib/format";
import { colorFor } from "@/lib/colors";

export function Breakdown({ items, mode = "lang" }: { items: Breakdown[]; mode?: "lang" | "single" }) {
  const max = Math.max(...items.map((i) => i.seconds), 1);
  if (items.length === 0) return <div className="bar-row faint" style={{ padding: "20px" }}>No data yet.</div>;
  return (
    <div>
      {items.map((it, i) => (
        <div className="bar-row" key={it.key}>
          <div className="name">{it.key}</div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                width: `${((it.seconds / max) * 100).toFixed(1)}%`,
                background: mode === "lang" ? colorFor(it.key, i) : "var(--accent)",
              }}
            />
          </div>
          <div className="bar-val">{fmtHM(it.seconds)}</div>
        </div>
      ))}
    </div>
  );
}
