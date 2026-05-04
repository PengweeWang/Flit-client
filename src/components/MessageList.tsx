import { useMemo } from "react";
import { Bubble } from "@ant-design/x";
import type { Message } from "../types";

interface Props {
  messages: Message[];
  currentUsername: string;
  typingUsers: string[];
}

function formatFullTime(ts: string): string {
  const d = new Date(ts);
  const date = d.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${date} ${time}`;
}

export default function MessageList({ messages, currentUsername, typingUsers }: Props) {
  const items = useMemo(() => {
    return messages.map((msg) => {
      const isMine = msg.sender === currentUsername;
      return {
        key: msg.client_id || msg.id || msg.timestamp,
        role: isMine ? "user" : "theirs",
        content: msg.content,
        header: isMine ? null : msg.sender,
        footer: formatFullTime(msg.timestamp),
      };
    });
  }, [messages, currentUsername]);

  return (
    <div className="bubble-list-wrapper">
      <Bubble.List
        items={items}
        autoScroll
        style={{ height: "100%" }}
        role={{
          user: {
            placement: "end",
            variant: "filled",
            shape: "corner",
            styles: {
              content: {
                background: "#e94560",
                color: "#fff",
                borderRadius: 16,
                borderBottomRightRadius: 4,
              },
              footer: {
                color: "rgba(255,255,255,0.4)",
                fontSize: 10,
                lineHeight: 1,
                marginTop: 3,
              },
            },
          },
          theirs: {
            placement: "start",
            variant: "filled",
            shape: "corner",
            styles: {
              content: {
                background: "#16213e",
                color: "#e0e0e0",
                borderRadius: 16,
                borderBottomLeftRadius: 4,
              },
              header: {
                color: "#e94560",
                fontSize: 12,
                fontWeight: 600,
                paddingBottom: 2,
              },
              footer: {
                color: "#555",
                fontSize: 10,
                lineHeight: 1,
                marginTop: 3,
              },
            },
          },
        }}
      />
      {typingUsers.length > 0 && (
        <div className="typing-wrapper">
          <div className="typing-dots">
            <span className="dot" /><span className="dot" /><span className="dot" />
          </div>
          <span className="typing-text">{typingUsers.join(", ")} typing</span>
        </div>
      )}
    </div>
  );
}
