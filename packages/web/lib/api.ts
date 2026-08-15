export const API = process.env.NEXT_PUBLIC_API ?? "http://localhost:8787";

export interface DayBucket {
  date: string;
  seconds: number;
}
export interface Breakdown {
  key: string;
  seconds: number;
}
export interface UserSummary {
  user: string;
  name: string;
  totalSeconds: number;
  activeDays: number;
  flowStreak: number;
  sessions: number;
  avgSessionSeconds: number;
  writes: number;
  byDay: DayBucket[];
  byLanguage: Breakdown[];
  byProject: Breakdown[];
}
export interface SummaryResponse {
  generatedAt: number;
  range: { from: number; to: number; days: number };
  users: UserSummary[];
  combined: UserSummary;
}

export async function getSummary(days: number, user?: string): Promise<SummaryResponse> {
  const u = user && user !== "all" ? `&user=${encodeURIComponent(user)}` : "";
  const res = await fetch(`${API}/api/summary?days=${days}${u}`, { cache: "no-store" });
  if (!res.ok) throw new Error("summary request failed");
  return res.json();
}

export interface PresenceState {
  user: string;
  name: string;
  status: "coding" | "idle" | "offline";
  project: string | null;
  editor: string | null;
  branch: string | null;
  since: number;
  lastActive: number;
}

export async function getPresence(): Promise<PresenceState[]> {
  const res = await fetch(`${API}/api/presence`, { cache: "no-store" });
  if (!res.ok) throw new Error("presence request failed");
  const j = (await res.json()) as { peers: PresenceState[] };
  return j.peers;
}
