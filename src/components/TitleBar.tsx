import { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function TitleBar() {
  const [maximized, setMaximized] = useState(false);
  const appWindow = getCurrentWindow();

  useEffect(() => {
    appWindow.onResized(() => {
      appWindow.isMaximized().then(setMaximized);
    });
  }, []);

  const handleMinimize = () => appWindow.minimize();
  const handleMaximize = () => appWindow.toggleMaximize();
  const handleClose = () => appWindow.close();

  return (
    <div className="title-bar" data-tauri-drag-region>
      <div className="title-bar-left">
        <span className="title-bar-text">Flit</span>
      </div>
      <div className="title-bar-controls">
        <button className="title-btn" onClick={handleMinimize} title="Minimize">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button className="title-btn" onClick={handleMaximize} title={maximized ? "Restore" : "Maximize"}>
          {maximized ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="5" width="14" height="14" rx="1" />
              <rect x="5" y="5" width="14" height="14" rx="1" />
            </svg>
          )}
        </button>
        <button className="title-btn title-btn-close" onClick={handleClose} title="Close">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
