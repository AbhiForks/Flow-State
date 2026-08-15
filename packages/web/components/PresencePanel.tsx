"use client";

import { useEffect, useRef, useState } from "react";
import type { PresenceState } from "@/lib/api";
import { API } from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { fmtSince } from "@/lib/format";

const STATUS_LABEL: Record<PresenceState["status"], string> = {
  coding: "Coding",
  idle: "Idle",
  offline: "Away",
};

export function PresencePanel({ initial }: { initial: PresenceState[] }) {
  const [peers, setPeers] = useState<PresenceState[]>(initial);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = API.replace(/^http/, "ws") + "/ws";
    let closed = false;
    function connect() {
      const s = new WebSocket(url);
      ws.current = s;
      s.onmessage = (e) => {
        try {
          const m = JSON.parse(e.data);
          if (m?.type === "presence") setPeers(m.peers);
        } catch {
          /* ignore */
        }
      };
      s.onclose = () => {
        if (!closed) setTimeout(connect, 2000);
      };
    }
    connect();
    return () => {
      closed = true;
      ws.current?.close();
    };
  }, []);

  return (
    <div className="presence">
      {peers.length === 0 && <div className="bar-row faint" style={{ padding: "20px" }}>No one online.</div>}
      {peers.map((p) => (
        <div className="peer" key={p.user}>
          <div className="pstatus">
            <Avatar name={p.name} />
            <span className={`live-dot ${p.status}`} />
          </div>
          <div className="meta">
            <div className="n">{p.name}</div>
            <div className="d">
              {p.status === "coding" && p.project ? `${p.project} · ${p.editor ?? ""}` : STATUS_LABEL[p.status]}
            </div>
          </div>
          <div className="right">
            <span className={`badge ${p.status}`}>{STATUS_LABEL[p.status]}</span>
            <div className="since">{fmtSince(p.since)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
