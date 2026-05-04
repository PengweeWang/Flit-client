import { useRef, useCallback } from "react";
import { Sender } from "@ant-design/x";

interface Props {
  onSend: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  disabled: boolean;
}

export default function MessageInput({ onSend, onTyping, disabled }: Props) {
  const typingRef = useRef(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTyping = useCallback(() => {
    if (!typingRef.current) {
      typingRef.current = true;
      onTyping(true);
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      typingRef.current = false;
      onTyping(false);
    }, 2000);
  }, [onTyping]);

  const handleSubmit = useCallback((value: string) => {
    const content = value.trim();
    if (!content) return;
    onSend(content);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingRef.current = false;
    onTyping(false);
  }, [onSend, onTyping]);

  const handleChange = useCallback((value: string) => {
    if (value) handleTyping();
  }, [handleTyping]);

  return (
    <Sender
      onSubmit={handleSubmit}
      onChange={handleChange}
      placeholder="Type a message..."
      disabled={disabled}
      autoSize={{ minRows: 1, maxRows: 6 }}
    />
  );
}
