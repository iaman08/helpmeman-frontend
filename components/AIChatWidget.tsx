"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, X, Trash2, Sparkles, Clock, ChevronRight, MessageSquare, RotateCcw, Plus, History, Calendar, Video, Edit2, Check, Smile, Mic, ArrowUp } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { AxiosError } from "axios";
import { usePathname } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

interface SessionSummary {
  id: string;
  title: string | null;
  summaryPreview: string | null;
  messageCount: number;
  createdAt: string;
}

interface DateGroup {
  date: string;
  sessions: SessionSummary[];
}

interface Booking {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  meetLink: string | null;
  userNotes: string | null;
  mentorNotes: string | null;
  mentor: {
    id: string;
    displayName: string;
    avatar: string | null;
    currentRole: string | null;
    company: string | null;
  };
}

// ─── Markdown helpers ─────────────────────────────────────────────────────────

function parseMarkdownLinks(text: string) {
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    const match = part.match(/\[(.*?)\]\((.*?)\)/);
    if (match) {
      return (
        <Link key={i} href={match[2]} className="text-(--accent) hover:underline font-medium">
          {match[1]}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function formatAIContent(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    const trimmed = line.trim();
    const boldParts = trimmed.split(/(\*\*.*?\*\*)/g);
    const formatted = boldParts.map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return <strong key={j} className="font-semibold">{parseMarkdownLinks(p.slice(2, -2))}</strong>;
      }
      return <span key={j}>{parseMarkdownLinks(p)}</span>;
    });
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      return <li key={i} className="ml-4 list-disc">{formatted}</li>;
    }
    if (trimmed.length === 0) return <br key={i} />;
    return <p key={i} className="leading-relaxed">{formatted}</p>;
  });
}

