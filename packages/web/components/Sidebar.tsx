import { Avatar } from "@/components/Avatar";
import Link from "next/link";
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

export function Sidebar({
  active,
  presence,
  collapsed,
  onToggle,
}: {
  active: string;
  presence: PresenceState[];
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button type="button" className="rail-toggle" onClick={onToggle} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        {collapsed ? (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3l5 5-5 5" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
        )}
      </button>

      <div className="brand">
        <div
          className="brand-mark"
          onClick={collapsed ? onToggle : undefined}
          title={collapsed ? "Expand sidebar" : undefined}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#0d1202" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 9h3l2.5-5 3 9 2-4h3.5" />
          </svg>
        </div>
        <div className="brand-text">
          <div className="brand-name">Flow State</div>
          <div className="brand-sub">analytics</div>
        </div>
      </div>

      <nav className="nav">
        <Link href="/" className="nav-item" title="Home">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 7.5 8 3l6 4.5" />
            <path d="M3.5 6.5V13h9V6.5" />
          </svg>
          <span className="nav-text">Home</span>
        </Link>
        <div className="nav-label">Workspace</div>
        {NAV.map((n) => (
          <div key={n.id} className={`nav-item ${active === n.id ? "active" : ""}`} title={n.label}>
            {ICONS[n.id]}
            <span className="nav-text">{n.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="server-status">
          <span className="pulse-dot" />
          <span className="server-text">api connected</span>
        </div>
        <div className="nav-label">Live now</div>
        {presence.map((p) => (
          <div className="user-chip" key={p.user} title={p.name}>
            <Avatar name={p.name} size="sm" />
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
