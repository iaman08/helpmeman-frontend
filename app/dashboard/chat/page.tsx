"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, MessageCircle, Lock, ArrowLeft, Plus, Smile, Mic, ArrowUp, AlertTriangle, Upload, X } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import type { ChatThread, ChatMessage } from "@/lib/types";
import { useToast } from "@/components/Toast";

const getSocketUrl = () => {
  if (
    typeof window !== "undefined" &&
    (window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("helpmeman.com"))
  ) {
    return "https://helpmeman-backend-7r53z.ondigitalocean.app";
  }
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  return "http://localhost:8080";
};

const SOCKET_URL = getSocketUrl();

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

function formatAppleMessageHeader(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeStr = `${hours}:${minutes} ${ampm}`;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const dayOfWeek = dayNames[date.getDay()];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  if (year !== now.getFullYear()) {
    return `${month} ${day}, ${year} at ${timeStr}`;
  } else {
    return `${dayOfWeek}, ${month} ${day} at ${timeStr}`;
  }
}

function formatReadReceiptTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeStr = `${hours}:${minutes} ${ampm}`;

  if (msgDate.getTime() === today.getTime()) {
    return timeStr;
  } else if (msgDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  }
}

export default function ChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socketRef, setSocketRef] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Complaint states
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintDesc, setComplaintDesc] = useState("");
  const [complaintFile, setComplaintFile] = useState<File | null>(null);
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);

  // Theme state: imessage, sms, pink, white
  const [chatTheme, setChatTheme] = useState<"imessage" | "sms" | "pink" | "white">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("helpmeman.chatTheme");
      if (saved === "imessage" || saved === "sms" || saved === "pink" || saved === "white") return saved;
    }
    return "imessage";
  });

  useEffect(() => {
    localStorage.setItem("helpmeman.chatTheme", chatTheme);
  }, [chatTheme]);

  // Click outside to close emoji picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ─── Load threads ─── */
  useEffect(() => {
    api
      .get("/chat/threads")
      .then((res) => setThreads(res.data.threads))
      .catch(() => { })
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
        await api.put(`/chat/threads/${thread.id}/read`).catch(() => { });
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

  const handleComplaintSubmit = async () => {
    if (!activeThread?.mentor?.id) return;
    if (!complaintDesc.trim()) {
      toast("Please enter a description for your complaint.", "error");
      return;
    }

    setComplaintSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("mentorId", activeThread.mentor.id);
      formData.append("description", complaintDesc.trim());
      if (complaintFile) {
        formData.append("proof", complaintFile);
      }

      await api.post("/users/me/complaints", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast("Complaint submitted successfully.", "success");
      setComplaintDesc("");
      setComplaintFile(null);
      setShowComplaintModal(false);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to submit complaint.";
      toast(errMsg, "error");
    } finally {
      setComplaintSubmitting(false);
    }
  };

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
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-(--hairline)">
              <div className="flex items-center gap-3">
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

              <div className="flex items-center gap-3 shrink-0">
                {user?.role !== "MENTOR" && (
                  <button
                    type="button"
                    onClick={() => setShowComplaintModal(true)}
                    className="text-xs font-medium text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" /> Report
                  </button>
                )}

                {/* Theme Toggle option showing 4 color options inline */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-(--hairline) bg-(--fg)/5 select-none shrink-0 shadow-sm">
                  {[
                    { id: "imessage", color: "#007aff", title: "iMessage (Blue)" },
                    { id: "sms", color: "#34c759", title: "SMS (Green)" },
                    { id: "pink", color: "#ff2d55", title: "Pink Theme" },
                    { id: "white", color: "#ffffff", title: "White Theme", border: true }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setChatTheme(t.id as any)}
                      className={`h-3 w-3 rounded-full transition-all duration-200 cursor-pointer hover:scale-120 ${
                        chatTheme === t.id
                          ? "ring-2 ring-(--fg) ring-offset-1 ring-offset-(--bg) scale-110"
                          : "opacity-60 hover:opacity-100"
                      }`}
                      style={{
                        backgroundColor: t.color,
                        border: t.border ? "1px solid rgba(128, 128, 128, 0.4)" : "none"
                      }}
                      title={t.title}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-sm text-(--muted)">
                  No messages yet. Start the conversation!
                </div>
              ) : (() => {
                let lastHeaderTime: Date | null = null;
                // Find index of the last user message to show the read receipt
                let lastUserMsgIndex = -1;
                for (let i = messages.length - 1; i >= 0; i--) {
                  if (messages[i].senderId === user?.id) {
                    lastUserMsgIndex = i;
                    break;
                  }
                }

                return messages.map((msg, index) => {
                  const isMine = msg.senderId === user?.id;
                  const msgDateStr = msg.createdAt || new Date().toISOString();
                  const msgTime = new Date(msgDateStr);

                  // Show header if it's the first message or if the gap since the last header is > 15 minutes
                  let showHeader = false;
                  if (index === 0) {
                    showHeader = true;
                    lastHeaderTime = msgTime;
                  } else if (lastHeaderTime && (msgTime.getTime() - lastHeaderTime.getTime() > 15 * 60 * 1000)) {
                    showHeader = true;
                    lastHeaderTime = msgTime;
                  }

                  const isLastUserMsg = index === lastUserMsgIndex;

                  return (
                    <div key={msg.id} className="w-full flex flex-col">
                      {/* Centered Date Header */}
                      {showHeader && (
                        <div className="flex flex-col items-center my-5 select-none">
                          <span className="text-[11px] font-semibold text-(--muted) tracking-tight">
                            {formatAppleMessageHeader(msgDateStr)}
                          </span>
                        </div>
                      )}

                      {/* Bubble Container */}
                      <div
                        className={`flex w-full mb-2 ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div className="flex flex-col max-w-[75%]">
                          <div
                            className={`rounded-[18px] px-4 py-2.5 text-[15px] leading-relaxed shadow-sm ${
                              isMine
                                ? chatTheme === "imessage"
                                  ? "bg-[#007aff] text-white rounded-br-[4px]"
                                  : chatTheme === "sms"
                                  ? "bg-[#34c759] text-white rounded-br-[4px]"
                                  : chatTheme === "pink"
                                  ? "bg-[#ff2d55] text-white rounded-br-[4px]"
                                  : "bg-white dark:bg-zinc-100 text-zinc-900 border border-zinc-200/60 rounded-br-[4px]"
                                : "bg-(--fg)/5 border border-(--hairline)/25 text-(--fg) rounded-bl-[4px]"
                            }`}
                          >
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                          </div>

                          {/* Read Receipt underneath outgoing bubble */}
                          {isMine && isLastUserMsg && (
                            <div className="text-[10px] font-bold text-(--muted)/85 mt-1 text-right mr-1.5 select-none">
                              Read {formatReadReceiptTime(msgDateStr)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {isLocked ? (
              <div className="px-5 py-4 border-t border-(--hairline) text-center text-sm text-(--muted) flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                This thread is locked. Book a session to continue chatting.
              </div>
            ) : (
              <div className="px-4 py-3 sm:px-5 sm:py-4 border-t border-(--hairline)">
                <div className="flex items-center gap-1.5 sm:gap-3 relative">
                  {/* Input Wrapper */}
                  <div 
                    className={`flex-1 flex items-center bg-(--fg)/5 rounded-full px-3.5 py-2 sm:py-2.5 border transition-all ${
                      chatTheme === "imessage"
                        ? "border-(--hairline)/45 focus-within:border-[#007aff]/60 focus-within:bg-(--fg)/8"
                        : chatTheme === "sms"
                        ? "border-(--hairline)/45 focus-within:border-[#34c759]/60 focus-within:bg-(--fg)/8"
                        : chatTheme === "pink"
                        ? "border-(--hairline)/45 focus-within:border-[#ff2d55]/60 focus-within:bg-(--fg)/8"
                        : "border-(--hairline)/45 focus-within:border-(--fg)/40 focus-within:bg-(--fg)/8"
                    }`}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Message..."
                      maxLength={500}
                      className="flex-1 bg-transparent text-sm outline-none placeholder-(--muted)/60 disabled:opacity-50 text-(--fg)"
                      style={{ 
                        caretColor: 
                          chatTheme === "imessage" ? "#007aff" : 
                          chatTheme === "sms" ? "#34c759" : 
                          chatTheme === "pink" ? "#ff2d55" : "var(--fg)" 
                      }}
                    />
                    
                    {/* Waveform / Mic icon on the right inside input pill if input is empty */}
                    {!input.trim() ? (
                      <Mic className="h-4.5 w-4.5 text-(--muted)/85 hover:text-(--fg) cursor-pointer transition-colors ml-2" />
                    ) : (
                      /* Send Button inside input pill if input is not empty */
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={sending}
                        className={`flex h-7 w-7 items-center justify-center rounded-full hover:opacity-90 cursor-pointer disabled:opacity-30 shrink-0 transition-all duration-200 ml-2 ${
                          chatTheme === "white" ? "text-zinc-900 border border-zinc-200" : "text-white"
                        }`}
                        style={{ 
                          backgroundColor: 
                            chatTheme === "imessage" ? "#007aff" : 
                            chatTheme === "sms" ? "#34c759" : 
                            chatTheme === "pink" ? "#ff2d55" : "#ffffff" 
                        }}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Emoji/Smile Button on the far right */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(prev => !prev)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-(--muted) hover:text-(--fg) hover:bg-(--fg)/5 shrink-0 transition-all active:scale-95 cursor-pointer"
                      title="Emojis"
                    >
                      <Smile className="h-5.5 w-5.5" />
                    </button>

                    {showEmojiPicker && (
                      <div
                        ref={emojiPickerRef}
                        className="absolute bottom-12 right-0 p-2.5 bg-(--bg) border border-(--hairline) rounded-2xl shadow-xl grid grid-cols-6 gap-1.5 z-50 w-60 animate-in fade-in slide-in-from-bottom-2 duration-150"
                      >
                        {["😀", "😂", "🥰", "😍", "🤔", "👀", "👍", "👎", "❤️", "🔥", "👏", "🎉", "🚀", "💡", "✨", "💯", "🥳", "🤖", "👋", "🙏", "❌", "✅", "⚠️", "💬"].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setInput(prev => prev + emoji);
                              inputRef.current?.focus();
                            }}
                            className="h-8 w-8 flex items-center justify-center text-lg hover:bg-(--fg)/5 rounded-lg active:scale-90 transition-transform cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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

      {/* Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#27272a]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-white">Report Mentor</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!complaintSubmitting) {
                    setShowComplaintModal(false);
                    setComplaintDesc("");
                    setComplaintFile(null);
                  }
                }}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Complaint Details
                </label>
                <textarea
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  placeholder="Please explain the issue or inappropriate behavior in detail..."
                  rows={4}
                  maxLength={1000}
                  className="w-full bg-[#1c1c1f] text-sm text-white border border-[#27272a] focus:border-red-500/50 outline-none rounded-xl p-3 placeholder-zinc-500 resize-none transition-colors"
                />
                <span className="text-[10px] text-zinc-500 text-right">
                  {complaintDesc.length}/1000 characters
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
                      <span className="text-xs text-zinc-500 shrink-0">
                        ({(complaintFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setComplaintFile(null)}
                      className="text-zinc-500 hover:text-red-400 p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
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
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast("File size exceeds 5MB limit.", "error");
                          } else {
                            setComplaintFile(file);
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Modal Footer */}
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
                className="bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 px-5 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer shadow-lg shadow-red-950/20 flex items-center gap-1.5"
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
    </div>
  );
}
