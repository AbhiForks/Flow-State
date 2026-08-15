import type { FastifyInstance } from "fastify";
import { db, insertHeartbeat, upsertProfile } from "../db.js";
import type { IngestBody } from "../types.js";

export async function heartbeatsRoutes(app: FastifyInstance) {
  app.post("/api/heartbeats", async (req, reply) => {
    const body = req.body as Partial<IngestBody>;
    if (!body?.user || !Array.isArray(body.heartbeats) || body.heartbeats.length === 0) {
      return reply.code(400).send({ error: "expected { user, heartbeats: [...] }" });
    }
    if (body.name) upsertProfile.run(body.user, body.name);

    const insertMany = db.transaction((rows: IngestBody["heartbeats"]) => {
      for (const h of rows) {
        insertHeartbeat.run(
          body.user!,
          Math.floor(h.time),
          h.entity ?? null,
          h.category ?? "coding",
          h.type ?? "file",
          h.language ?? null,
          h.project ?? null,
          h.branch ?? null,
          h.editor ?? null,
          h.is_write ? 1 : 0,
        );
      }
    });
    insertMany(body.heartbeats);
    return { ok: true, count: body.heartbeats.length };
  });
}
