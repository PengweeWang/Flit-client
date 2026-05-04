import type { Message } from "../types";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import OnlineUsers from "./OnlineUsers";

interface Props {
  roomId: string;
  roomName: string;
  messages: Message[];
  currentUsername: string;
  typingUsers: string[];
  onlineUsers: string[];
  connected: boolean;
  onSend: (roomId: string, content: string) => void;
  onTyping: (roomId: string, isTyping: boolean) => void;
  onRename: (roomId: string, name: string) => void;
  onBack: () => void;
}

export default function RoomView({
  roomId, roomName, messages, currentUsername,
  typingUsers, onlineUsers, connected,
  onSend, onTyping, onRename, onBack,
}: Props) {
  return (
    <div className="room-view">
      <div className="room-view-body">
        <div className="room-view-messages">
          <button className="back-btn-overlay" onClick={onBack} title="Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <MessageList
            messages={messages}
            currentUsername={currentUsername}
            typingUsers={typingUsers}
          />
          <div className="sender-wrapper">
            <MessageInput
              onSend={(content) => onSend(roomId, content)}
              onTyping={(isTyping) => onTyping(roomId, isTyping)}
              disabled={!connected}
            />
          </div>
        </div>
        <OnlineUsers
          roomId={roomId}
          roomName={roomName}
          users={onlineUsers}
          currentUsername={currentUsername}
          onRename={onRename}
        />
      </div>
    </div>
  );
}
