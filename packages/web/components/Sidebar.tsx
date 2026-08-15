import { avatarColor } from "@/lib/colors";
import { initials } from "@/lib/format";
import type { PresenceState } from "@/lib/api";

const ICONS: Record<string, React.ReactNode> = {
  overview: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="5" height="5" rx="1.2" />
      <rect x="9" y="2" width="5" height="5" rx="1.2" />
      <rect x="2" y="9" width="5" height="5" rx="1.2" />
      <rect x="9" y="9" width="5" height="5" rx="1.2" />
    </svg>
  ),
  activity: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 8h3l2-5 3 9 2-4h3" />
    </svg>
  ),
  projects: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3.5h4l1.5 2H14v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-9z" />
    </svg>
  ),
  languages: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l4 5v4M3 3L1 6m2-3h2l4 5M7 12H3m0 0L1 10m2 2l2-2" />
    </svg>
  ),
  presence: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.2" />
      <path d="M8 3.5v4.5l3 2" />
    </svg>
  ),
};

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
        <div className="brand-mark">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#0d1202" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 9h3l2.5-5 3 9 2-4h3.5" />
          </svg>
        </div>
        <div>
          <div className="brand-name">Flow State</div>
          <div className="brand-sub">analytics</div>
        </div>
      </div>

      <nav className="nav">
        <div className="nav-label">Workspace</div>
        {NAV.map((n) => (
          <div key={n.id} className={`nav-item ${active === n.id ? "active" : ""}`}>
            {ICONS[n.id]}
            {n.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="server-status">
          <span className="pulse-dot" />
          api connected
        </div>
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
