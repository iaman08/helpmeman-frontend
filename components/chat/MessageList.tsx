"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { ArrowDown, RefreshCw } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  userId: string;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onReply: (msg: ChatMessage) => void;
  onEdit: (msg: ChatMessage) => void;
  onDelete: (msgId: string) => void;
  onReact: (msgId: string, emoji: string) => void;
  chatTheme: string;
  otherName?: string;
  onImageClick?: (url: string, name: string) => void;
  onProfileClick?: () => void;
}

function formatAppleHeader(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const hours = date.getHours();
  const mins = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = ((hours % 12) || 12);
  const timeStr = `${h12}:${mins} ${ampm}`;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  if (date.getFullYear() !== now.getFullYear()) {
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${timeStr}`;
  }
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()} at ${timeStr}`;
}

function DateSeparator({ dateStr }: { dateStr: string }) {
  return (
    <div className="flex flex-col items-center my-4 select-none">
      <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--muted, #888)", opacity: 0.6 }}>
        {formatAppleHeader(dateStr)}
      </span>
    </div>
  );
}

export function MessageList({
  messages,
  userId,
  hasMore,
  loadingMore,
  onLoadMore,
  onReply,
  onEdit,
  onDelete,
  onReact,
  chatTheme,
  otherName,
  onImageClick,
  onProfileClick,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const prevLenRef = useRef(messages.length);
  const isAtBottomRef = useRef(true);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottomRef.current = distFromBottom < 80;
    setShowScrollBtn(distFromBottom > 200);
    if (el.scrollTop < 100 && hasMore && !loadingMore) {
      onLoadMore();
    }
  }, [hasMore, loadingMore, onLoadMore]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
    setNewMsgCount(0);
    setShowScrollBtn(false);
  }, []);

  useEffect(() => {
    const newLen = messages.length;
    const prevLen = prevLenRef.current;
    prevLenRef.current = newLen;

    if (newLen > prevLen) {
      const addedCount = newLen - prevLen;
      const lastMsg = messages[newLen - 1];
      const isOwnMsg = lastMsg?.senderId === userId;

      if (isAtBottomRef.current || isOwnMsg) {
        requestAnimationFrame(() => scrollToBottom("smooth"));
      } else if (!isOwnMsg) {
        setNewMsgCount((c) => c + addedCount);
      }
    }
  }, [messages, userId, scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => scrollToBottom("instant"));
    }
  }, []);

  const lastMineIdx = messages.reduce(
    (acc, msg, i) => (msg.senderId === userId && !msg._sending ? i : acc),
    -1
  );

  let lastHeaderTime: Date | null = null;
  const groups: Array<{ type: "separator"; dateStr: string } | { type: "message"; msg: ChatMessage; idx: number }> = [];

  messages.forEach((msg, idx) => {
    const msgTime = new Date(msg.createdAt || Date.now());
    let showHeader = false;
    if (!lastHeaderTime || msgTime.getTime() - lastHeaderTime.getTime() > 15 * 60 * 1000) {
      showHeader = true;
      lastHeaderTime = msgTime;
    }
    if (showHeader) groups.push({ type: "separator", dateStr: msg.createdAt || new Date().toISOString() });
    groups.push({ type: "message", msg, idx });
  });

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 flex flex-col gap-0.5 min-h-0 relative"
      style={{ background: "var(--bg, #fff)" }}
    >
      <div ref={topRef} className="flex justify-center pb-2">
        {loadingMore && (
          <div className="flex items-center gap-2 text-xs py-2" style={{ color: "var(--muted, #888)" }}>
            <RefreshCw className="h-3 w-3 animate-spin" />
            Loading older messages...
          </div>
        )}
        {hasMore && !loadingMore && (
          <button
            onClick={onLoadMore}
            className="text-xs underline transition-colors py-1 cursor-pointer"
            style={{ color: "var(--muted, #888)" }}
          >
            Load older messages
          </button>
        )}
      </div>

      {messages.length === 0 && !loadingMore && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm select-none" style={{ color: "var(--muted, #888)", opacity: 0.6 }}>No messages yet. Say hello! 👋</p>
        </div>
      )}

      {groups.map((item, i) => {
        if (item.type === "separator") {
          return <DateSeparator key={`sep-${item.dateStr}-${i}`} dateStr={item.dateStr} />;
        }
        const { msg, idx } = item;
        const isMine = msg.senderId === userId;
        return (
          <MessageBubble
            key={msg.id || msg._tempId || `msg-${idx}`}
            msg={msg}
            isMine={isMine}
            isLastMine={idx === lastMineIdx}
            chatTheme={chatTheme}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onReact={(emoji) => onReact(msg.id, emoji)}
            userId={userId}
            otherName={!isMine ? otherName : undefined}
            onImageClick={onImageClick}
            onProfileClick={onProfileClick}
          />
        );
      })}

      <div ref={bottomRef} className="h-px" />

      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom("smooth")}
          className="fixed bottom-24 right-6 z-20 flex items-center gap-1.5 rounded-full px-3 py-2 shadow-lg text-xs font-semibold hover:opacity-90 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 cursor-pointer"
          style={{
            background: "var(--bg, #fff)",
            border: "1px solid rgba(0,0,0,0.08)",
            color: "var(--fg, #111)",
          }}
        >
          {newMsgCount > 0 && (
            <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: "var(--accent, #111)", color: "var(--accent-fg, #fff)" }}>
              {newMsgCount}
            </span>
          )}
          <ArrowDown className="h-3.5 w-3.5" />
          {newMsgCount > 0 ? "New messages" : "Scroll down"}
        </button>
      )}
    </div>
  );
}
