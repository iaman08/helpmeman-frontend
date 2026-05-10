"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, MessageCircle, Lock, ArrowLeft } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import type { ChatThread, ChatMessage } from "@/lib/types";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001";

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(d: string) {
  const date = new Date(d);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function ChatPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socketRef, setSocketRef] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ─── Load threads ─── */
  useEffect(() => {
    api
      .get("/chat/threads")
      .then((res) => setThreads(res.data.threads))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ─── Socket setup ─── */
  useEffect(() => {
    const token = localStorage.getItem("helpmeman.accessToken");
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket"] });
    setSocketRef(socket);

    socket.on("new_message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      // Update thread list's last message
      setThreads((prev) =>
        prev.map((t) =>
          t.id === msg.threadId
            ? { ...t, messages: [msg], updatedAt: msg.createdAt }
            : t,
        ),
      );
    });

    socket.on("thread_locked", ({ threadId }: { threadId: string }) => {
      setActiveThread((prev) =>
        prev?.id === threadId ? { ...prev, status: "LOCKED" } : prev,
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /* ─── Scroll to bottom on new messages ─── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ─── Open thread ─── */
  const openThread = useCallback(
    async (thread: ChatThread) => {
      setActiveThread(thread);
      try {
        const res = await api.get(`/chat/threads/${thread.id}`);
        setMessages(res.data.thread.messages ?? []);
        // Join socket room
        socketRef?.emit("join_thread", { threadId: thread.id });
        // Mark as read
        await api.put(`/chat/threads/${thread.id}/read`).catch(() => {});
      } catch {
        setMessages([]);
      }
    },
    [socketRef],
  );

  /* ─── Send message ─── */
  async function handleSend() {
    if (!input.trim() || !activeThread || sending) return;
    setSending(true);
    try {
      await api.post(`/chat/threads/${activeThread.id}/messages`, {
        body: input.trim(),
      });
      setInput("");
    } catch {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  /* ─── Leave thread on close ─── */
  const goBackToList = useCallback(() => {
    if (activeThread && socketRef) {
      socketRef.emit("leave_thread", { threadId: activeThread.id });
    }
    setActiveThread(null);
    setMessages([]);
  }, [activeThread, socketRef]);

  const isLocked = activeThread?.status === "LOCKED" || activeThread?.status === "CLOSED";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
          Chat
        </p>
        <h1 className="font-display text-4xl leading-tight">Messages.</h1>
      </div>

      <div
        className="rounded-2xl bg-(--fg)/[0.02] overflow-hidden"
        style={{ height: "calc(100vh - 240px)" }}
      >
        {activeThread ? (
          /* ─── Active Thread View ─── */
          <div className="flex flex-col h-full">
            {/* Thread header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-(--hairline)">
              <button
                type="button"
                onClick={goBackToList}
                className="text-(--muted) hover:text-(--fg) cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--fg)/8 text-xs font-medium shrink-0">
                {user?.role === "MENTOR"
                  ? activeThread.user?.name?.[0] ?? "U"
                  : activeThread.mentor?.displayName?.[0] ?? "M"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {user?.role === "MENTOR"
                    ? activeThread.user?.name ?? "User"
                    : activeThread.mentor?.displayName ?? "Mentor"}
                </span>
                {isLocked && (
                  <span className="text-[10px] text-amber-500 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Thread locked
                  </span>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-sm text-(--muted)">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.senderId === user?.id;
                  const showDate =
                    i === 0 ||
                    formatDate(msg.createdAt) !==
                      formatDate(messages[i - 1].createdAt);
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="text-center text-[10px] text-(--muted) uppercase tracking-wider my-3">
                          {formatDate(msg.createdAt)}
                        </div>
                      )}
                      <div
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                            isMine
                              ? "bg-(--accent) text-(--accent-fg) rounded-br-md"
                              : "bg-(--fg)/5 rounded-bl-md"
                          }`}
                        >
                          <p className="leading-relaxed">{msg.body}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              isMine ? "text-(--accent-fg)/60" : "text-(--muted)"
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {isLocked ? (
              <div className="px-5 py-4 border-t border-(--hairline) text-center text-sm text-(--muted) flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                This thread is locked. Book a session to continue chatting.
              </div>
            ) : (
              <div className="px-5 py-4 border-t border-(--hairline)">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message…"
                    maxLength={500}
                    className="flex-1 bg-(--fg)/5 rounded-full px-5 py-3 text-sm outline-none focus:bg-(--fg)/8 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-(--accent) text-(--accent-fg) hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-30 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ─── Thread List ─── */
          <div className="h-full overflow-y-auto">
            {loading ? (
              <div className="flex flex-col gap-3 p-5">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : threads.length > 0 ? (
              <div className="flex flex-col">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => openThread(thread)}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-(--fg)/4 transition-colors cursor-pointer text-left border-b border-(--hairline) last:border-b-0"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--fg)/8 text-xs font-medium shrink-0">
                      {user?.role === "MENTOR"
                        ? thread.user?.name?.[0] ?? "U"
                        : thread.mentor?.displayName?.[0] ?? "M"}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {user?.role === "MENTOR"
                            ? thread.user?.name ?? "User"
                            : thread.mentor?.displayName ?? "Mentor"}
                        </span>
                        <span className="text-[10px] text-(--muted) shrink-0 ml-2">
                          {formatDate(thread.updatedAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-(--muted) truncate">
                          {thread.messages?.[0]?.body ?? "No messages yet"}
                        </span>
                        {(thread.unreadCount ?? 0) > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-(--accent) text-(--accent-fg) text-[10px] px-1.5 shrink-0 ml-2">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<MessageCircle className="h-6 w-6" />}
                title="No conversations"
                description="Start a chat from a mentor's profile page."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
