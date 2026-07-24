"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Bot, X, Trash2, Sparkles, Clock, ChevronRight, MessageSquare, RotateCcw, Plus, History, Calendar, Video, Edit2, Check, Smile, Mic, ArrowUp, Star, BadgeCheck, Zap } from "lucide-react";
import api, { API_BASE } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AxiosError } from "axios";
import { useAIStream } from "@/hooks/useAIStream";
import { chatSoundService } from "@/lib/chatSoundService";


// ─── Types ────────────────────────────────────────────────────────────────────

interface MentorData {
  id: string;
  displayName: string;
  bio: string;
  avatar?: string | null;
  currentRole?: string | null;
  company?: string | null;
  expertise: string[];
  institutionName: string;
  institutionType: string;
  rating: number;
  totalSessions: number;
  pricePerSession: number;
  sessionDuration: number;
}

interface BookingSuccess {
  bookingId: string;
  mentorName: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingType: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  mentors?: MentorData[];
  bookingSuccess?: BookingSuccess;
  mentorProfile?: MentorData;
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

function parseMarkdownLinks(text: string, mentors?: MentorData[]) {
  // First, replace bare mentor names with markdown links if they appear in the text
  // and we have mentor data with IDs
  let processed = text;
  if (mentors && mentors.length > 0) {
    mentors.forEach((m) => {
      // Only replace if not already wrapped in a markdown link
      const name = m.displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const alreadyLinked = new RegExp(`\\[${name}\\]\\(`);
      if (!alreadyLinked.test(processed)) {
        processed = processed.replace(
          new RegExp(`\\b${name}\\b`, 'g'),
          `[${m.displayName}](/mentors/${m.id})`
        );
      }
    });
  }

  const parts = processed.split(/(\[.*?\]\(.*?\))/g);
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

function formatAIContent(content: string, mentors?: MentorData[], isStreaming?: boolean) {
  const result: React.ReactNode[] = [];
  let currentIndex = 0;

  while (currentIndex < content.length) {
    const codeBlockStart = content.indexOf('```', currentIndex);
    if (codeBlockStart === -1) {
      const textSegment = content.slice(currentIndex);
      if (textSegment) {
        result.push(...parseNormalText(textSegment, mentors));
      }
      break;
    }

    const textBefore = content.slice(currentIndex, codeBlockStart);
    if (textBefore) {
      result.push(...parseNormalText(textBefore, mentors));
    }

    const langStart = codeBlockStart + 3;
    const firstNewline = content.indexOf('\n', langStart);
    let lang = "";
    let codeStart = langStart;

    if (firstNewline !== -1 && firstNewline < content.indexOf('```', langStart)) {
      lang = content.slice(langStart, firstNewline).trim();
      codeStart = firstNewline + 1;
    }

    const codeBlockEnd = content.indexOf('```', codeStart);
    if (codeBlockEnd === -1) {
      const code = content.slice(codeStart);
      result.push(
        <div key={`code-open-${codeBlockStart}`} className="my-2 rounded-xl overflow-hidden border border-(--hairline)">
          {lang && (
            <div className="px-3 py-1 text-[10px] font-mono font-semibold text-(--muted) bg-(--fg)/[0.04] border-b border-(--hairline)">
              {lang} (streaming...)
            </div>
          )}
          <pre className="p-3 text-xs font-mono leading-relaxed overflow-x-auto bg-(--fg)/[0.02] whitespace-pre-wrap">
            <code>{code}</code>
          </pre>
        </div>
      );
      break;
    }

    const code = content.slice(codeStart, codeBlockEnd);
    result.push(
      <div key={`code-closed-${codeBlockStart}`} className="my-2 rounded-xl overflow-hidden border border-(--hairline)">
        {lang && (
          <div className="px-3 py-1 text-[10px] font-mono font-semibold text-(--muted) bg-(--fg)/[0.04] border-b border-(--hairline)">
            {lang}
          </div>
        )}
        <pre className="p-3 text-xs font-mono leading-relaxed overflow-x-auto bg-(--fg)/[0.02] whitespace-pre-wrap">
          <code>{code}</code>
        </pre>
      </div>
    );

    currentIndex = codeBlockEnd + 3;
  }

  if (isStreaming) {
    result.push(<span key="cursor" className="inline-block w-0.5 h-4 bg-(--fg)/60 ml-0.5 align-middle animate-pulse" />);
  }

  return result;
}

function parseNormalText(text: string, mentors?: MentorData[]): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  const lines = text.split('\n');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('|') && i + 1 < lines.length && lines[i + 1].trim().startsWith('|') && lines[i + 1].trim().includes('-')) {
      const headerRow = trimmed;
      const headers = headerRow.split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

      const rows: string[][] = [];
      let j = i + 2;
      while (j < lines.length && lines[j].trim().startsWith('|')) {
        const rowCells = lines[j].split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        rows.push(rowCells);
        j++;
      }

      result.push(
        <div key={`table-${i}`} className="my-3 overflow-x-auto border border-(--hairline) rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-(--fg)/[0.02] border-b border-(--hairline)">
                {headers.map((h, hIdx) => (
                  <th key={hIdx} className="px-4 py-2.5 font-semibold text-(--fg)">
                    {parseMarkdownInline(h, mentors)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-(--hairline)/60 last:border-0 hover:bg-(--fg)/[0.01]">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2 text-(--fg)/90">
                      {parseMarkdownInline(cell, mentors)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

      i = j;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      result.push(<h3 key={`h-${i}`} className="font-bold text-sm mt-3 mb-1 text-(--fg)">{trimmed.slice(3)}</h3>);
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      result.push(<h4 key={`h3-${i}`} className="font-semibold text-sm mt-2 mb-0.5 text-(--fg)">{trimmed.slice(4)}</h4>);
      i++;
      continue;
    }

    if (trimmed === '---' || trimmed === '***') {
      result.push(<hr key={`hr-${i}`} className="my-2 border-(--hairline)" />);
      i++;
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemContent = trimmed.slice(2);
      result.push(
        <li key={`li-${i}`} className="ml-4 list-disc text-sm leading-relaxed">
          {parseMarkdownInline(itemContent, mentors)}
        </li>
      );
      i++;
      continue;
    }

    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      result.push(
        <li key={`nl-${i}`} className="ml-4 list-decimal text-sm leading-relaxed">
          {parseMarkdownInline(numberedMatch[2], mentors)}
        </li>
      );
      i++;
      continue;
    }

    if (trimmed.length === 0) {
      result.push(<br key={`br-${i}`} />);
      i++;
      continue;
    }

    result.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed">
        {parseMarkdownInline(trimmed, mentors)}
      </p>
    );
    i++;
  }

  return result;
}


// Inline markdown parser: bold, inline code, links
function parseMarkdownInline(text: string, mentors?: MentorData[]): React.ReactNode {
  // Process bold + inline code + links together
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="text-[11px] font-mono bg-(--fg)/[0.08] rounded px-1 py-0.5">{part.slice(1, -1)}</code>;
    }
    const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      return <Link key={i} href={linkMatch[2]} className="text-(--accent) hover:underline font-medium">{linkMatch[1]}</Link>;
    }
    return <span key={i}>{part}</span>;
  });
}


