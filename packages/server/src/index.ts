import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { seedIfEmpty } from "./seed.js";
import { heartbeatsRoutes } from "./routes/heartbeats.js";
import { summaryRoutes } from "./routes/summary.js";
import { presenceRoutes, presenceWs } from "./routes/presence.js";

const PORT = Number(process.env.PORT ?? 8787);

async function main() {
  seedIfEmpty();

  const app = Fastify({ logger: false });
  await app.register(cors, { origin: true });
  await app.register(websocket);

  await app.register(heartbeatsRoutes);
  await app.register(summaryRoutes);
  await app.register(presenceRoutes);
  await app.register(presenceWs);

  app.get("/api/health", async () => ({ ok: true, ts: Date.now() }));

  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`[flowstate] server listening on http://localhost:${PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
