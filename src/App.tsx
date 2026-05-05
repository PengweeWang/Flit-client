import { useState, useEffect } from "react";
import { getWsUrl } from "./services/api";
import { wsClient } from "./services/websocket";
import { getSystemInfo } from "./services/system";
import { useChatStore } from "./stores/chatStore";
import { getSetting, setSetting } from "./lib/db";
import { useChat } from "./hooks/useChat";
import Launcher from "./components/Launcher";
import RoomView from "./components/RoomView";
import SettingsPanel from "./components/SettingsPanel";
import TitleBar from "./components/TitleBar";
import IdentityPrompt from "./components/IdentityPrompt";
import "./App.css";

function App() {
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [needsIdentity, setNeedsIdentity] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 8000);
    return () => clearTimeout(timer);
  }, []);
  const serverUrl = useChatStore((s) => s.serverUrl);
  const setServerUrl = useChatStore((s) => s.setServerUrl);
  const setIdentity = useChatStore((s) => s.setIdentity);

  const {
    identity, connected, rooms, currentRoomId,
    messages, onlineUsers, typingUsers,
    createRoom, joinRoom, deleteRoom, leaveRoom,
    renameRoom, sendMessage, sendTyping,
  } = useChat();

  useEffect(() => {
    const prevent = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", prevent);
    return () => document.removeEventListener("contextmenu", prevent);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const saved = await getSetting("last_server_url");
        if (saved) setServerUrl(saved);
        const info = await getSystemInfo();
        if (!info.identity) {
          setNeedsIdentity(true);
          setReady(true);
          return;
        }
        setIdentity(info.identity);
        const url = getWsUrl(saved || serverUrl, info.identity);
        wsClient.connect(url);
        if (saved) setSetting("last_server_url", saved);
      } catch (err) {
        console.error("Init failed:", err);
      }
      setReady(true);
    })();
  }, []);

  const handleIdentityConfirm = async (name: string) => {
    await setSetting("identity", name);
    setIdentity(name);
    setNeedsIdentity(false);
    const url = getWsUrl(useChatStore.getState().serverUrl, name);
    wsClient.connect(url);
  };

  const handleReconnect = () => {
    wsClient.disconnect();
    const id = useChatStore.getState().identity;
    if (id) {
      const url = getWsUrl(useChatStore.getState().serverUrl, id);
      wsClient.connect(url);
    }
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const handleSettingsSave = () => {
    const url = useChatStore.getState().serverUrl;
    setSetting("last_server_url", url);
    setSettingsOpen(false);
    handleReconnect();
  };

  const handleBack = () => {
    if (currentRoomId) leaveRoom(currentRoomId);
  };

  const currentRoom = rooms.find((r) => r.room_id === currentRoomId);

  if (needsIdentity) {
    return (
      <div className="app">
        <TitleBar />
        <IdentityPrompt onConfirm={handleIdentityConfirm} />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="app">
        <TitleBar />
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Connecting...</p>
        </div>
      </div>
    );
  }

  if (currentRoomId && currentRoom) {
    return (
      <div className="app">
        <TitleBar />
        <RoomView
          roomId={currentRoomId}
          roomName={currentRoom.name}
          messages={messages[currentRoomId] || []}
          currentUsername={identity}
          typingUsers={typingUsers[currentRoomId] || []}
          onlineUsers={onlineUsers[currentRoomId] || []}
          connected={connected}
          onSend={sendMessage}
          onTyping={sendTyping}
          onRename={renameRoom}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <TitleBar />
      <Launcher
        rooms={rooms}
        connected={connected}
        identity={identity}
        serverUrl={serverUrl}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onDeleteRoom={deleteRoom}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <SettingsPanel
        open={settingsOpen}
        onClose={handleSettingsClose}
        onSave={handleSettingsSave}
      />
    </div>
  );
}

export default App;
