"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/Toast";
import type { ChatThread, ChatMessage, PresenceStatus } from "@/lib/types";
import { mutate } from "swr";

import { ThreadList } from "./ThreadList";
import { ChatWindow } from "./ChatWindow";
import { useChatSocket, type ChatSocketCallbacks } from "./hooks/useChatSocket";

const THEMES = [
  { id: "imessage", color: "#007aff", title: "iMessage" },
  { id: "sms",      color: "#34c759", title: "SMS Green" },
  { id: "pink",     color: "#ff2d55", title: "Pink" },
  { id: "white",    color: "#f0f0f0", title: "White", border: true },
] as const;

export function UnifiedChat() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [loading, setLoading] = useState(true);

  const [latestMessage, setLatestMessage] = useState<ChatMessage | null>(null);
  const [latestEdit, setLatestEdit] = useState<{ messageId: string; body: string; editedAt: string } | null>(null);
  const [latestDelete, setLatestDelete] = useState<{ messageId: string } | null>(null);
  const [latestReadEvent, setLatestReadEvent] = useState<{ threadId: string; readBy: string } | null>(null);
  const [latestReactionAdd, setLatestReactionAdd] = useState<{ messageId: string; reaction: any } | null>(null);
  const [latestReactionRemove, setLatestReactionRemove] = useState<{ messageId: string; userId: string; emoji: string } | null>(null);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [presenceMap, setPresenceMap] = useState<Record<string, string>>({});

  const [chatTheme, setChatTheme] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("helpmeman.chatTheme");
      if (saved && THEMES.some(t => t.id === saved)) return saved;
    }
    return "imessage";
  });

  useEffect(() => {
    localStorage.setItem("helpmeman.chatTheme", chatTheme);
  }, [chatTheme]);

  const activeThreadRef = useRef(activeThread);
  useEffect(() => { activeThreadRef.current = activeThread; }, [activeThread]);

  const onMessage = useCallback((msg: ChatMessage) => {
    const isCurrent = activeThreadRef.current?.id === msg.threadId;
    setThreads(prev => prev.map(t =>
      t.id === msg.threadId
        ? {
            ...t,
            messages: [msg],
            updatedAt: msg.createdAt,
            unreadCount: isCurrent
              ? 0
              : (t.unreadCount ?? 0) + 1,
          }
        : t
    ));
    setLatestMessage(msg);
    if (user?.id) {
      mutate(["/chat/unread-count", user.id]);
    }
  }, [user]);

  const onMessageEdited = useCallback((data: { messageId: string; body: string; editedAt: string }) => {
    setLatestEdit(data);
  }, []);

  const onMessageDeleted = useCallback((data: { messageId: string }) => {
    setLatestDelete(data);
  }, []);

  const onMessagesRead = useCallback((data: { threadId: string; readBy: string }) => {
    setLatestReadEvent(data);
  }, []);

  const onMessageStatusUpdate = useCallback((_data: { messageId: string; status: string }) => {
    // Handled inside ChatWindow
  }, []);

  const onTyping = useCallback((data: { userId: string }) => {
    if (data.userId === user?.id) return;
    setTypingUserId(data.userId);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => setTypingUserId(null), 5000);
  }, [user?.id]);

  const onStopTyping = useCallback((_data: { userId: string }) => {
    setTypingUserId(null);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  }, []);

  const onThreadLocked = useCallback((data: { threadId: string; reason: string }) => {
    setActiveThread(prev =>
      prev?.id === data.threadId ? { ...prev, status: "LOCKED" } : prev
    );
    setThreads(prev =>
      prev.map(t => t.id === data.threadId ? { ...t, status: "LOCKED" } : t)
    );
  }, []);

  const onPresenceUpdate = useCallback((data: { userId: string; status: PresenceStatus }) => {
    setPresenceMap(prev => ({ ...prev, [data.userId]: data.status }));
  }, []);

  const onNewMessageNotification = useCallback((data: { threadId: string; message: ChatMessage }) => {
    if (data.message.senderId !== user?.id) {
      if (activeThreadRef.current?.id !== data.threadId) {
        setThreads(prev => prev.map(t =>
          t.id === data.threadId
            ? { ...t, messages: [data.message], updatedAt: data.message.createdAt, unreadCount: (t.unreadCount ?? 0) + 1 }
            : t
        ));
        toast(`New message from ${data.message.senderRole === "MENTOR" ? "your mentor" : "a student"}`, "info");
      }
    } else {
      setThreads(prev => prev.map(t =>
        t.id === data.threadId
          ? { ...t, messages: [data.message], updatedAt: data.message.createdAt }
          : t
      ));
    }
    if (user?.id) {
      mutate(["/chat/unread-count", user.id]);
    }
  }, [user, toast]);

  const socketCallbacks: ChatSocketCallbacks = {
    onMessage,
    onMessageEdited,
    onMessageDeleted,
    onMessagesRead,
    onMessageStatusUpdate,
    onTyping,
    onStopTyping,
    onThreadLocked,
    onPresenceUpdate,
    onNewMessageNotification,
    onReactionAdded: (data) => setLatestReactionAdd(data),
    onReactionRemoved: (data) => setLatestReactionRemove(data),
  };

  const { joinThread, leaveThread, emitTyping, emitStopTyping, emitDelivered, markSeenId } =
    useChatSocket(socketCallbacks);

  const socketActions = { joinThread, leaveThread, emitTyping, emitStopTyping, emitDelivered, markSeenId };

  useEffect(() => {
    api.get("/chat/threads")
      .then(async (res) => {
        const loadedThreads: ChatThread[] = res.data.threads ?? [];
        setThreads(loadedThreads);

        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const mentorId = params.get("mentorId");
          if (mentorId) {
            const existing = loadedThreads.find(
              t => t.mentorId === mentorId || (t.mentor as any)?.id === mentorId
            );
            if (existing) {
              setActiveThread(existing);
            } else {
              try {
                const startRes = await api.post("/chat/threads", { mentorId });
                const newThread: ChatThread = startRes.data.thread;
                if (newThread) {
                  setThreads(prev =>
                    prev.some(t => t.id === newThread.id) ? prev : [newThread, ...prev]
                  );
                  setActiveThread(newThread);
                }
              } catch (err) {
                console.error("[CHAT] Failed to start thread:", err);
              }
            }
          }
        }
      })
      .catch((err) => {
        console.error("[CHAT] Failed to load threads:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectThread = useCallback((thread: ChatThread) => {
    setActiveThread(thread);
    setTypingUserId(null);
    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unreadCount: 0 } : t));
  }, []);

  const handleGoBack = useCallback(() => {
    setActiveThread(null);
    setTypingUserId(null);
  }, []);

  const handleMarkRead = useCallback((threadId: string) => {
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, unreadCount: 0 } : t));
    if (user?.id) {
      mutate(["/chat/unread-count", user.id]);
    }
  }, [user]);

  const handleThreadLockChange = useCallback((threadId: string, status: string) => {
    setActiveThread(prev =>
      prev?.id === threadId ? { ...prev, status: status as any } : prev
    );
    setThreads(prev =>
      prev.map(t => t.id === threadId ? { ...t, status: status as any } : t)
    );
  }, []);

  const totalUnread = threads.reduce((sum, t) => sum + (t.unreadCount ?? 0), 0);

  return (
    <>
      {/* ── MOBILE: fixed full-screen panel below top nav ── */}
      <div className="md:hidden fixed inset-0 top-[64px] z-30 flex flex-col" style={{ background: "var(--bg, #fff)" }}>
        <div className={`flex-1 flex flex-col min-h-0 ${activeThread ? "hidden" : "flex"}`}>
          <div className="flex items-center justify-between px-4 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] font-bold" style={{ color: "var(--muted, #888)" }}>Chat</p>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl leading-tight">Messages.</h1>
                {totalUnread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-bold px-1" style={{ background: "var(--accent, #111)", color: "var(--accent-fg, #fff)" }}>
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ThreadList
              threads={threads}
              activeThreadId={activeThread?.id}
              loading={loading}
              userRole={user?.role}
              presenceMap={presenceMap}
              onSelectThread={handleSelectThread}
            />
          </div>
        </div>

        <div className={`flex-1 flex flex-col min-h-0 ${!activeThread ? "hidden" : "flex"}`}>
          <ChatWindow
            thread={activeThread}
            userId={user?.id ?? ""}
            userRole={user?.role ?? "USER"}
            chatTheme={chatTheme}
            onThemeChange={setChatTheme}
            themes={THEMES as unknown as { id: string; color: string; title: string; border?: boolean }[]}
            presenceMap={presenceMap}
            typingUserId={typingUserId}
            onGoBack={handleGoBack}
            onMarkRead={handleMarkRead}
            onThreadLockChange={handleThreadLockChange}
            socketActions={socketActions}
            externalMessage={latestMessage}
            editedMessage={latestEdit}
            deletedMessage={latestDelete}
            messagesReadEvent={latestReadEvent}
            reactionAddedEvent={latestReactionAdd}
            reactionRemovedEvent={latestReactionRemove}
          />
        </div>
      </div>

      {/* ── DESKTOP: normal in-flow layout ── */}
      <div className="hidden md:flex flex-col gap-4 h-[calc(100vh-80px)]">
        <div className="flex flex-col gap-1 shrink-0">
          <p className="text-xs uppercase tracking-[0.22em] font-bold" style={{ color: "var(--muted, #888)" }}>Chat</p>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl leading-tight">Messages.</h1>
            {totalUnread > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-bold px-1.5" style={{ background: "var(--accent, #111)", color: "var(--accent-fg, #fff)" }}>
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden flex shadow-sm flex-1 min-h-0 relative" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="h-full shrink-0 flex flex-col">
            <ThreadList
              threads={threads}
              activeThreadId={activeThread?.id}
              loading={loading}
              userRole={user?.role}
              presenceMap={presenceMap}
              onSelectThread={handleSelectThread}
            />
          </div>

          <div className="h-full flex-1 min-w-0 flex flex-col">
            <ChatWindow
              thread={activeThread}
              userId={user?.id ?? ""}
              userRole={user?.role ?? "USER"}
              chatTheme={chatTheme}
              onThemeChange={setChatTheme}
              themes={THEMES as unknown as { id: string; color: string; title: string; border?: boolean }[]}
              presenceMap={presenceMap}
              typingUserId={typingUserId}
              onGoBack={handleGoBack}
              onMarkRead={handleMarkRead}
              onThreadLockChange={handleThreadLockChange}
              socketActions={socketActions}
              externalMessage={latestMessage}
              editedMessage={latestEdit}
              deletedMessage={latestDelete}
              messagesReadEvent={latestReadEvent}
              reactionAddedEvent={latestReactionAdd}
              reactionRemovedEvent={latestReactionRemove}
            />
          </div>
        </div>
      </div>
    </>
  );
}
