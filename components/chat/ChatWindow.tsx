"use client";
import { useEffect, useCallback, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft, Lock, AlertTriangle, X, Upload, MessageCircle, Pencil, MoreVertical
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import type { ChatThread, ChatMessage, ChatAttachment } from "@/lib/types";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { useThreadMessages } from "./hooks/useThreadMessages";

interface ChatWindowProps {
  thread: ChatThread | null;
  userId: string;
  userRole: string;
  chatTheme: string;
  onThemeChange?: (theme: string) => void;
  themes?: { id: string; color: string; title: string; border?: boolean }[];
  presenceMap: Record<string, string>;
  typingUserId: string | null;
  onGoBack: () => void;
  onMarkRead: (threadId: string) => void;
  onThreadLockChange: (threadId: string, status: string) => void;
  socketActions: {
    joinThread: (id: string) => void;
    leaveThread: (id: string) => void;
    emitTyping: (id: string) => void;
    emitStopTyping: (id: string) => void;
    emitDelivered: (id: string, msgId: string) => void;
    markSeenId: (id: string) => void;
  };
  externalMessage: ChatMessage | null;
  editedMessage: { messageId: string; body: string; editedAt: string } | null;
  deletedMessage: { messageId: string } | null;
  messagesReadEvent: { threadId: string; readBy: string } | null;
  reactionAddedEvent?: { messageId: string; reaction: any } | null;
  reactionRemovedEvent?: { messageId: string; userId: string; emoji: string } | null;
}

function PresenceLabel({ status }: { status?: string }) {
  if (status === "ONLINE") {
    return (
      <span className="text-[11px] text-green-400 font-medium flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
        Online
      </span>
    );
  }
  if (status === "AWAY") {
    return <span className="text-[11px] text-amber-400 font-medium">Away</span>;
  }
  return <span className="text-[11px] text-(--muted)/60">Offline</span>;
}

function ChatAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const [err, setErr] = useState(false);
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return avatarUrl && !err ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarUrl}
      alt={name}
      className="h-9 w-9 rounded-full object-cover border border-(--hairline)"
      onError={() => setErr(true)}
    />
  ) : (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-(--fg)/10 text-sm font-semibold border border-(--hairline) select-none">
      {initials}
    </div>
  );
}