function formatRelativeDate(isoDate: string) {
  const d = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(isoDate: string) {
  return new Date(isoDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function AIChatWidget() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "history" | "meetings">("chat");

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string | null>(null);
  const [resumeBanner, setResumeBanner] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  // History state
  const [historyGroups, setHistoryGroups] = useState<DateGroup[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Rename features
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isRenamingActive, setIsRenamingActive] = useState(false);

  // Meetings state
  const [meetings, setMeetings] = useState<Booking[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

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

  // ─── Open/close event listeners and route change ───────────────────────────

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    window.addEventListener("open-ai", handleOpen);
    window.addEventListener("close-ai", handleClose);
    return () => {
      window.removeEventListener("open-ai", handleOpen);
      window.removeEventListener("close-ai", handleClose);
    };
  }, []);

  // Close AI Chat drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ─── Auto scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && activeTab === "chat") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, activeTab]);

  // ─── Load history ──────────────────────────────────────────────────────────

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const { data } = await api.get("/ai/sessions");
      setHistoryGroups(data);
    } catch {
      setHistoryGroups([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === "history") {
      loadHistory();
    }
  }, [isOpen, activeTab, loadHistory]);

  // ─── Load meetings ─────────────────────────────────────────────────────────

  const loadMeetings = useCallback(async () => {
    setMeetingsLoading(true);
    try {
      const { data } = await api.get("/ai/meetings");
      setMeetings(data);
    } catch {
      setMeetings([]);
    } finally {
      setMeetingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === "meetings") {
      loadMeetings();
    }
  }, [isOpen, activeTab, loadMeetings]);

  // ─── Resume a past session ─────────────────────────────────────────────────

  const resumeSession = useCallback(async (sid: string, initialTitle: string | null) => {
    setActiveTab("chat");
    setSessionLoading(true);
    setMessages([]);
    setError("");
    setSessionTitle(initialTitle || "Untitled chat");
    try {
      const { data } = await api.get(`/ai/sessions/${sid}/resume`);
      setSessionId(sid);
      setSessionTitle(data.session.title || initialTitle || "Untitled chat");
      setMessages(
        data.messages.map((m: Message) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        }))
      );
      setResumeBanner(`Resuming chat: ${data.session.title || initialTitle || "Untitled chat"}`);
    } catch {
      setError("Failed to load session.");
    } finally {
      setSessionLoading(false);
    }
  }, []);

  // ─── Scoped Meeting Session Chat ────────────────────────────────────────────

  const startMeetingChat = useCallback(async (bookingId: string, mentorName: string, scheduledAt: string) => {
    setActiveTab("chat");
    setSessionLoading(true);
    setMessages([]);
    setError("");
    const defaultTitle = `Meeting Discussion: ${mentorName}`;
    setSessionTitle(defaultTitle);
    try {
      const { data } = await api.post(`/ai/meetings/${bookingId}/session`);
      setSessionId(data.session.id);
      setSessionTitle(data.session.title || defaultTitle);
      setMessages(
        data.messages.map((m: Message) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        }))
      );
      setResumeBanner(`Scoped Meeting: ${mentorName} (${formatRelativeDate(scheduledAt)})`);
    } catch {
      setError("Failed to load meeting context.");
    } finally {
      setSessionLoading(false);
    }
  }, []);

  // ─── Handle close ──────────────────────────────────────────────────────────

  const handleClose = useCallback(async () => {
    setIsOpen(false);
    window.dispatchEvent(new Event("close-ai"));
    // End session async
    if (sessionId && messages.length > 0) {
      api.post(`/ai/sessions/${sessionId}/end`).catch(() => { });
    }
  }, [sessionId, messages.length]);

  // ─── New chat button ───────────────────────────────────────────────────────

  const handleNewChat = useCallback(() => {
    if (sessionId && messages.length > 0) {
      api.post(`/ai/sessions/${sessionId}/end`).catch(() => { });
    }
    setSessionId(null);
    setSessionTitle(null);
    setMessages([]);
    setResumeBanner(null);
    setError("");
    setActiveTab("chat");
  }, [sessionId, messages.length]);

  // ─── Send message ──────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    setInput("");
    setError("");

    const optimisticMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      content: msg,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chat", {
        message: msg,
        sessionId: sessionId || undefined,
      });

      // Update sessionId if server created one lazily
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        // Initially show first message as title before AI summary runs
        setSessionTitle(msg.slice(0, 30) + (msg.length > 30 ? "..." : ""));
      }

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: data.response,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Failed to get response");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }, [input, loading, sessionId]);

  // ─── Save manual rename ───────────────────────────────────────────────────

  const handleSaveRename = useCallback(async (sid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const titleTrimmed = editingTitle.trim();
    if (!titleTrimmed) return;

    try {
      await api.put(`/ai/sessions/${sid}/rename`, { title: titleTrimmed });
      setHistoryGroups(prev =>
        prev.map(g => ({
          ...g,
          sessions: g.sessions.map(s => s.id === sid ? { ...s, title: titleTrimmed } : s)
        }))
      );
      if (sessionId === sid) {
        setSessionTitle(titleTrimmed);
        setResumeBanner(prev => prev?.startsWith("Scoped Meeting") ? prev : `Resuming chat: ${titleTrimmed}`);
      }
      setEditingSessionId(null);
      setIsRenamingActive(false);
    } catch {
      setError("Failed to rename session.");
    }
  }, [editingTitle, sessionId]);

  // ─── Delete session ────────────────────────────────────────────────────────

  const handleDeleteSession = useCallback(async (sid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/sessions/${sid}`);
      setHistoryGroups(prev =>
        prev
          .map(g => ({ ...g, sessions: g.sessions.filter(s => s.id !== sid) }))
          .filter(g => g.sessions.length > 0)
      );
      if (sessionId === sid) {
        handleNewChat();
      }
    } catch {
      // silent
    }
  }, [sessionId, handleNewChat]);

  if (!user) return null;

  // ─── Suggestion chips ──────────────────────────────────────────────────────

  const suggestions = [
    "Find me a DSA mentor under ₹500",
    "How do I book a session?",
    "I need help with PM interviews",
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 left-0 md:left-64 z-[9999] flex flex-col overflow-hidden bg-(--bg) border-l border-(--hairline) animate-in slide-in-from-bottom md:slide-in-from-right duration-300">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-(--hairline) bg-(--bg)/80 backdrop-blur-md sticky top-0 z-10 pt-safe-top md:pt-0">
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3">

          {/* Left Segment: Brand and premium inline breadcrumb layout */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-(--accent)/10 shrink-0">
              <Bot className="h-4.5 w-4.5 text-(--accent)" />
            </div>

            <div className={`shrink-0 ${sessionTitle && activeTab === "chat" ? "hidden sm:block" : ""}`}>
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-(--fg)">
                HelpMeMan AI
              </h3>
            </div>

            {sessionTitle && activeTab === "chat" && (
              <span className="text-(--muted)/40 text-xs shrink-0 font-medium select-none hidden sm:inline">/</span>
            )}

            {sessionTitle && activeTab === "chat" && (
              isRenamingActive && sessionId ? (
                <div className="flex items-center gap-1 bg-(--fg)/5 border border-(--hairline) rounded-full pl-2.5 pr-0.5 py-0.5 max-w-[120px] sm:max-w-[200px] w-full" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="text-[10px] sm:text-xs font-semibold bg-transparent outline-none w-full text-(--fg) placeholder-(--muted)"
                    maxLength={60}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const btn = document.getElementById("header-save-btn");
                        btn?.click();
                      } else if (e.key === "Escape") {
                        setIsRenamingActive(false);
                      }
                    }}
                  />
                  <button
                    id="header-save-btn"
                    type="button"
                    onClick={(e) => handleSaveRename(sessionId, e)}
                    className="p-0.5 text-green-600 hover:bg-green-500/10 rounded-full cursor-pointer shrink-0"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRenamingActive(false)}
                    className="p-0.5 text-red-500 hover:bg-red-500/10 rounded-full cursor-pointer shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 bg-(--accent)/5 border border-(--accent)/15 rounded-full pl-2.5 pr-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-(--accent) shadow-sm hover:bg-(--accent)/8 transition-all min-w-0 max-w-[110px] sm:max-w-[240px]">
                  <Sparkles className="h-2.5 w-2.5 text-(--accent) shrink-0" />
                  <span className="truncate tracking-wide uppercase font-semibold">
                    {sessionTitle}
                  </span>
                  {sessionId && !resumeBanner?.startsWith("Scoped Meeting") && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsRenamingActive(true);
                        setEditingTitle(sessionTitle || "");
                      }}
                      className="text-(--accent)/60 hover:text-(--accent) transition-colors p-0.5 rounded cursor-pointer shrink-0"
                      title="Rename chat"
                    >
                      <Edit2 className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              )
            )}
          </div>

          {/* Right Segment: Action controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Theme Toggle option showing 4 color options inline */}
            {activeTab === "chat" && (
              <div className="flex items-center gap-1 px-1.5 py-1 rounded-full border border-(--hairline) bg-(--fg)/5 select-none shrink-0 shadow-sm">
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
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-200 cursor-pointer mx-0.5 hover:scale-120 ${
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
            )}

            <button
              type="button"
              onClick={handleNewChat}
              className="p-2 text-(--muted) hover:text-(--fg) rounded-xl hover:bg-(--fg)/5 cursor-pointer transition-all duration-200"
              title="New chat"
            >
              <Plus className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-(--muted) hover:text-(--fg) rounded-xl hover:bg-(--fg)/5 cursor-pointer transition-all duration-200"
              title="Close"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 flex gap-1 scrollbar-none overflow-x-auto border-t border-(--hairline)/50">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${activeTab === "chat"
                ? "border-(--accent) text-(--fg)"
                : "border-transparent text-(--muted) hover:text-(--fg)"
              }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            New Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("meetings")}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${activeTab === "meetings"
                ? "border-(--accent) text-(--fg)"
                : "border-transparent text-(--muted) hover:text-(--fg)"
              }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            Meeting Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${activeTab === "history"
                ? "border-(--accent) text-(--fg)"
                : "border-transparent text-(--muted) hover:text-(--fg)"
              }`}
          >
            <History className="h-3.5 w-3.5" />
            History
          </button>
        </div>
      </div>

      {/* ── Chat Tab ───────────────────────────────────────────────────────── */}
      {activeTab === "chat" && (
        <>
          {/* Resume banner */}
          {resumeBanner && (
            <div className="shrink-0 bg-(--accent)/10 border-b border-(--accent)/20 px-4 sm:px-6 py-2.5">
              <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
                <span className="text-xs text-(--accent) flex items-center gap-1.5 font-semibold truncate pr-2">
                  <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                  {resumeBanner}
                </span>
                <button
                  type="button"
                  onClick={() => setResumeBanner(null)}
                  className="text-(--muted) hover:text-(--fg) cursor-pointer p-1 rounded-md hover:bg-(--fg)/5 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 w-full">
            <div className="max-w-4xl w-full mx-auto flex flex-col gap-4 sm:gap-5 min-h-full">

              {/* Loading skeleton */}
              {sessionLoading && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
                  <div className="h-9 w-9 rounded-full border-2 border-(--fg)/10 border-t-(--accent) animate-spin" />
                  <p className="text-xs font-semibold text-(--muted) tracking-wide">LOADING CONVERSATION…</p>
                </div>
              )}

              {/* Empty state */}
              {!sessionLoading && messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center py-12 max-w-md mx-auto">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--accent)/10 shadow-sm animate-pulse">
                    <Sparkles className="h-6 w-6 text-(--accent)" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold">Hi {user.name.split(" ")[0]}! 👋</p>
                    <p className="text-xs text-(--muted) leading-relaxed">
                      I can help you find premium mentors, prepare for tech interviews, review your notes, or draft high-impact study plans.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full pt-2">
                    {suggestions.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setInput(s);
                          inputRef.current?.focus();
                        }}
                        className="text-xs text-left rounded-xl bg-(--fg)/[0.02] hover:bg-(--fg)/5 border border-(--hairline) hover:border-(--fg)/10 px-4 py-3 transition-all duration-200 cursor-pointer shadow-sm font-medium text-(--fg)/90"
                      >
                        &ldquo;{s}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {(() => {
                let lastHeaderTime: Date | null = null;
                // Find index of the last user message to show the read receipt
                let lastUserMsgIndex = -1;
                for (let i = messages.length - 1; i >= 0; i--) {
                  if (messages[i].role === "user") {
                    lastUserMsgIndex = i;
                    break;
                  }
                }

                return messages.map((msg, index) => {
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
                        className={`flex w-full mb-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className="flex flex-col max-w-[85%] sm:max-w-[75%]">
                          <div
                            className={`rounded-[18px] px-4 py-2.5 text-[15px] leading-relaxed shadow-sm ${
                              msg.role === "user"
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
                            {msg.role === "assistant" ? (
                              <div className="flex flex-col gap-1.5 text-[14px] leading-relaxed">
                                {formatAIContent(msg.content)}
                              </div>
                            ) : (
                              msg.content
                            )}
                          </div>

                          {/* Read Receipt underneath outgoing bubble */}
                          {msg.role === "user" && isLastUserMsg && (
                            <div className="text-[10px] font-bold text-(--muted)/80 mt-1 text-right mr-1.5 select-none">
                              Read {formatReadReceiptTime(msgDateStr)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}

              {/* Typing indicator */}
              {loading && (
                <div className="flex justify-start mb-2">
                  <div className="bg-(--fg)/5 border border-(--hairline)/25 rounded-[18px] rounded-bl-[4px] px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-(--muted)/85 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-(--muted)/85 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-(--muted)/85 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="text-xs font-semibold text-red-500 bg-red-500/10 rounded-xl px-4 py-3 border border-red-500/20">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input bar */}
          <div className="shrink-0 border-t border-(--hairline) bg-(--bg) px-4 sm:px-6 py-3 sm:py-4 pb-safe-bottom">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="max-w-4xl w-full mx-auto flex items-center gap-1.5 sm:gap-3 relative"
            >
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
                  placeholder="Message..."
                  maxLength={2000}
                  disabled={loading || sessionLoading}
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
                    type="submit"
                    disabled={loading || sessionLoading}
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
            </form>
          </div>
        </>
      )}

      {/* ── Meeting Chat Tab ─────────────────────────────────────────────────── */}
      {activeTab === "meetings" && (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 w-full">
          <div className="max-w-4xl w-full mx-auto">
            {meetingsLoading && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 rounded-xl bg-(--fg)/[0.03] animate-pulse" />
                ))}
              </div>
            )}

            {!meetingsLoading && meetings.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center max-w-sm mx-auto">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--fg)/5">
                  <Calendar className="h-6 w-6 text-(--muted)" />
                </div>
                <p className="text-sm font-semibold">No mentorship meetings booked yet</p>
                <p className="text-xs text-(--muted) leading-relaxed">Once you book or attend a session, it will show up here to chat about notes and feedback.</p>
              </div>
            )}

            {!meetingsLoading && meetings.map(meeting => (
              <div
                key={meeting.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 rounded-xl bg-(--fg)/[0.02] hover:bg-(--fg)/5 border border-(--hairline) hover:border-(--fg)/10 p-4 mb-3.5 transition-all text-left shadow-sm"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--accent)/10 shrink-0">
                    <Video className="h-4.5 w-4.5 text-(--accent)" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold truncate text-(--fg)">
                        Session with {meeting.mentor.displayName}
                      </h4>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase shrink-0 ${meeting.status === "COMPLETED" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                          meeting.status === "CONFIRMED" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                            meeting.status === "CANCELLED" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                              "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                        }`}>
                        {meeting.status}
                      </span>
                    </div>
                    <p className="text-xs text-(--muted) font-medium mt-0.5">
                      {meeting.mentor.currentRole} {meeting.mentor.company ? `@ ${meeting.mentor.company}` : ""}
                    </p>
                    <p className="text-[11px] text-(--muted) flex items-center gap-1.5 mt-1.5 font-semibold">
                      <Clock className="h-3 w-3" />
                      {formatRelativeDate(meeting.scheduledAt)} at {formatTime(meeting.scheduledAt)} ({meeting.durationMinutes} mins)
                    </p>

                    {(meeting.userNotes || meeting.mentorNotes) && (
                      <div className="mt-2.5 flex flex-col gap-1.5 bg-(--fg)/[0.02] border border-(--hairline)/40 rounded-lg p-2.5 max-w-lg">
                        {meeting.userNotes && (
                          <p className="text-[11px] text-(--muted) leading-relaxed line-clamp-1">
                            <span className="font-semibold text-(--fg)/80">My Notes:</span> {meeting.userNotes}
                          </p>
                        )}
                        {meeting.mentorNotes && (
                          <p className="text-[11px] text-(--muted) leading-relaxed line-clamp-1">
                            <span className="font-semibold text-(--fg)/80">Mentor Notes:</span> {meeting.mentorNotes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end shrink-0 pl-13 sm:pl-0">
                  <button
                    type="button"
                    onClick={() => startMeetingChat(meeting.id, meeting.mentor.displayName, meeting.scheduledAt)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--accent-fg) bg-(--accent) hover:opacity-90 rounded-full px-4 py-2 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Discuss Notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── History Tab ────────────────────────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 w-full">
          <div className="max-w-4xl w-full mx-auto">

            {historyLoading && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 rounded-xl bg-(--fg)/[0.03] animate-pulse" />
                ))}
              </div>
            )}

            {!historyLoading && historyGroups.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center max-w-sm mx-auto">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--fg)/5">
                  <Clock className="h-6 w-6 text-(--muted)" />
                </div>
                <p className="text-sm font-semibold">No chat history yet</p>
                <p className="text-xs text-(--muted) leading-relaxed">Start a conversation to see your smart, AI-summarized history items here.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className="inline-flex items-center gap-2 text-xs font-semibold rounded-full bg-(--accent) text-(--accent-fg) px-5 py-2.5 hover:opacity-90 transition-opacity cursor-pointer mt-2"
                >
                  <Plus className="h-4 w-4" /> Start Chatting
                </button>
              </div>
            )}

            {!historyLoading && historyGroups.map(group => (
              <div key={group.date} className="mb-6 sm:mb-8">
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--muted)">
                    {formatRelativeDate(group.date)}
                  </span>
                  <div className="flex-1 h-px bg-(--hairline)" />
                  <span className="text-[10px] font-bold text-(--muted)/85 uppercase tracking-[0.05em]">{group.sessions.length} {group.sessions.length === 1 ? "chat" : "chats"}</span>
                </div>

                {/* Session cards */}
                <div className="flex flex-col gap-2.5">
                  {group.sessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => {
                        if (editingSessionId !== session.id) {
                          resumeSession(session.id, session.title);
                        }
                      }}
                      className="group flex items-center justify-between gap-3 sm:gap-4 rounded-xl bg-(--fg)/[0.02] hover:bg-(--fg)/5 border border-(--hairline) hover:border-(--fg)/10 p-3.5 sm:p-4 text-left transition-all cursor-pointer shadow-sm"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && editingSessionId !== session.id) {
                          resumeSession(session.id, session.title);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-(--accent)/10 shrink-0">
                          <MessageSquare className="h-4.5 w-4.5 text-(--accent)" />
                        </div>

                        <div className="flex-1 min-w-0">
                          {editingSessionId === session.id ? (
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                className="text-sm font-semibold bg-(--fg)/5 px-2 py-1 rounded border border-(--hairline) outline-none focus:border-(--accent) w-full text-(--fg)"
                                maxLength={60}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const btn = document.getElementById(`save-btn-${session.id}`);
                                    btn?.click();
                                  } else if (e.key === "Escape") {
                                    setEditingSessionId(null);
                                  }
                                }}
                              />
                              <button
                                id={`save-btn-${session.id}`}
                                type="button"
                                onClick={(e) => handleSaveRename(session.id, e)}
                                className="p-1.5 text-green-600 hover:bg-green-500/10 rounded cursor-pointer shrink-0"
                              >
                                <Check className="h-4.5 w-4.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSessionId(null)}
                                className="p-1.5 text-red-500 hover:bg-red-500/10 rounded cursor-pointer shrink-0"
                              >
                                <X className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm font-semibold truncate text-(--fg) tracking-tight">
                                {session.title || "Untitled chat"}
                              </p>
                              {session.summaryPreview && (
                                <p className="text-xs text-(--muted) leading-relaxed line-clamp-1 mt-0.5 font-medium">
                                  {session.summaryPreview}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1 font-semibold text-[10px] text-(--muted)">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(session.createdAt)}
                                </span>
                                {session.messageCount > 0 && (
                                  <span>
                                    · {session.messageCount} messages
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {editingSessionId !== session.id && (
                        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSessionId(session.id);
                              setEditingTitle(session.title || "Untitled chat");
                            }}
                            className="p-2 text-(--muted) hover:text-(--accent) hover:bg-(--accent)/5 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all cursor-pointer"
                            title="Rename chat"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="p-2 text-(--muted) hover:text-red-500 hover:bg-red-500/5 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all cursor-pointer"
                            title="Delete session"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <ChevronRight className="h-4.5 w-4.5 text-(--muted)/60" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
