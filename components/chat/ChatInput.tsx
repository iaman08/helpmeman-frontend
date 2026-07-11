"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Smile, ArrowUp, Paperclip, X, Reply, FileText, Image, Loader2 } from "lucide-react";
import api from "@/lib/api";
import type { ChatMessage, ChatAttachment } from "@/lib/types";
import { useToast } from "@/components/Toast";

interface ChatInputProps {
  threadId: string;
  chatTheme: string;
  disabled?: boolean;
  replyTo: ChatMessage | null;
  editTarget: ChatMessage | null;
  onClearReply: () => void;
  onSend: (body: string, attachments?: ChatAttachment[], replyToId?: string) => Promise<void>;
  onTyping: () => void;
  onStopTyping: () => void;
}

const EMOJIS = [
  "😀","😂","🥰","😍","🤔","👀","👍","👎","❤️","🔥",
  "👏","🎉","🚀","💡","✨","💯","🥳","🤖","👋","🙏",
  "❌","✅","⚠️","💬","😎","🤝","💪","😅","🙌","💎",
];

const THEME_COLORS: Record<string, string> = {
  imessage: "#007aff",
  sms: "#34c759",
  pink: "#ff2d55",
  white: "#ffffff",
};

export function ChatInput({
  threadId,
  chatTheme,
  disabled,
  replyTo,
  editTarget,
  onClearReply,
  onSend,
  onTyping,
  onStopTyping,
}: ChatInputProps) {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<ChatAttachment | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Pre-fill textarea when entering edit mode
  useEffect(() => {
    if (editTarget) {
      setInput(editTarget.body);
      setPendingAttachment(null);
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 50);
    }
  }, [editTarget?.id]);

  const isEditing = !!editTarget;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const accentColor = THEME_COLORS[chatTheme] || THEME_COLORS.imessage;

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [input]);

  // Click outside emoji picker
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Typing emission with debounce
  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping();
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onStopTyping();
    }, 3000);
  }, [onTyping, onStopTyping]);

  const handleSend = useCallback(async () => {
    const body = input.trim();
    if (!body && !pendingAttachment) return;
    if (sending) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    isTypingRef.current = false;
    onStopTyping();
    setShowEmoji(false);

    const attachmentToSend = pendingAttachment;
    const replyToId = replyTo?.id;
    setInput("");
    setPendingAttachment(null);
    onClearReply();
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    textareaRef.current?.focus();

    setSending(true);
    try {
      await onSend(
        body,
        attachmentToSend ? [attachmentToSend] : undefined,
        replyToId
      );
    } catch {
      // Error shown by parent
    } finally {
      setSending(false);
    }
  }, [input, pendingAttachment, sending, onSend, replyTo, onClearReply, onStopTyping]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const uploadFile = useCallback(async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast("File too large (max 10MB)", "error"); return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post(`/chat/threads/${threadId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPendingAttachment(res.data.attachment);
    } catch (e: any) {
      toast(e.response?.data?.error || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }, [threadId, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const canSend = (input.trim().length > 0 || !!pendingAttachment) && !sending && !uploading;
  const charCount = input.length;
  const charMax = 2000;

  return (
    <div
      className="px-3 py-2.5 sm:px-4 sm:py-3.5 shrink-0 transition-colors"
      style={{
        borderTop: "1px solid rgba(0,0,0,0.08)",
        background: isDragging ? "rgba(0,0,0,0.03)" : "transparent",
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}>
          <Reply className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--muted, #888)" }} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted, #888)" }}>Replying</p>
            <p className="text-xs truncate" style={{ color: "var(--fg, #111)", opacity: 0.7 }}>{replyTo.deletedAt ? "Deleted message" : replyTo.body}</p>
          </div>
          <button
            onClick={onClearReply}
            className="p-1.5 rounded-full cursor-pointer active:opacity-60"
            style={{ color: "var(--muted, #888)" }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {(pendingAttachment || uploading) && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}>
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--muted, #888)" }} /><span className="text-xs" style={{ color: "var(--muted, #888)" }}>Uploading...</span></>
          ) : pendingAttachment ? (
            <>
              {pendingAttachment.isImage
                ? <Image className="h-4 w-4" style={{ color: "var(--muted, #888)" }} />
                : <FileText className="h-4 w-4" style={{ color: "var(--muted, #888)" }} />}
              <span className="text-xs truncate flex-1" style={{ color: "var(--fg, #111)", opacity: 0.8 }}>{pendingAttachment.name}</span>
              <button onClick={() => setPendingAttachment(null)} className="p-1.5 rounded-full cursor-pointer active:opacity-60" style={{ color: "var(--muted, #888)" }}>
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : null}
        </div>
      )}

      {isDragging && (
        <div className="text-center text-sm text-(--muted) font-medium mb-2 py-1">
          📎 Drop to attach
        </div>
      )}

      <div className="flex items-end gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="flex h-10 w-10 items-center justify-center rounded-full shrink-0 transition-all cursor-pointer disabled:opacity-40 active:opacity-60"
          style={{ color: "var(--muted, #888)" }}
          title="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.zip,.txt"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }}
        />

        <div
          className="flex-1 flex items-end rounded-2xl px-3.5 py-2 transition-all"
          style={{
            background: "rgba(0,0,0,0.05)",
            border: `1.5px solid ${accentColor}00`,
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = `${accentColor}50`)}
          onBlur={(e) => (e.currentTarget.style.borderColor = `${accentColor}00`)}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            maxLength={charMax}
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent text-sm outline-none resize-none disabled:opacity-50 leading-relaxed max-h-[120px]"
            style={{ caretColor: accentColor, color: "var(--fg, #111)" }}
          />
          {charCount > charMax * 0.8 && (
            <span className={`text-[10px] shrink-0 ml-2 self-end mb-0.5 tabular-nums ${
              charCount >= charMax ? "text-red-400" : ""
            }`} style={{ color: charCount >= charMax ? "#f87171" : "rgba(0,0,0,0.4)" }}>
              {charCount}/{charMax}
            </span>
          )}
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowEmoji((p) => !p)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-all cursor-pointer active:opacity-60"
            style={{ color: "var(--muted, #888)" }}
            title="Emoji"
          >
            <Smile className="h-5 w-5" />
          </button>
          {showEmoji && (
            <div
              ref={emojiRef}
              className="absolute bottom-12 right-0 p-2.5 rounded-2xl shadow-xl grid grid-cols-6 gap-1 z-50 w-56 animate-in fade-in slide-in-from-bottom-2 duration-150"
              style={{
                background: "white",
                border: "1px solid rgba(0,0,0,0.1)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              }}
            >
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setInput((p) => p + emoji);
                    textareaRef.current?.focus();
                  }}
                  className="h-8 w-8 flex items-center justify-center text-lg rounded-lg active:scale-90 transition-transform cursor-pointer"
                  style={{ color: "#111" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="flex h-10 w-10 items-center justify-center rounded-full shrink-0 transition-all duration-200 active:scale-95"
          style={{
            backgroundColor: canSend ? accentColor : "rgba(0,0,0,0.08)",
            color: canSend ? (chatTheme === "white" ? "#111" : "#fff") : "rgba(0,0,0,0.3)",
            cursor: canSend ? "pointer" : "default",
          }}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </button>
      </div>

      <p className="text-[10px] text-(--muted)/40 mt-1.5 ml-12 select-none hidden sm:block">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