interface ChatMessageItemProps {
  msg: Message;
  index: number;
  chatTheme: string;
  isLastUserMsg: boolean;
  mentorContext: MentorData[];
  streamingMessageId: string | null;
  setBookingMentor: (mentor: MentorData | null) => void;
  showHeader: boolean;
  msgDateStr: string;
}

const ChatMessageItem = React.memo(({
  msg,
  index,
  chatTheme,
  isLastUserMsg,
  mentorContext,
  streamingMessageId,
  setBookingMentor,
  showHeader,
  msgDateStr,
}: ChatMessageItemProps) => {
  return (
    <div className="w-full flex flex-col animate-in fade-in slide-in-from-bottom-1 duration-200">
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
            className={`rounded-[18px] px-4 py-2.5 text-[15px] leading-relaxed shadow-sm ${msg.role === "user"
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
                {formatAIContent(msg.content, msg.mentors ?? mentorContext, msg.id === streamingMessageId)}
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

      {/* ── Mentor Profile (shown below assistant bubble) ── */}
      {msg.role === "assistant" && msg.mentorProfile && (
        <div className="mt-2 max-w-sm">
          <MentorProfileInChat
            mentor={msg.mentorProfile}
            onBook={(m) => setBookingMentor(m)}
          />
        </div>
      )}

      {/* ── Mentor Cards (shown below assistant bubble) ── */}
      {msg.role === "assistant" && msg.mentors && msg.mentors.length > 0 && (
        <div className="flex flex-col gap-3 mt-2 max-w-sm">
          {msg.mentors.map((mentor) => (
            <MentorCardInChat
              key={mentor.id}
              mentor={mentor}
              onBook={(m) => setBookingMentor(m)}
            />
          ))}
        </div>
      )}

      {/* ── Booking Success ── */}
      {msg.role === "assistant" && msg.bookingSuccess && (
        <div className="mt-2 max-w-sm">
          <BookingSuccessInChat info={msg.bookingSuccess} />
        </div>
      )}
    </div>
  );
});
ChatMessageItem.displayName = "ChatMessageItem";




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

// ─── Razorpay global type ─────────────────────────────────────────────────────
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

// ─── Mentor Card In Chat ──────────────────────────────────────────────────────

function MentorCardInChat({ mentor, onBook }: { mentor: MentorData; onBook: (mentor: MentorData) => void }) {
  const [avatarError, setAvatarError] = useState(false);
  const avatarUrl = mentor.avatar || `https://i.pravatar.cc/150?u=${mentor.id}`;
  const initials = mentor.displayName.slice(0, 2).toUpperCase();

  // Institution badge color
  const instColor =
    mentor.institutionType === "COMPANY" ? "bg-amber-500/12 text-amber-600" :
      mentor.institutionType === "STARTUP" ? "bg-purple-500/12 text-purple-600" :
        "bg-blue-500/12 text-blue-600";

  return (
    <div className="rounded-2xl border border-(--hairline) bg-(--bg) shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        {!avatarError ? (
          <img
            src={avatarUrl}
            alt={mentor.displayName}
            className="h-12 w-12 rounded-full object-cover shrink-0 border border-(--hairline)"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--fg)/8 text-sm font-semibold shrink-0 border border-(--hairline)">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-sm truncate">{mentor.displayName}</span>
            <BadgeCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          </div>
          {mentor.currentRole && (
            <p className="text-xs text-(--muted) truncate">{mentor.currentRole}</p>
          )}
          <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${instColor}`}>
            {mentor.institutionName}
          </span>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-bold text-(--accent)">₹{Math.round(mentor.pricePerSession / 100)}</p>
          <p className="text-[10px] text-(--muted)">{mentor.sessionDuration}min</p>
        </div>
      </div>

      {/* Bio */}
      <p className="px-4 text-xs text-(--muted) leading-relaxed line-clamp-2">{mentor.bio}</p>

      {/* Skills */}
      {mentor.expertise.length > 0 && (
        <div className="px-4 pt-2 flex flex-wrap gap-1">
          {mentor.expertise.slice(0, 4).map((skill) => (
            <span key={skill} className="text-[10px] bg-(--fg)/[0.05] border border-(--hairline) rounded-full px-2 py-0.5 text-(--muted) font-medium">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 px-4 pt-2.5 pb-3">
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold">{mentor.rating > 0 ? mentor.rating.toFixed(1) : "New"}</span>
        </div>
        <span className="text-xs text-(--muted)">{mentor.totalSessions} sessions</span>
        <span className="ml-auto text-[10px] text-green-600 font-semibold">● Available</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <Link
          href={`/mentors/${mentor.id}`}
          onClick={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("close-ai"));
            }
          }}
          className="flex-1 text-center text-xs font-semibold py-2 rounded-xl border border-(--hairline) text-(--muted) hover:text-(--fg) hover:border-(--fg)/20 transition-colors"
        >
          View Profile
        </Link>
        <button
          type="button"
          onClick={() => onBook(mentor)}
          className="flex-1 text-xs font-semibold py-2 rounded-xl bg-(--fg) text-(--bg) hover:opacity-90 transition-opacity cursor-pointer"
        >
          Book Session
        </button>
      </div>
    </div>
  );
}

// ─── Booking Modal In Chat ────────────────────────────────────────────────────

function BookingModalInChat({
  mentor,
  user,
  onClose,
  onSuccess,
}: {
  mentor: MentorData;
  user: { id: string; name: string; email: string };
  onClose: () => void;
  onSuccess: (info: BookingSuccess) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  // Ensure Razorpay is loaded
  useEffect(() => {
    if (document.getElementById("razorpay-script")) return;
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const days: Date[] = [];
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  const timeSlots: string[] = [];
  for (let h = 9; h <= 20; h++) {
    timeSlots.push(`${h.toString().padStart(2, "0")}:00`);
    if (h < 20) timeSlots.push(`${h.toString().padStart(2, "0")}:30`);
  }

  async function handleConfirm() {
    if (!selectedDate || !selectedTime || booking) return;
    setError("");
    setBooking(true);

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    try {
      const res = await api.post("/bookings", {
        mentorId: mentor.id,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: mentor.sessionDuration,
      });

      const { booking: bookingData, order, razorpayKeyId } = res.data;

      if (!order || !razorpayKeyId || !window.Razorpay) {
        // No Razorpay — direct success
        onSuccess({
          bookingId: bookingData.id,
          mentorName: mentor.displayName,
          scheduledAt: scheduledAt.toISOString(),
          durationMinutes: mentor.sessionDuration,
          meetingType: "Google Meet",
        });
        return;
      }

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "HelpMeMan",
        description: `Session with ${mentor.displayName}`,
        order_id: order.id,
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            await api.post(`/bookings/${bookingData.id}/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            onSuccess({
              bookingId: bookingData.id,
              mentorName: mentor.displayName,
              scheduledAt: scheduledAt.toISOString(),
              durationMinutes: mentor.sessionDuration,
              meetingType: "Google Meet",
            });
          } catch {
            setError("Payment verification failed. Please contact support.");
            setBooking(false);
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#0a0a0a" },
        modal: { ondismiss: () => { setError("Payment cancelled."); setBooking(false); } },
      });
      rzp.open();
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Booking failed.");
      } else {
        setError("Booking failed.");
      }
      setBooking(false);
    }
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="rounded-2xl border border-(--hairline) bg-(--bg) shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-(--hairline) bg-(--fg)/[0.02]">
        <div>
          <p className="text-sm font-semibold">Book a Session</p>
          <p className="text-xs text-(--muted)">{mentor.displayName} · ₹{Math.round(mentor.pricePerSession / 100)} · {mentor.sessionDuration}min</p>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 text-(--muted) hover:text-(--fg) rounded-lg hover:bg-(--fg)/5 cursor-pointer">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Date picker */}
        <div>
          <p className="text-xs font-semibold text-(--muted) uppercase tracking-wide mb-2">Select Date</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {days.map((d) => {
              const active = selectedDate?.toDateString() === d.toDateString();
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={`flex flex-col items-center justify-center shrink-0 w-12 h-14 rounded-xl text-xs font-medium transition-all cursor-pointer border ${active
                    ? "bg-(--fg) text-(--bg) border-(--fg)"
                    : "border-(--hairline) text-(--muted) hover:border-(--fg)/20 hover:text-(--fg)"
                    }`}
                >
                  <span className="text-[10px] font-semibold">{dayNames[d.getDay()]}</span>
                  <span className="text-base font-bold">{d.getDate()}</span>
                  <span className="text-[9px]">{monthNames[d.getMonth()]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time picker */}
        <div>
          <p className="text-xs font-semibold text-(--muted) uppercase tracking-wide mb-2">Select Time</p>
          <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-1">
            {timeSlots.map((slot) => {
              const active = selectedTime === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`text-xs py-1.5 rounded-lg font-medium transition-all cursor-pointer border ${active
                    ? "bg-(--fg) text-(--bg) border-(--fg)"
                    : "border-(--hairline) text-(--muted) hover:border-(--fg)/20 hover:text-(--fg)"
                    }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">{error}</p>
        )}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedDate || !selectedTime || booking}
          className="w-full py-2.5 rounded-xl bg-(--fg) text-(--bg) text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer disabled:cursor-not-allowed"
        >
          {booking ? "Processing..." : `Confirm & Pay ₹${Math.round(mentor.pricePerSession / 100)}`}
        </button>
      </div>
    </div>
  );
}

// ─── Mentor Profile In Chat ───────────────────────────────────────────────────

function MentorProfileInChat({ mentor, onBook }: { mentor: MentorData; onBook: (mentor: MentorData) => void }) {
  const [avatarError, setAvatarError] = useState(false);
  const avatarUrl = mentor.avatar || `https://i.pravatar.cc/150?u=${mentor.id}`;
  const initials = mentor.displayName.slice(0, 2).toUpperCase();

  return (
    <div className="rounded-2xl border border-(--hairline) bg-(--bg) shadow-md overflow-hidden p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {!avatarError ? (
          <img
            src={avatarUrl}
            alt={mentor.displayName}
            className="h-14 w-14 rounded-full object-cover border border-(--hairline)"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--fg)/8 text-base font-semibold border border-(--hairline)">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-sm truncate">{mentor.displayName}</span>
            <BadgeCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          </div>
          {mentor.currentRole && (
            <p className="text-xs text-(--muted) truncate">{mentor.currentRole} at {mentor.company || mentor.institutionName}</p>
          )}
          <span className="inline-block mt-1 rounded-full bg-blue-500/12 text-blue-600 px-2 py-0.5 text-[10px] font-medium">
            {mentor.institutionName}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold text-(--muted) uppercase tracking-wide">About</p>
        <p className="text-xs leading-relaxed text-(--muted) line-clamp-3">{mentor.bio}</p>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold text-(--muted) uppercase tracking-wide">Expertise</p>
        <div className="flex flex-wrap gap-1">
          {mentor.expertise.map((skill) => (
            <span key={skill} className="text-[10px] bg-(--fg)/5 border border-(--hairline) rounded-full px-2 py-0.5 text-(--muted) font-medium">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-(--hairline) pt-2 text-center">
        <div>
          <p className="text-[9px] text-(--muted) uppercase font-semibold">Rating</p>
          <div className="flex items-center justify-center gap-0.5 mt-0.5">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold">{mentor.rating > 0 ? mentor.rating.toFixed(1) : "New"}</span>
          </div>
        </div>
        <div>
          <p className="text-[9px] text-(--muted) uppercase font-semibold">Sessions</p>
          <p className="text-xs font-bold mt-0.5">{mentor.totalSessions}</p>
        </div>
        <div>
          <p className="text-[9px] text-(--muted) uppercase font-semibold">Price</p>
          <p className="text-xs font-bold mt-0.5 text-(--accent)">₹{Math.round(mentor.pricePerSession / 100)}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onBook(mentor)}
        className="w-full text-xs font-semibold py-2 rounded-xl bg-(--fg) text-(--bg) hover:opacity-90 transition-opacity cursor-pointer mt-1"
      >
        Book 1-on-1 Session
      </button>
    </div>
  );
}

// ─── Booking Success In Chat ──────────────────────────────────────────────────

function BookingSuccessInChat({ info }: { info: BookingSuccess }) {
  const date = new Date(info.scheduledAt);
  const dateStr = date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="rounded-2xl border border-green-500/30 bg-green-500/5 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border-b border-green-500/20">
        <span className="text-lg">✅</span>
        <div>
          <p className="text-sm font-bold text-green-700 dark:text-green-400">Booking Confirmed!</p>
          <p className="text-xs text-(--muted)">Your session is scheduled</p>
        </div>
      </div>
      <div className="px-4 py-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-(--muted) w-16 shrink-0">Mentor</span>
          <span className="font-semibold">{info.mentorName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-(--muted) w-16 shrink-0">Date</span>
          <span className="font-semibold">{dateStr}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-(--muted) w-16 shrink-0">Time</span>
          <span className="font-semibold">{timeStr}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-(--muted) w-16 shrink-0">Duration</span>
          <span className="font-semibold">{info.durationMinutes} minutes</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-(--muted) w-16 shrink-0">Type</span>
          <span className="font-semibold">{info.meetingType}</span>
        </div>
      </div>
      <div className="flex gap-2 px-4 pb-4">
        <Link
          href="/dashboard/bookings"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("close-ai"));
            }
          }}
          className="flex-1 text-center text-xs font-semibold py-2 rounded-xl bg-(--fg) text-(--bg) hover:opacity-90 transition-opacity"
        >
          View Booking
        </Link>
        <Link
          href="/dashboard/chat"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("close-ai"));
            }
          }}
          className="flex-1 text-center text-xs font-semibold py-2 rounded-xl border border-(--hairline) text-(--muted) hover:text-(--fg) transition-colors"
        >
          Open Chat
        </Link>
      </div>
    </div>
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────

