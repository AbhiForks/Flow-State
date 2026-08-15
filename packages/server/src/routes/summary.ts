import type { FastifyInstance } from "fastify";
import { buildSummary } from "../analytics.js";

export async function summaryRoutes(app: FastifyInstance) {
  app.get("/api/summary", async (req) => {
    const q = req.query as { days?: string; user?: string };
    const days = Math.min(Math.max(parseInt(q.days ?? "14", 10) || 14, 1), 365);
    const user = q.user && q.user !== "all" ? q.user : undefined;
    return buildSummary(days, user);
  });
}
