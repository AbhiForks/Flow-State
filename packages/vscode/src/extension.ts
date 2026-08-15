import * as vscode from "vscode";
import * as os from "node:os";
import { execSync } from "node:child_process";
import WebSocket from "ws";

interface Heartbeat {
  time: number;
  entity: string;
  language: string;
  project: string;
  branch: string;
  editor: string;
  is_write: boolean;
  category: string;
  type: string;
}

let ws: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let heartbeatTimer: NodeJS.Timeout | null = null;
let lastWriteAt = 0;

function cfg<T>(key: string, fallback: T): T {
  return vscode.workspace.getConfiguration("flowState").get<T>(key) ?? fallback;
}

function userId(): string {
  const id = cfg("userId", "").trim();
  return id || os.userInfo().username || "anon";
}
function userName(): string {
  const n = cfg("userName", "").trim();
  if (n) return n;
  const u = userId();
  return u.charAt(0).toUpperCase() + u.slice(1);
}
function serverUrl(): string {
  return cfg("serverUrl", "http://localhost:8787").replace(/\/$/, "");
}

function gitBranch(projectPath: string): string {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { cwd: projectPath, timeout: 2000 })
      .toString()
      .trim();
  } catch {
    return "main";
  }
}

function currentContext(): { entity: string; language: string; project: string; branch: string } | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return null;
  const doc = editor.document;
  const folder = vscode.workspace.getWorkspaceFolder(doc.uri);
  const project = folder ? folder.name : "scratch";
  const projectPath = folder ? folder.uri.fsPath : "";
  return {
    entity: doc.uri.fsPath,
    language: doc.languageId,
    project,
    branch: projectPath ? gitBranch(projectPath) : "main",
  };
}

async function sendHeartbeat(isWrite: boolean) {
  const ctx = currentContext();
  if (!ctx) return;
  const payload = {
    user: userId(),
    name: userName(),
    heartbeats: [
      {
        time: Math.floor(Date.now() / 1000),
        entity: ctx.entity,
        language: ctx.language,
        project: ctx.project,
        branch: ctx.branch,
        editor: "vscode",
        is_write: isWrite,
        category: "coding",
        type: "file",
      } as Heartbeat,
    ],
  };
  try {
    await fetch(`${serverUrl()}/api/heartbeats`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    /* server unreachable — ignore, next tick retries */
  }
}

function connectPresence() {
  const url = serverUrl().replace(/^http/, "ws") + "/ws";
  try {
    ws = new WebSocket(url);
  } catch {
    scheduleReconnect();
    return;
  }
  ws.on("open", () => pushPresence());
  ws.on("close", scheduleReconnect);
  ws.on("error", () => ws?.close());
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectPresence();
  }, 4000);
}

function pushPresence() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  const ctx = currentContext();
  const focused = vscode.window.state.focused;
  const status = !focused ? "idle" : ctx ? "coding" : "idle";
  ws.send(
    JSON.stringify({
      type: "update",
      user: userId(),
      name: userName(),
      status,
      project: ctx?.project ?? null,
      editor: "vscode",
      branch: ctx?.branch ?? null,
      at: Date.now(),
    }),
  );
}

export function activate(context: vscode.ExtensionContext) {
  const interval = Math.max(30, cfg("heartbeatInterval", 60));
  void sendHeartbeat(false);
  pushPresence();

  heartbeatTimer = setInterval(() => {
    void sendHeartbeat(false);
    pushPresence();
  }, interval * 1000);

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(() => {
      lastWriteAt = Date.now();
      void sendHeartbeat(true);
      pushPresence();
    }),
    vscode.window.onDidChangeTextEditorSelection(() => {
      if (Date.now() - lastWriteAt > 5000) void sendHeartbeat(false);
    }),
    vscode.window.onDidChangeWindowState(() => pushPresence()),
    new vscode.Disposable(() => {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      ws?.close();
    }),
  );

  connectPresence();
  vscode.window.showInformationMessage("Flow State is tracking your flow.");
}

export function deactivate() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  ws?.close();
}
