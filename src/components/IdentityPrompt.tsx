import { useState, useRef, useEffect } from "react";

interface Props {
  onConfirm: (name: string) => void;
}

export default function IdentityPrompt({ onConfirm }: Props) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const trimmed = name.trim();
  const valid = trimmed.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valid) onConfirm(trimmed);
  };

  return (
    <div className="identity-overlay">
      <div className="identity-card">
        <h1 className="identity-title">Flit</h1>
        <p className="identity-subtitle">Enter your display name to continue</p>
        <form className="identity-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="identity-input"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
            autoComplete="off"
          />
          <button className="identity-btn" type="submit" disabled={!valid}>
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
