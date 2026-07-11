"use client";
import { useState } from "react";
import { MessageCircle, Search, X } from "lucide-react";
import type { ChatThread } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { Avatar } from "@/components/Avatar";

interface ThreadListProps {
  threads: ChatThread[];
  activeThreadId?: string;
  loading: boolean;
  userRole?: string;
  presenceMap: Record<string, string>;
  onSelectThread: (thread: ChatThread) => void;
}

function formatDate(d: string) {
  const date = new Date(d);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function PresenceDot({ status }: { status?: string }) {
  if (status === "ONLINE") return <span className="h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-(--bg) shadow-sm" />;
  if (status === "AWAY") return <span className="h-2.5 w-2.5 rounded-full bg-amber-400 border-2 border-(--bg) shadow-sm" />;
  return null;
}

function ThreadAvatar({
  name, avatarUrl, presenceStatus
}: { name: string; avatarUrl?: string | null; presenceStatus?: string }) {
  return (
    <div className="relative shrink-0">
      <Avatar name={name} url={avatarUrl} size="xl" />
      {presenceStatus && presenceStatus !== "OFFLINE" && (
        <div className="absolute -bottom-0.5 -right-0.5">
          <PresenceDot status={presenceStatus} />
        </div>
      )}
    </div>
  );
}

export function ThreadList({
  threads,
  activeThreadId,
  loading,
  userRole,
  presenceMap,
  onSelectThread,
}: ThreadListProps) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? threads.filter((t) => {
        const name = userRole === "MENTOR"
          ? t.user?.name ?? ""
          : t.mentor?.displayName ?? "";
        const lastMsg = t.messages?.[0]?.body ?? "";
        const q = search.toLowerCase();
        return name.toLowerCase().includes(q) || lastMsg.toLowerCase().includes(q);
      })
    : threads;

  const sorted = [...filtered].sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return (
    <div className="w-full md:w-80 flex flex-col shrink-0 h-full" style={{ borderRight: "1px solid rgba(0,0,0,0.08)", background: "var(--bg, #fff)" }}>
      <div className="px-5 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-display text-base font-bold">Messages</span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full" style={{ color: "var(--muted, #888)", background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.07)" }}>
            {threads.length}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.07)" }}>
          <Search className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--muted, #888)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: "var(--fg, #111)" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="cursor-pointer active:opacity-60" style={{ color: "var(--muted, #888)" }}>
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-2 p-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
          </div>
        ) : sorted.length > 0 ? (
          <div className="flex flex-col">
            {sorted.map((thread) => {
              const isMentor = userRole === "MENTOR";
              const displayName = isMentor ? thread.user?.name ?? "User" : thread.mentor?.displayName ?? "Mentor";
              const avatarUrl = isMentor ? thread.user?.avatar : thread.mentor?.avatar;
              const lastMsg = thread.messages?.[0];
              const isActive = activeThreadId === thread.id;
              const unread = thread.unreadCount ?? 0;

              const otherUserId = isMentor ? thread.userId : (thread.mentor as any)?.userId;
              const presenceStatus = otherUserId ? presenceMap[otherUserId] : undefined;

              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => onSelectThread(thread)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 transition-all hover:bg-(--fg)/4 cursor-pointer text-left border-b border-(--hairline)/10 last:border-b-0 relative ${
                    isActive
                      ? "bg-(--fg)/[0.04] border-l-2 border-l-(--accent) pl-[14px]"
                      : "border-l-2 border-l-transparent"
                  }`}
                >
                  <ThreadAvatar name={displayName} avatarUrl={avatarUrl} presenceStatus={presenceStatus} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-sm font-semibold truncate ${unread > 0 ? "text-(--fg)" : "text-(--fg)/80"}`}>
                        {displayName}
                      </span>
                      <span className="text-[10px] text-(--muted) shrink-0 ml-2">
                        {formatDate(thread.updatedAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs truncate ${
                        unread > 0 ? "text-(--fg)/70 font-medium" : "text-(--fg)/45"
                      }`}>
                        {lastMsg?.deletedAt
                          ? "Message deleted"
                          : lastMsg?.body
                          ? lastMsg.body
                          : lastMsg?.attachments
                          ? "📎 Attachment"
                          : "No messages yet"}
                      </span>
                      {unread > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-(--accent) text-(--accent-fg) text-[10px] font-bold px-1.5 shrink-0 animate-in zoom-in duration-200">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-8">
            {search ? (
              <EmptyState
                icon={<Search className="h-6 w-6" />}
                title="No results"
                description={`No conversations match "${search}"`}
              />
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
