import { avatarColor } from "@/lib/colors";
import { initials } from "@/lib/format";
import type { PresenceState } from "@/lib/api";

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "projects", label: "Projects" },
  { id: "languages", label: "Languages" },
  { id: "presence", label: "Presence" },
];

export function Sidebar({ active, presence }: { active: string; presence: PresenceState[] }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">F</div>
        <div>
          <div className="brand-name">Flow State</div>
          <div className="brand-sub">analytics</div>
        </div>
      </div>

      <nav className="nav">
        <div className="nav-label">Workspace</div>
        {NAV.map((n) => (
          <div key={n.id} className={`nav-item ${active === n.id ? "active" : ""}`}>
            <span className="dot" />
            {n.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="nav-label">Live now</div>
        {presence.map((p) => (
          <div className="user-chip" key={p.user}>
            <div className="avatar sm" style={{ background: avatarColor(p.name) }}>
              {initials(p.name)}
            </div>
            <div className="user-meta">
              <div className="n">{p.name}</div>
              <div className="s">{p.status === "coding" ? p.project ?? "coding" : p.status}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
