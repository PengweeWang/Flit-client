import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Room } from "../types";

interface Props {
  rooms: Room[];
  connected: boolean;
  identity: string;
  serverUrl: string;
  onCreateRoom: (roomId: string, name: string) => void;
  onJoinRoom: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onOpenSettings: () => void;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

function nextUntitledName(rooms: Room[]): string {
  const max = rooms.reduce((n, r) => {
    const m = r.name.match(/^Untitled Room (\d+)$/);
    return m ? Math.max(n, parseInt(m[1])) : n;
  }, 0);
  return `Untitled Room ${max + 1}`;
}

export default function Launcher({
  rooms, connected, identity, serverUrl,
  onCreateRoom, onJoinRoom, onDeleteRoom, onOpenSettings,
}: Props) {
  const [roomName, setRoomName] = useState("");
  const [joinId, setJoinId] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = roomName.trim() || nextUntitledName(rooms);
    const roomId = uuidv4();
    onCreateRoom(roomId, name);
    setRoomName("");
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinId.trim()) return;
    onJoinRoom(joinId.trim());
    setJoinId("");
  };

  return (
    <div className="launcher">
      <div className="launcher-top">
        <div className="launcher-header">
          <h1>Flit</h1>
          <button className="settings-gear" onClick={onOpenSettings} title="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>

        <div className="launcher-server">
          <span className="server-url-text">{serverUrl}</span>
          <span className={`status-dot-sm ${connected ? "online" : "offline"}`} />
        </div>

        <div className="user-badge">{identity}</div>
      </div>

      <div className="launcher-actions">
        <form onSubmit={handleCreate} className="launcher-form">
          <h3>Create Room</h3>
          <input
            placeholder={`Room name (default: ${nextUntitledName(rooms)})`}
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button type="submit">Create</button>
        </form>

        <div className="launcher-divider" />

        <form onSubmit={handleJoin} className="launcher-form">
          <h3>Join Room</h3>
          <input
            placeholder="Paste Room ID"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
          />
          <button type="submit">Join</button>
        </form>
      </div>

      <div className="launcher-recent">
        <h3>Recent Rooms</h3>
        <div className="recent-items">
          {rooms.map((room) => (
            <div
              key={room.room_id}
              className="recent-item"
              onClick={() => onJoinRoom(room.room_id)}
            >
              <div className="recent-item-info">
                <span className="recent-item-name">{room.name}</span>
                <span className="recent-item-id">ID: {room.room_id.slice(0, 8)}...</span>
              </div>
              <div className="recent-item-actions">
                <button
                  className="recent-copy-btn"
                  title="Copy Room ID"
                  onClick={(e) => { e.stopPropagation(); copyToClipboard(room.room_id); }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
                <button
                  className="recent-delete-btn"
                  title="Remove"
                  onClick={(e) => { e.stopPropagation(); onDeleteRoom(room.room_id); }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {rooms.length === 0 && <p className="no-rooms">No recent rooms</p>}
        </div>
      </div>
    </div>
  );
}