export function AIChatWidget() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Drawer & tab state — persisted in localStorage
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("helpmeman.aiChatOpen") === "true";
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<"chat" | "history" | "meetings">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("helpmeman.aiActiveTab");
      if (saved === "chat" || saved === "history" || saved === "meetings") return saved;
    }
    return "chat";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("helpmeman.aiChatOpen", String(isOpen));
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("helpmeman.aiActiveTab", activeTab);
    }
  }, [activeTab]);

  // Automatically close Ruth AI drawer on route change
  useEffect(() => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("helpmeman.aiChatOpen", "false");
    }
  }, [pathname]);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("helpmeman.aiSessionId");
    }
    return null;
  });
  const [sessionTitle, setSessionTitle] = useState<string | null>(null);
  const [resumeBanner, setResumeBanner] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Mentor booking state
  const mentorContextRef = useRef<MentorData[]>([]);
  const [bookingMentor, setBookingMentor] = useState<MentorData | null>(null);

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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userHasScrolledUpRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Streaming state
  const streamingMessageIdRef = useRef<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const { streamState, error: streamError, startStream, stopStream } = useAIStream({
    endpoint: `${API_BASE}/ai/chat/stream`,
    token: typeof window !== "undefined" ? localStorage.getItem("helpmeman.accessToken") : null,
    onSession: (sid) => {
      setSessionId(sid);
      if (typeof window !== "undefined") {
        localStorage.setItem("helpmeman.aiSessionId", sid);
      }
    },
    onToken: (text) => {
      const currentStreamingId = streamingMessageIdRef.current;
      if (!currentStreamingId) return;
      setMessages(prev => {
        const hasStreamingBubble = prev.some(m => m.id === currentStreamingId);
        if (!hasStreamingBubble) {
          return [
            ...prev,
            {
              id: currentStreamingId,
              role: "assistant",
              content: text,
              createdAt: new Date().toISOString(),
            }
          ];
        }
        return prev.map(m => m.id === currentStreamingId ? { ...m, content: text } : m);
      });
    },
    onMeta: (data) => {
      const currentStreamingId = streamingMessageIdRef.current;

      const { response: parsedResponse, mentors, sessionId: metaSessionId } = data;
      if (metaSessionId) {
        setSessionId(metaSessionId);
        if (typeof window !== "undefined") {
          localStorage.setItem("helpmeman.aiSessionId", metaSessionId);
        }
      }

      if (mentors && mentors.length > 0) {
        const currentList = mentorContextRef.current;
        const newMentors = mentors.filter(
          (nm: MentorData) => !currentList.some((cm) => cm.id === nm.id)
        );
        mentorContextRef.current = [...currentList, ...newMentors];
      }

      // Check if we need to open the booking modal
      const respLower = (parsedResponse || "").toLowerCase();
      if (respLower.includes("opening booking modal") || respLower.includes("booking modal for you")) {
        const target = mentorContextRef.current.length > 0 ? mentorContextRef.current[mentorContextRef.current.length - 1] : null;
        if (target) setBookingMentor(target);
      }

      if (currentStreamingId) {
        setMessages(prev => {
          const hasStreamingBubble = prev.some(m => m.id === currentStreamingId);
          if (!hasStreamingBubble) {
            return [
              ...prev,
              {
                id: currentStreamingId,
                role: "assistant",
                content: parsedResponse || "I couldn't generate a response.",
                createdAt: new Date().toISOString(),
                mentors: mentors && mentors.length > 0 ? mentors : undefined,
              }
            ];
          }
          return prev.map(m =>
            m.id === currentStreamingId
              ? {
                ...m,
                content: parsedResponse || m.content,
                mentors: mentors && mentors.length > 0 ? mentors : undefined,
              }
              : m
          );
        });
      }
    },
    onError: (err) => {
      setError(err);
    },
    onCompleted: () => {
      setLoading(false);
      setStreamingMessageId(null);
      streamingMessageIdRef.current = null;
      chatSoundService.playReceiveSound();
    }
  });



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

  // Ruthless Mode state — persisted in localStorage
  const [ruthlessMode, setRuthlessMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("helpmeman.ruthlessMode") === "true";
    }
    return false;
  });

  // Mode-switch toast (auto-dismisses after 2.5s)
  const [modeToast, setModeToast] = useState<"ruthless" | "normal" | null>(null);
  const modeToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleModeToggle = useCallback((next: boolean) => {
    setRuthlessMode(next);
    if (modeToastTimerRef.current) clearTimeout(modeToastTimerRef.current);
    setModeToast(next ? "ruthless" : "normal");
    modeToastTimerRef.current = setTimeout(() => setModeToast(null), 2500);
  }, []);

  useEffect(() => {
    localStorage.setItem("helpmeman.ruthlessMode", String(ruthlessMode));
  }, [ruthlessMode]);

  useEffect(() => () => {
    if (modeToastTimerRef.current) clearTimeout(modeToastTimerRef.current);
  }, []);

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

  // ─── Open/close event listeners ──────────────────────────────────────────────

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("helpmeman.aiChatOpen", "true");
      }
    };
    const handleClose = () => {
      setIsOpen(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("helpmeman.aiChatOpen", "false");
      }
    };
    window.addEventListener("open-ai", handleOpen);
    window.addEventListener("close-ai", handleClose);
    return () => {
      window.removeEventListener("open-ai", handleOpen);
      window.removeEventListener("close-ai", handleClose);
    };
  }, []);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ─── Auto scroll ───────────────────────────────────────────────────────────
  const autoScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || userHasScrolledUpRef.current) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth"
    });
  }, []);

  useEffect(() => {
    autoScroll();
  }, [messages, autoScroll]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const offset = container.scrollHeight - container.scrollTop - container.clientHeight;
    const isAtBottom = offset < 60;

    if (isAtBottom) {
      userHasScrolledUpRef.current = false;
    } else {
      if (streamState === "streaming") {
        userHasScrolledUpRef.current = true;
      }
    }
  }, [streamState]);


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

  const resumeSession = useCallback(async (sid: string, initialTitle: string | null = null) => {
    setActiveTab("chat");
    setSessionLoading(true);
    setMessages([]);
    setError("");
    setSessionTitle(initialTitle || "Untitled chat");
    try {
      const { data } = await api.get(`/ai/sessions/${sid}/resume`);
      setSessionId(sid);
      if (typeof window !== "undefined") {
        localStorage.setItem("helpmeman.aiSessionId", sid);
      }
      setSessionTitle(data.session.title || initialTitle || "Untitled chat");
      setMessages(
        data.messages.map((m: Message) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        }))
      );
      if (data.session.title || initialTitle) {
        setResumeBanner(`Resuming chat: ${data.session.title || initialTitle}`);
      }
    } catch {
      if (typeof window !== "undefined") {
        localStorage.removeItem("helpmeman.aiSessionId");
      }
      setError("Failed to load session.");
    } finally {
      setSessionLoading(false);
    }
  }, []);

  // ─── Auto-resume active session on mount if logged in ────────────────────────
  const hasAutoResumedRef = useRef(false);
  useEffect(() => {
    if (user && !hasAutoResumedRef.current) {
      hasAutoResumedRef.current = true;
      const savedSid = typeof window !== "undefined" ? localStorage.getItem("helpmeman.aiSessionId") : null;
      if (savedSid) {
        resumeSession(savedSid, null).catch(() => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("helpmeman.aiSessionId");
          }
        });
      }
    }
  }, [user, resumeSession]);

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
      if (typeof window !== "undefined") {
        localStorage.setItem("helpmeman.aiSessionId", data.session.id);
      }
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
    if (typeof window !== "undefined") {
      localStorage.setItem("helpmeman.aiChatOpen", "false");
    }
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
    if (typeof window !== "undefined") {
      localStorage.removeItem("helpmeman.aiSessionId");
    }
    setSessionTitle(null);
    setMessages([]);
    setResumeBanner(null);
    setError("");
    setActiveTab("chat");
  }, [sessionId, messages.length]);

  const handleStop = useCallback(() => {
    stopStream();
    setLoading(false);
    setStreamingMessageId(null);
  }, [stopStream]);

  const handleSend = useCallback(async (customMsg?: string, reuseAssistantMessageId?: string) => {
    const msg = (customMsg !== undefined ? customMsg : input).trim();
    if (!msg || loading) return;

    const lower = msg.toLowerCase();
    const contextMentors = mentorContextRef.current;

    // ── 1. Route Intent to modal / profile components if matched ──
    let resolvedMentor: MentorData | null = null;
    if (contextMentors.length > 0) {
      for (const m of contextMentors) {
        const firstName = m.displayName.split(" ")[0].toLowerCase();
        const fullName = m.displayName.toLowerCase();
        if (lower.includes(fullName) || lower.includes(firstName)) {
          resolvedMentor = m;
          break;
        }
      }
      if (!resolvedMentor) {
        if (/(first|1st|number one|top one|#1)/i.test(lower)) resolvedMentor = contextMentors[0];
        else if (/(second|2nd|number two|#2)/i.test(lower) && contextMentors.length > 1) resolvedMentor = contextMentors[1];
        else if (/(third|3rd|number three|#3)/i.test(lower) && contextMentors.length > 2) resolvedMentor = contextMentors[2];
        else if (/(fourth|4th|number four|#4)/i.test(lower) && contextMentors.length > 3) resolvedMentor = contextMentors[3];
      }
      const isBookingOrProfileQuery = /(book|schedule|reserve|meet|session|profile|tell me|who is|details|view)/i.test(lower);
      if (!resolvedMentor && (/(him|her|this|that|them|the mentor)/i.test(lower) || isBookingOrProfileQuery)) {
        resolvedMentor = contextMentors[contextMentors.length - 1];
      }
    }

    const isBookingIntent = /(book|schedule|reserve|meet|session with|i want this|continue booking|i'll take|go with|pick|choose|select)/i.test(lower);
    if (isBookingIntent && resolvedMentor) {
      setBookingMentor(resolvedMentor);
      if (customMsg === undefined) setInput("");
      return;
    }

    const isProfileIntent = /(profile|tell me|who is|details|about him|about her|more info|view)/i.test(lower);
    if (isProfileIntent && resolvedMentor) {
      if (customMsg === undefined) setInput("");
      const userMsg: Message = {
        id: `u_${Date.now()}`,
        role: "user",
        content: msg,
        createdAt: new Date().toISOString(),
      };
      const assistantMsg: Message = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: `Here is the profile for **${resolvedMentor.displayName}**:`,
        createdAt: new Date().toISOString(),
        mentorProfile: resolvedMentor,
      };
      setMessages(prev => [...prev, userMsg, assistantMsg]);
      return;
    }

    if (customMsg === undefined) setInput("");
    setError("");

    // Set sending and waiting states
    setLoading(true);
    userHasScrolledUpRef.current = false; // Reset scroll up on new message

    const optimisticMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      content: msg,
      createdAt: new Date().toISOString(),
    };

    // ONLY append user message if not reusing. NO placeholder assistant bubble is shown!
    if (!reuseAssistantMessageId) {
      setMessages(prev => [...prev, optimisticMsg]);
    }

    const streamingId = reuseAssistantMessageId || `ai_stream_${Date.now()}`;
    setStreamingMessageId(streamingId);
    streamingMessageIdRef.current = streamingId;

    chatSoundService.playSendSound();
    startStream(msg, { sessionId: sessionId || undefined, ruthlessMode });
  }, [input, loading, sessionId, startStream, ruthlessMode]);


  const handleRetry = useCallback(() => {
    setError("");
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    if (!lastUserMsg) return;

    const userMsgIndex = messages.findIndex(m => m.id === lastUserMsg.id);
    const assistantMsg = messages[userMsgIndex + 1];

    if (assistantMsg && assistantMsg.role === "assistant") {
      setMessages(prev => prev.map(m =>
        m.id === assistantMsg.id
          ? { ...m, content: "", mentors: undefined, mentorProfile: undefined, bookingSuccess: undefined }
          : m
      ));
      handleSend(lastUserMsg.content, assistantMsg.id);
    } else {
      const cleanedMessages = messages.slice(0, userMsgIndex + 1);
      setMessages(cleanedMessages);
      handleSend(lastUserMsg.content);
    }
  }, [messages, handleSend]);





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
    <div data-ai-chat-open="true" className="fixed inset-y-0 right-0 left-0 md:left-64 z-[9999] flex flex-col overflow-hidden bg-(--bg) border-l border-(--hairline) animate-in slide-in-from-bottom md:slide-in-from-right duration-300">

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
                Ruth
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
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-200 cursor-pointer mx-0.5 hover:scale-120 ${chatTheme === t.id
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

            {/* AI Mode selector — chat tab only */}
            {activeTab === "chat" && (
              <>
                {/* Mobile: compact icon toggle (<640px) */}
                <button
                  type="button"
                  id="ai-mode-toggle-mobile"
                  onClick={() => handleModeToggle(!ruthlessMode)}
                  aria-pressed={ruthlessMode}
                  title={ruthlessMode ? "Ruthless Mode — tap to switch to Normal" : "Normal Mode — tap to enable Ruthless Mode"}
                  className={`sm:hidden flex items-center justify-center h-[30px] w-[30px] rounded-full border border-(--hairline) shrink-0 transition-all duration-200 cursor-pointer ${ruthlessMode
                      ? "bg-(--fg) text-(--bg)"
                      : "bg-(--fg)/[0.03] text-(--muted) hover:text-(--fg)"
                    }`}
                >
                  <Zap className="h-3 w-3 shrink-0" />
                </button>

                {/* Desktop: full segmented pill (≥640px) */}
                <div
                  id="ai-mode-selector"
                  role="group"
                  aria-label="AI response mode"
                  className="hidden sm:flex items-center h-[30px] rounded-full border border-(--hairline) bg-(--fg)/[0.03] p-[3px] shrink-0 select-none gap-px"
                >
                  <button
                    type="button"
                    onClick={() => handleModeToggle(false)}
                    aria-pressed={!ruthlessMode}
                    className={`flex items-center h-full px-2.5 rounded-full text-[11px] font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${!ruthlessMode
                        ? "bg-(--fg) text-(--bg) shadow-sm"
                        : "text-(--muted) hover:text-(--fg)"
                      }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeToggle(true)}
                    aria-pressed={ruthlessMode}
                    className={`flex items-center gap-1 h-full px-2.5 rounded-full text-[11px] font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${ruthlessMode
                        ? "bg-(--fg) text-(--bg) shadow-sm"
                        : "text-(--muted) hover:text-(--fg)"
                      }`}
                  >
                    <Zap className="h-2.5 w-2.5 shrink-0" />
                    Ruthless
                  </button>
                </div>
              </>
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
        <div className="relative flex-1 flex flex-col overflow-hidden">
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

          {/* AI mode switch toast — self-dismissing, 2.5s */}
          {modeToast && (
            <div
              key={modeToast}
              className="shrink-0 border-b border-(--hairline) px-4 sm:px-6 py-2 animate-in fade-in slide-in-from-top-1 duration-200"
              style={{ background: "var(--bg)" }}
            >
              <div className="max-w-4xl w-full mx-auto flex items-center gap-2.5">
                <Zap className="h-3 w-3 shrink-0 text-(--muted)" />
                <div>
                  <p className="text-xs font-semibold text-(--fg) leading-none">
                    {modeToast === "ruthless" ? "Ruthless Mode Enabled" : "Normal Mode Enabled"}
                  </p>
                  <p className="text-[10px] text-(--muted) mt-0.5 leading-snug">
                    {modeToast === "ruthless"
                      ? "Ruth will now respond with unpredictable, hilarious, and candid feedback."
                      : "Ruth is back to her professional, balanced default."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Messages area */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 w-full"
          >

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
                    <ChatMessageItem
                      key={msg.id}
                      msg={msg}
                      index={index}
                      chatTheme={chatTheme}
                      isLastUserMsg={isLastUserMsg}
                      mentorContext={mentorContextRef.current}
                      streamingMessageId={streamingMessageId}
                      setBookingMentor={setBookingMentor}
                      showHeader={showHeader}
                      msgDateStr={msgDateStr}
                    />
                  );


                });
              })()}

              {/* Typing indicator */}
              {streamState === "waiting_first_token" && (
                <div className="flex justify-start mb-2 animate-pulse">
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
                <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 my-2">
                  <p className="text-xs font-semibold text-red-500">{error}</p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="self-start flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-red-500 text-white hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Retry Message
                  </button>
                </div>
              )}

              <div className="h-2" />
            </div>
          </div>

          {/* ── Booking Modal Overlay (inside chat area) ── */}
          {bookingMentor && user && (
            <div className="absolute inset-0 z-20 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="w-full max-w-md mx-4 mb-4 md:mb-0">
                <BookingModalInChat
                  mentor={bookingMentor}
                  user={{ id: user.id, name: user.name, email: user.email }}
                  onClose={() => setBookingMentor(null)}
                  onSuccess={(info) => {
                    setBookingMentor(null);
                    // Append a booking success message to the chat
                    const successMsg: Message = {
                      id: `success_${Date.now()}`,
                      role: "assistant",
                      content: `Great news! Your session with **${info.mentorName}** has been confirmed. 🎉`,
                      createdAt: new Date().toISOString(),
                      bookingSuccess: info,
                    };
                    setMessages(prev => [...prev, successMsg]);
                  }}
                />
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="shrink-0 border-t border-(--hairline) bg-(--bg) px-4 sm:px-6 py-3 sm:py-4 pb-safe-bottom">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="max-w-4xl w-full mx-auto flex items-center gap-1.5 sm:gap-3 relative"
            >
              {/* Input Wrapper */}
              <div
                className={`flex-1 flex items-center bg-(--fg)/5 rounded-full px-3.5 py-2 sm:py-2.5 border transition-all ${chatTheme === "imessage"
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

                {streamState === "waiting_first_token" || streamState === "streaming" ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white shrink-0 transition-all duration-200 ml-2 active:scale-95 cursor-pointer shadow-sm animate-in fade-in zoom-in-50 duration-200"
                    title="Stop generating"
                  >
                    <div className="h-2.5 w-2.5 bg-white rounded-xs" />
                  </button>
                ) : !input.trim() ? (
                  <Mic className="h-4.5 w-4.5 text-(--muted)/85 hover:text-(--fg) cursor-pointer transition-colors ml-2" />
                ) : (
                  /* Send Button inside input pill if input is not empty */
                  <button
                    type="submit"
                    disabled={loading || sessionLoading}
                    className={`flex h-7 w-7 items-center justify-center rounded-full hover:opacity-90 cursor-pointer disabled:opacity-30 shrink-0 transition-all duration-200 ml-2 ${chatTheme === "white" ? "text-zinc-900 border border-zinc-200" : "text-white"
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
        </div>
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
