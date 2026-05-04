import type { Message } from "../types";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface Props {
  roomId: string | null;
  roomName: string;
  messages: Message[];
  currentUsername: string;
  typingUsers: string[];
  connected: boolean;
  onSend: (roomId: string, content: string) => void;
  onTyping: (roomId: string, isTyping: boolean) => void;
  onLeave: (roomId: string) => void;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export default function ChatArea({
  roomId,
  roomName,
  messages,
  currentUsername,
  typingUsers,
  connected,
  onSend,
  onTyping,
  onLeave,
}: Props) {
  if (!roomId) {
    return <div className="chat-area placeholder">Select or create a room to start chatting</div>;
  }

  return (
    <div className="chat-area">
      <div className="chat-header">
        <div className="chat-header-info">
          <h3>{roomName}</h3>
          <span className="room-id-display" onClick={() => copyToClipboard(roomId)} title="Click to copy Room ID">
            ID: {roomId.slice(0, 8)}...
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </span>
        </div>
        <button className="leave-btn" onClick={() => onLeave(roomId!)}>
          Leave
        </button>
      </div>
      <MessageList
        messages={messages}
        currentUsername={currentUsername}
        typingUsers={typingUsers}
      />
      <MessageInput
        onSend={(content) => onSend(roomId, content)}
        onTyping={(isTyping) => onTyping(roomId, isTyping)}
        disabled={!connected}
      />
    </div>
  );
}
