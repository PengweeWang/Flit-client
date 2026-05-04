import { useState, useEffect } from "react";
import { useChatStore } from "../stores/chatStore";
import { getRecentServers, addRecentServer } from "../lib/db";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function SettingsPanel({ open, onClose, onSave }: Props) {
  const serverUrl = useChatStore((s) => s.serverUrl);
  const setServerUrl = useChatStore((s) => s.setServerUrl);
  const [localUrl, setLocalUrl] = useState(serverUrl);
  const [recentServers, setRecentServers] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setLocalUrl(serverUrl);
      getRecentServers().then(setRecentServers);
    }
  }, [open, serverUrl]);

  const handleSave = () => {
    const url = localUrl.trim();
    if (!url) return;
    setServerUrl(url);
    addRecentServer(url);
    onSave();
  };

  const handleSelect = (url: string) => {
    setLocalUrl(url);
  };

  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  return (
    <div className="settings-overlay" onClick={handleOverlay}>
      <div className="settings-panel">
        <div className="settings-header">
          <h3>Settings</h3>
          <button className="settings-close" onClick={onClose}>&times;</button>
        </div>
        <div className="settings-body">
          <div className="settings-group">
            <label>Server URL</label>
            <input
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              placeholder="http://localhost:8000"
            />
            <span className="settings-hint">
              Backend server address (e.g. http://192.168.1.100:8000)
            </span>
          </div>

          {recentServers.length > 0 && (
            <div className="settings-recent">
              <label>Recent Servers</label>
              <div className="recent-server-list">
                {recentServers.map((url) => (
                  <button
                    key={url}
                    className={`recent-server-chip ${url === localUrl ? "active" : ""}`}
                    onClick={() => handleSelect(url)}
                  >
                    {url}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="settings-footer">
          <button className="settings-btn secondary" onClick={onClose}>Cancel</button>
          <button className="settings-btn primary" onClick={handleSave}>Save & Reconnect</button>
        </div>
      </div>
    </div>
  );
}
