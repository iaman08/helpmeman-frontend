"use client";
import { useEffect, useState } from "react";

interface TypingIndicatorProps {
  typingUserName?: string;
}

export function TypingIndicator({ typingUserName }: TypingIndicatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 200);
    return () => clearTimeout(t);
  }, [typingUserName]);

  if (!typingUserName) return null;

  return (
    <div
      className="flex items-center gap-2 px-2 py-1 select-none"
      aria-live="polite"
      aria-label={`${typingUserName} is typing`}
    >
      <div className="flex items-center gap-1 bg-(--fg)/5 border border-(--hairline)/20 rounded-full px-3 py-1.5">
        <div className="flex items-center gap-[3px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-[6px] w-[6px] rounded-full bg-(--muted) opacity-60"
              style={{
                animation: `typingBounce 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </div>
        <span className="text-[11px] text-(--muted) font-medium ml-1">
          {typingUserName} is typing
        </span>
      </div>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
