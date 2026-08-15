# Flow State

A self-hosted tracking tool for two people who want to know where their time actually goes. Editor plugins stream activity to a server you run, and the dashboard turns it into numbers that matter: focus time, flow streaks, and whether your friend is actually coding or just has their editor open.

No accounts, no cloud, no telemetry. The data lives in a SQLite file on your machine.

## What it tracks

- **Heartbeats** — your editor sends one every minute or two while you type. File, language, project, git branch, write vs. read.
- **Presence** — a WebSocket channel so you can see when the other person is in flow and what they're working on, live.
- **Summary analytics** — focus time, active days, flow streak (consecutive days over a threshold), session length, and breakdowns by language and project.

## Stack

| Part | What |
| ---- | ---- |
| server | Fastify + better-sqlite3, one port, no ORM |
| dashboard | Next.js, hand-rolled SVG charts (no chart library) |
| plugins | VS Code extension; JetBrains plugin is planned |

## Quick start

```bash
npm install
npm run dev        # API on :8787 — seeds ~3 weeks of demo data on first run
npm run dev:web    # dashboard on :3000
```

Open http://localhost:3000. You'll see two seeded users (Abhi and Maya) so the charts aren't empty on day one.

### VS Code extension

Open `packages/vscode` in VS Code, hit `F5`, and set the three settings (`flowState.userId`, `flowState.userName`, optionally `flowState.serverUrl`). It won't send anything until you do — the default user id is your OS username, which is probably not what you want.

## Layout

```
packages/
  server/    heartbeat ingestion, analytics, presence WS
  web/       dashboard
  vscode/    editor plugin
```

The storage layer is one file (`server/src/db.ts`). Swapping SQLite for Postgres/TimescaleDB later means changing that file, not the analytics code.

## API

```
POST /api/heartbeats   { user, name?, heartbeats: [{ time, entity, language, project, branch, editor, is_write }] }
GET  /api/summary?days=14&user=abhi
GET  /api/presence
WS   /ws                send { type: "update", ... } to announce yourself
```

## Known limitations

- Heartbeat duration is estimated from gaps between pings (capped at 5 min), so it's an approximation, not a keystroke counter.
- Flow streak uses UTC days; if you code past midnight it may credit the wrong day.
- The dashboard is a single overview page. Activity/projects/languages tabs in the sidebar are not built yet.
- No auth. It's meant for a LAN or a tunnel you trust.

## Why it exists

WakaTime and friends are fine, but they own your data and add noise. This one is small enough to read the whole thing in an afternoon and change what you don't like.
