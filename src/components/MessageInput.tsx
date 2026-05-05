import { useRef, useCallback, useState } from "react";
import { Sender } from "@ant-design/x";

interface Props {
  onSend: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  disabled: boolean;
}

export default function MessageInput({ onSend, onTyping, disabled }: Props) {
  const [value, setValue] = useState("");
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

  const handleSubmit = useCallback((val: string) => {
    const content = val.trim();
    if (!content) return;
    onSend(content);
    setValue("");
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingRef.current = false;
    onTyping(false);
  }, [onSend, onTyping]);

  const handleChange = useCallback((val: string) => {
    setValue(val);
    if (val) handleTyping();
  }, [handleTyping]);

  return (
    <Sender
      value={value}
      onSubmit={handleSubmit}
      onChange={handleChange}
      placeholder="Type a message..."
      disabled={disabled}
      autoSize={{ minRows: 1, maxRows: 6 }}
    />
  );
}
