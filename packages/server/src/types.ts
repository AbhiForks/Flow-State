export interface Heartbeat {
  time: number; // unix seconds
  entity?: string;
  category?: string;
  type?: string;
  language?: string;
  project?: string;
  branch?: string;
  editor?: string;
  is_write?: boolean;
}

export interface IngestBody {
  user: string;
  name?: string;
  heartbeats: Heartbeat[];
}

export type PresenceStatus = "coding" | "idle" | "meeting" | "offline";

export interface PresenceState {
  user: string;
  name: string;
  status: PresenceStatus;
  project: string | null;
  editor: string | null;
  branch: string | null;
  since: number; // unix seconds when current status started
  lastActive: number; // unix seconds of last heartbeat / update
}

export interface DayBucket {
  date: string; // YYYY-MM-DD (UTC)
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
