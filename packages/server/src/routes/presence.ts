import type { FastifyInstance } from "fastify";
import type { PresenceState, PresenceStatus } from "../types.js";

const presence = new Map<string, PresenceState>();

// seed a believable "live" state for the demo
presence.set("abhi", {
  user: "abhi",
  name: "Abhi",
  status: "coding",
  project: "flow-state",
  editor: "vscode",
  branch: "feat/presence",
  since: Math.floor(Date.now() / 1000) - 42 * 60,
  lastActive: Math.floor(Date.now() / 1000) - 8,
});
presence.set("maya", {
  user: "maya",
  name: "Maya",
  status: "coding",
  project: "pulse-core",
  editor: "jetbrains",
  branch: "main",
  since: Math.floor(Date.now() / 1000) - 12 * 60,
  lastActive: Math.floor(Date.now() / 1000) - 20,
});

export function listPresence(): PresenceState[] {
  const now = Math.floor(Date.now() / 1000);
  return [...presence.values()]
    .map((p): PresenceState | null => {
      // anyone silent for >3 min is idle; >15 min is offline
      const idleFor = now - p.lastActive;
      let status: PresenceStatus = p.status;
      if (idleFor > 900) status = "offline";
      else if (idleFor > 180) status = "idle";
      if (status === "offline") return null;
      return { ...p, status };
    })
    .filter((p): p is PresenceState => p !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type PresenceUpdate = Partial<Omit<PresenceState, "user" | "since" | "lastActive">> & {
  user: string;
  name?: string;
  at?: number;
};

export function applyUpdate(u: PresenceUpdate) {
  const now = Math.floor((u.at ?? Date.now()) / 1000);
  const prev = presence.get(u.user);
  const status = u.status ?? prev?.status ?? "coding";
  const since =
    prev && prev.status === status && now - prev.lastActive < 900
      ? prev.since
      : now;
  presence.set(u.user, {
    user: u.user,
    name: u.name ?? prev?.name ?? u.user,
    status,
    project: u.project ?? prev?.project ?? null,
    editor: u.editor ?? prev?.editor ?? null,
    branch: u.branch ?? prev?.branch ?? null,
    since,
    lastActive: now,
  });
}

export async function presenceRoutes(app: FastifyInstance) {
  app.get("/api/presence", async () => ({ peers: listPresence() }));
}

export async function presenceWs(app: FastifyInstance) {
  const clients = new Set<import("ws").WebSocket>();

  function broadcast() {
    const payload = JSON.stringify({ type: "presence", peers: listPresence() });
    for (const c of clients) if (c.readyState === 1) c.send(payload);
  }

  app.get("/ws", { websocket: true }, (socket) => {
    clients.add(socket);
    socket.send(JSON.stringify({ type: "presence", peers: listPresence() }));

    socket.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg?.type === "update") {
          applyUpdate({
            user: msg.user,
            name: msg.name,
            status: msg.status,
            project: msg.project,
            editor: msg.editor,
            branch: msg.branch,
            at: msg.at,
          });
          broadcast();
        }
      } catch {
        /* ignore malformed frames */
      }
    });

    socket.on("close", () => clients.delete(socket));
  });
}
