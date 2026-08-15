import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.FLOWSTATE_DB ?? join(here, "..", "flowstate.db");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS heartbeats (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    user      TEXT NOT NULL,
    time      INTEGER NOT NULL,
    entity    TEXT,
    category  TEXT,
    type      TEXT,
    language  TEXT,
    project   TEXT,
    branch    TEXT,
    editor    TEXT,
    is_write  INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_hb_user_time ON heartbeats(user, time);
  CREATE TABLE IF NOT EXISTS profiles (
    user TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );
`);

export const upsertProfile = db.prepare(
  `INSERT INTO profiles (user, name) VALUES (?, ?)
   ON CONFLICT(user) DO UPDATE SET name = excluded.name`,
);

export const insertHeartbeat = db.prepare(
  `INSERT INTO heartbeats (user, time, entity, category, type, language, project, branch, editor, is_write)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
);

export const countHeartbeats = db.prepare(`SELECT COUNT(*) AS n FROM heartbeats`);