function EditBanner({
  msg,
  onCancel,
}: {
  msg: ChatMessage;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-2 mx-3 mb-1 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
      <Pencil className="h-3.5 w-3.5 text-amber-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">Editing message</p>
        <p className="text-xs text-(--fg)/60 truncate">{msg.body}</p>
      </div>
      <button
        onClick={onCancel}
        className="p-1 rounded-full hover:bg-(--fg)/10 text-(--muted) cursor-pointer shrink-0"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

export function ChatWindow({
  thread,
  userId,
  userRole,
  chatTheme,
  onThemeChange,
  themes,
  presenceMap,
  typingUserId,
  onGoBack,
  onMarkRead,
  onThreadLockChange,
  socketActions,
  externalMessage,
  editedMessage,
  deletedMessage,
  messagesReadEvent,
  reactionAddedEvent,
  reactionRemovedEvent,
}: ChatWindowProps) {
  const { toast } = useToast();
  const router = useRouter();
  const {
    messages,
    hasMore,
    loadingMore,
    loadMessages,
    loadMore,
    appendMessage,
    updateMessage,
    removeMessage,
    addOptimistic,
    confirmOptimistic,
    failOptimistic,
    clearMessages,
  } = useThreadMessages();

  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editTarget, setEditTarget] = useState<ChatMessage | null>(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintDesc, setComplaintDesc] = useState("");
  const [complaintFile, setComplaintFile] = useState<File | null>(null);
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showHeaderMenu) return;
    function handler(e: MouseEvent) {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) {
        setShowHeaderMenu(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showHeaderMenu]);

  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const isMentor = userRole === "MENTOR";
  const isLocked = thread?.status === "LOCKED" || thread?.status === "CLOSED";
  const isInputBlocked = thread?.status === "CLOSED" || (!isMentor && thread?.status === "LOCKED");

  const otherName = isMentor
    ? thread?.user?.name ?? "User"
    : thread?.mentor?.displayName ?? "Mentor";
  const otherAvatarUrl = isMentor ? thread?.user?.avatar : thread?.mentor?.avatar;
  const otherUserId = isMentor ? thread?.userId : (thread?.mentor as any)?.userId;
  const otherPresenceStatus = otherUserId ? presenceMap[otherUserId] : undefined;

  const myMsgCount = isMentor
    ? thread?.mentorMsgCount ?? 0
    : thread?.userMsgCount ?? 0;
  const msgRemaining = Math.max(0, 3 - myMsgCount);

  useEffect(() => {
    if (!thread) {
      clearMessages();
      return;
    }
    clearMessages();
    setReplyTo(null);
    setEditTarget(null);
    loadMessages(thread.id);
    socketActions.joinThread(thread.id);

    api
      .put(`/chat/threads/${thread.id}/read`)
      .then(() => onMarkRead(thread.id))
      .catch(() => {});

    return () => {
      socketActions.leaveThread(thread.id);
    };
  }, [thread?.id]);

  useEffect(() => {
    if (!externalMessage || !thread || externalMessage.threadId !== thread.id) return;
    appendMessage(externalMessage);
    socketActions.emitDelivered(thread.id, externalMessage.id);
    api
      .put(`/chat/threads/${thread.id}/read`)
      .then(() => onMarkRead(thread.id))
      .catch(() => {});
  }, [externalMessage]);

  useEffect(() => {
    if (!editedMessage) return;
    updateMessage(editedMessage.messageId, {
      body: editedMessage.body,
      editedAt: editedMessage.editedAt,
    });
  }, [editedMessage]);

  useEffect(() => {
    if (!deletedMessage) return;
    removeMessage(deletedMessage.messageId);
  }, [deletedMessage]);

  useEffect(() => {
    if (!messagesReadEvent || !thread || messagesReadEvent.threadId !== thread.id) return;
    messagesRef.current.forEach((m) => {
      if (m.senderId === userId && !m.isRead) {
        updateMessage(m.id, { isRead: true, status: "READ" });
      }
    });
  }, [messagesReadEvent]);

  useEffect(() => {
    if (!reactionAddedEvent) return;
    const msg = messagesRef.current.find(m => m.id === reactionAddedEvent.messageId);
    if (!msg) return;
    const existing = msg.reactions || [];
    const updated = [
      ...existing.filter(r => r.userId !== reactionAddedEvent.reaction.userId),
      reactionAddedEvent.reaction
    ];
    updateMessage(reactionAddedEvent.messageId, {
      reactions: updated
    });
  }, [reactionAddedEvent]);

  useEffect(() => {
    if (!reactionRemovedEvent) return;
    const msg = messagesRef.current.find(m => m.id === reactionRemovedEvent.messageId);
    if (!msg) return;
    const existing = msg.reactions || [];
    const updated = existing.filter(r => r.userId !== reactionRemovedEvent.userId);
    updateMessage(reactionRemovedEvent.messageId, {
      reactions: updated
    });
  }, [reactionRemovedEvent]);

  const handleReact = useCallback(async (messageId: string, emoji: string) => {
    if (!thread) return;
    const msg = messagesRef.current.find(m => m.id === messageId);
    if (!msg) return;

    const existing = msg.reactions || [];
    const myExistingReaction = existing.find(r => r.userId === userId);
    const isSameEmoji = myExistingReaction?.emoji === emoji;

    let newReactions;
    if (myExistingReaction) {
      if (isSameEmoji) {
        newReactions = existing.filter(r => r.userId !== userId);
      } else {
        const updatedReaction = {
          id: myExistingReaction.id,
          messageId,
          userId,
          emoji,
          createdAt: new Date().toISOString()
        };
        newReactions = [
          ...existing.filter(r => r.userId !== userId),
          updatedReaction
        ];
      }
    } else {
      const tempReaction = {
        id: `temp-${Date.now()}`,
        messageId,
        userId,
        emoji,
        createdAt: new Date().toISOString()
      };
      newReactions = [...existing, tempReaction];
    }

    updateMessage(messageId, { reactions: newReactions });

    try {
      if (myExistingReaction && isSameEmoji) {
        await api.delete(`/chat/threads/${thread.id}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
      } else {
        await api.post(`/chat/threads/${thread.id}/messages/${messageId}/reactions`, { emoji });
      }
    } catch (err) {
      updateMessage(messageId, { reactions: existing });
      toast("Failed to update reaction", "error");
    }
  }, [thread, userId, updateMessage, toast]);

  const handleSend = useCallback(
    async (body: string, attachments?: ChatAttachment[], replyToId?: string) => {
      if (!thread) return;

      if (editTarget) {
        const targetId = editTarget.id;
        setEditTarget(null);
        try {
          await api.patch(
            `/chat/threads/${thread.id}/messages/${targetId}`,
            { body }
          );
          updateMessage(targetId, {
            body,
            editedAt: new Date().toISOString(),
          });
        } catch (e: any) {
          toast(e.response?.data?.error || "Failed to edit message", "error");
        }
        return;
      }

      const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const optimistic: ChatMessage = {
        id: tempId,
        _tempId: tempId,
        _sending: true,
        threadId: thread.id,
        senderId: userId,
        senderRole: isMentor ? "MENTOR" : "USER",
        body: body || "",
        isRead: false,
        status: "SENDING",
        attachments: attachments ?? null,
        replyToId: replyToId ?? null,
        replyTo: replyToId
          ? (messagesRef.current.find((m) => m.id === replyToId) ?? null)
          : null,
        createdAt: new Date().toISOString(),
      };

      addOptimistic(optimistic);
      socketActions.markSeenId(tempId);

      try {
        const res = await api.post(`/chat/threads/${thread.id}/messages`, {
          body: body || undefined,
          attachments: attachments || undefined,
          replyToId: replyToId || undefined,
        });
        const realMsg: ChatMessage = res.data.message;
        confirmOptimistic(tempId, realMsg);
        socketActions.markSeenId(realMsg.id);

        if (res.data.thread?.status) {
          onThreadLockChange(thread.id, res.data.thread.status);
        }
      } catch (e: any) {
        failOptimistic(tempId);
        const errMsg = e.response?.data?.error || "Failed to send message";
        toast(errMsg, "error");
        throw e;
      }
    },
    [thread?.id, editTarget, userId, isMentor]
  );

  const handleDelete = useCallback(
    async (msgId: string) => {
      if (!thread) return;
      try {
        await api.delete(`/chat/threads/${thread.id}/messages/${msgId}`);
        removeMessage(msgId);
      } catch (e: any) {
        toast(e.response?.data?.error || "Failed to delete message", "error");
      }
    },
    [thread?.id]
  );

  const handleTyping = useCallback(() => {
    if (thread) socketActions.emitTyping(thread.id);
  }, [thread?.id]);

  const handleStopTyping = useCallback(() => {
    if (thread) socketActions.emitStopTyping(thread.id);
  }, [thread?.id]);

  const handleComplaintSubmit = async () => {
    if (!thread?.mentor?.id) return;
    if (!complaintDesc.trim()) {
      toast("Please describe the issue", "error");
      return;
    }
    setComplaintSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("mentorId", thread.mentor.id);
      fd.append("description", complaintDesc.trim());
      if (complaintFile) fd.append("proof", complaintFile);
      await api.post("/users/me/complaints", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast("Complaint submitted successfully", "success");
      setShowComplaintModal(false);
      setComplaintDesc("");
      setComplaintFile(null);
    } catch (e: any) {
      toast(e.response?.data?.error || "Failed to submit", "error");
    } finally {
      setComplaintSubmitting(false);
    }
  };

  if (!thread) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center select-none p-8" style={{ background: "var(--bg, #fff)" }}>
        <div className="h-16 w-16 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)" }}>
          <MessageCircle className="h-7 w-7" style={{ color: "rgba(0,0,0,0.3)" }} />
        </div>
        <h3 className="text-base font-semibold" style={{ color: "var(--fg, #111)" }}>No Conversation Selected</h3>
        <p className="text-xs max-w-xs mt-1.5 leading-relaxed text-center" style={{ color: "rgba(0,0,0,0.4)" }}>
          Choose a conversation from the sidebar to start chatting.
        </p>
      </div>
    );
  }

  const otherAvatar = isMentor ? thread?.user?.avatar : thread?.mentor?.avatar;

  return (
    <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden" style={{ background: "var(--bg, #fff)" }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b border-(--hairline) shrink-0" style={{ background: "var(--bg, #fff)", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={onGoBack}
            className="cursor-pointer md:hidden shrink-0 flex items-center justify-center h-8 w-8 rounded-full transition-colors active:opacity-60"
            style={{ color: "var(--muted, #888)" }}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div 
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => {
              if (!isMentor && thread?.mentor?.id) {
                router.push(`/mentors/${thread.mentor.id}`);
              } else {
                setShowProfileModal(true);
              }
            }}
          >
            <ChatAvatar name={otherName} avatarUrl={otherAvatar} />

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold truncate" style={{ color: "var(--fg, #111)" }}>{otherName}</span>
              {isLocked ? (
                <span className="text-[10px] text-amber-500 flex items-center gap-1 font-medium">
                  <Lock className="h-3 w-3" />
                  Thread locked
                </span>
              ) : (
                <PresenceLabel status={otherPresenceStatus} />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isMentor && !isLocked && msgRemaining <= 2 && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border select-none hidden sm:inline-flex"
              style={{
                background: msgRemaining === 0 ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                color: msgRemaining === 0 ? "#f87171" : "#f59e0b",
                borderColor: msgRemaining === 0 ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)",
              }}
            >
              {msgRemaining === 0
                ? "No messages left"
                : `${msgRemaining} msg${msgRemaining !== 1 ? "s" : ""} left`}
            </span>
          )}

          <div className="relative" ref={headerMenuRef}>
            <button
              type="button"
              onClick={() => setShowHeaderMenu((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-all cursor-pointer active:scale-95"
              style={{ color: "var(--muted, #888)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              aria-label="More options"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {showHeaderMenu && (
              <div
                className="absolute top-full right-0 mt-1.5 rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right z-[60]"
                style={{
                  minWidth: 200,
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.1)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                {themes && onThemeChange && (
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "rgba(0,0,0,0.4)" }}>Bubble Color</p>
                    <div className="flex items-center gap-2.5">
                      {themes.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => { onThemeChange(t.id); }}
                          title={t.title}
                          className="transition-transform cursor-pointer"
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            backgroundColor: t.color,
                            border: t.border ? "1px solid rgba(128,128,128,0.4)" : "none",
                            outline: chatTheme === t.id ? "3px solid #007aff" : "2px solid transparent",
                            outlineOffset: 2,
                            transform: chatTheme === t.id ? "scale(1.15)" : "scale(1)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {!isMentor ? (
                  <button
                    type="button"
                    onClick={() => { setShowComplaintModal(true); setShowHeaderMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm cursor-pointer text-left transition-colors"
                    style={{ color: "#ef4444" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span className="font-medium">Report Mentor</span>
                  </button>
                ) : (
                  <div className="px-4 py-3 text-xs" style={{ color: "rgba(0,0,0,0.4)" }}>
                    No actions available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Messages viewport ── */}
      <MessageList
        messages={messages}
        userId={userId}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={() => loadMore(thread.id)}
        onReply={(msg) => { setReplyTo(msg); setEditTarget(null); }}
        onEdit={(msg) => { setEditTarget(msg); setReplyTo(null); }}
        onDelete={handleDelete}
        onReact={handleReact}
        onImageClick={(url: string, name: string) => setLightbox({ url, name })}
        onProfileClick={() => {
          if (!isMentor && thread?.mentor?.id) {
            router.push(`/mentors/${thread.mentor.id}`);
          } else {
            setShowProfileModal(true);
          }
        }}
        chatTheme={chatTheme}
        otherName={otherName}
      />

      {/* ── Typing indicator ── */}
      {typingUserId && (
        <div className="px-4 pt-1 shrink-0">
          <TypingIndicator typingUserName={otherName} />
        </div>
      )}

      {/* ── Edit banner ── */}
      {editTarget && (
        <EditBanner msg={editTarget} onCancel={() => setEditTarget(null)} />
      )}

      {/* ── Input area ── */}
      {isInputBlocked ? (
        <div className="px-5 py-4 border-t border-(--hairline) text-center shrink-0 bg-(--fg)/[0.002]">
          <div className="flex items-center justify-center gap-2 text-sm text-(--muted) mb-3">
            <Lock className="h-4 w-4 text-amber-500 shrink-0" />
            <span>
              {thread.status === "CLOSED"
                ? "This conversation has been closed."
                : "Message limit reached — book a session to continue."}
            </span>
          </div>
          {thread.status !== "CLOSED" && !isMentor && (
            <a
              href={`/book?mentorId=${thread.mentorId}`}
              className="inline-flex items-center gap-1.5 bg-(--accent) text-(--accent-fg) text-xs font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity shadow-sm"
            >
              Book a session →
            </a>
          )}
        </div>
      ) : (
        <ChatInput
          threadId={thread.id}
          chatTheme={chatTheme}
          disabled={false}
          replyTo={replyTo}
          editTarget={editTarget}
          onClearReply={() => setReplyTo(null)}
          onSend={handleSend}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
        />
      )}

      {/* ── Report / Complaint Modal ── */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#27272a]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-white">Report Mentor</h3>
              </div>
              <button
                type="button"
                onClick={() => !complaintSubmitting && setShowComplaintModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Complaint Details
                </label>
                <textarea
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  placeholder="Describe the issue or inappropriate behavior..."
                  rows={4}
                  maxLength={1000}
                  className="w-full bg-[#1c1c1f] text-sm text-white border border-[#27272a] focus:border-red-500/50 outline-none rounded-xl p-3 placeholder-zinc-500 resize-none transition-colors"
                />
                <span className="text-[10px] text-zinc-500 text-right">
                  {complaintDesc.length}/1000
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Upload Proof (Optional)
                </label>
                {complaintFile ? (
                  <div className="flex items-center justify-between bg-[#1c1c1f] border border-[#27272a] rounded-xl px-4 py-3 text-sm">
                    <div className="flex items-center gap-2 text-zinc-300 min-w-0">
                      <Upload className="h-4 w-4 shrink-0 text-red-500" />
                      <span className="truncate">{complaintFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setComplaintFile(null)}
                      className="text-zinc-500 hover:text-red-400 p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#27272a] hover:border-red-500/30 bg-[#1c1c1f]/40 hover:bg-[#1c1c1f]/80 rounded-xl p-6 cursor-pointer transition-all group">
                    <Upload className="h-8 w-8 text-zinc-500 group-hover:text-red-400 transition-colors" />
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">
                      Click to upload image or PDF (Max 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          if (f.size > 5 * 1024 * 1024) {
                            toast("File size exceeds 5MB", "error");
                          } else {
                            setComplaintFile(f);
                          }
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-[#18181b] border-t border-[#27272a] flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={complaintSubmitting}
                onClick={() => {
                  setShowComplaintModal(false);
                  setComplaintDesc("");
                  setComplaintFile(null);
                }}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={complaintSubmitting || !complaintDesc.trim()}
                onClick={handleComplaintSubmit}
                className="bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 px-5 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer shadow-lg flex items-center gap-1.5"
              >
                {complaintSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile Modal ── */}
      {showProfileModal && (
        <UserProfileModal
          name={otherName}
          avatarUrl={otherAvatar}
          username={isMentor ? thread?.user?.username : undefined}
          email={isMentor ? thread?.user?.email : undefined}
          role={isMentor ? (thread?.user?.role || "USER") : "MENTOR"}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* ── Image Lightbox ── */}
      {lightbox && (
        <ImageLightbox
          url={lightbox.url}
          name={lightbox.name}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

interface ProfileModalProps {
  name: string;
  avatarUrl?: string | null;
  username?: string | null;
  email?: string | null;
  role: string;
  onClose: () => void;
}

function UserProfileModal({ name, avatarUrl, username, email, role, onClose }: ProfileModalProps) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const [imgErr, setImgErr] = useState(false);

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200" 
      style={{ zIndex: 9999, position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" 
        style={{ background: "var(--bg, #fff)", border: "1px solid rgba(0,0,0,0.08)", zIndex: 10000, position: "relative" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-28 bg-gradient-to-tr from-blue-500/20 to-purple-500/10" />

        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-sm hover:bg-black/10 transition-all cursor-pointer text-zinc-500"
          style={{ position: "absolute", top: "12px", right: "12px", border: "none", background: "transparent", cursor: "pointer" }}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pb-8 pt-0 flex flex-col items-center -mt-14">
          <div className="relative mb-4">
            {avatarUrl && !imgErr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={name}
                className="h-24 w-24 rounded-full object-cover border-4 shadow-md"
                style={{ borderColor: "var(--bg, #fff)" }}
                onError={() => setImgErr(true)}
              />
            ) : (
              <div 
                className="flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold border-4 shadow-md bg-gradient-to-br from-blue-500/10 to-purple-500/10"
                style={{ borderColor: "var(--bg, #fff)" }}
              >
                {initials}
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold text-center mb-1" style={{ color: "var(--fg, #111)" }}>{name}</h2>
          <p className="text-xs uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full mb-6" style={{ background: "rgba(0,0,0,0.04)", color: "var(--muted, #888)", border: "1px solid rgba(0,0,0,0.06)" }}>
            {role}
          </p>

          <div className="w-full flex flex-col gap-3.5 pt-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            {username && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium" style={{ color: "var(--muted, #888)" }}>Username</span>
                <span className="font-semibold" style={{ color: "var(--fg, #111)" }}>@{username}</span>
              </div>
            )}
            {email && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium" style={{ color: "var(--muted, #888)" }}>Email Address</span>
                <span className="font-semibold truncate max-w-[180px]" style={{ color: "var(--fg, #111)" }} title={email}>{email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ImageLightbox({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] p-4 cursor-zoom-out animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
      >
        <X className="h-6 w-6" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={name}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg animate-in zoom-in-95 duration-200 select-none shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        crossOrigin="anonymous"
      />
    </div>,
    document.body
  );
}
