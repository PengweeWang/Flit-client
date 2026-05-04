import { useState, useRef, useCallback, useEffect } from "react";

interface Props {
  roomId: string;
  roomName: string;
  users: string[];
  currentUsername: string;
  onRename: (roomId: string, name: string) => void;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

const MIN_WIDTH = 160;
const MAX_WIDTH = 400;
const COLLAPSED_WIDTH = 40;

export default function OnlineUsers({ roomId, roomName, users, currentUsername, onRename }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(240);
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(roomName);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const others = users.filter((u) => u !== currentUsername);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  }, [width]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const delta = startXRef.current - e.clientX;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta));
      setWidth(newWidth);
    };
    const onUp = () => setDragging(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  return (
    <div
      className={`online-users ${collapsed ? "collapsed" : ""} ${dragging ? "dragging" : ""}`}
      style={{ width: collapsed ? COLLAPSED_WIDTH : width }}
    >
      <div
        className="online-resize-handle"
        onMouseDown={!collapsed ? handleMouseDown : undefined}
      />

      <button className="online-toggle" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand" : "Collapse"}>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {!collapsed && (
        <>
          <div className="online-room-info">
            {editing ? (
              <input
                className="online-room-input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => { if (editValue.trim() && editValue !== roomName) onRename(roomId, editValue.trim()); setEditing(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") setEditing(false); }}
                autoFocus
              />
            ) : (
              <div className="online-room-name" onClick={() => { setEditValue(roomName); setEditing(true); }} title="Click to rename">
                {roomName}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
            )}
            <span className="online-room-id" onClick={() => copyToClipboard(roomId)} title="Click to copy Room ID">
              ID: {roomId.slice(0, 8)}...
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </span>
          </div>
          <div className="online-list">
            {currentUsername && (
              <div className="online-item me">
                <span className="ol-dot" />
                <span className="ol-name">{currentUsername}</span>
                <span className="ol-tag">you</span>
              </div>
            )}
            {others.map((u) => (
              <div key={u} className="online-item">
                <span className="ol-dot" />
                <span className="ol-name">{u}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
