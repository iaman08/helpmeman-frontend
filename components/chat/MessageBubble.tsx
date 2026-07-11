"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Check, CheckCheck, Clock, Copy, Reply, Pencil, Trash2,
  Download, FileText, AlertCircle, X
} from "lucide-react";
import type { ChatMessage, ChatAttachment } from "@/lib/types";

const REACTION_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🔥"];

function StatusIcon({ status, isRead }: { status?: string; isRead?: boolean }) {
  if (status === "SENDING") return <Clock className="h-3 w-3 opacity-50" />;
  if (status === "READ" || isRead) return <CheckCheck className="h-3 w-3 text-blue-400" />;
  if (status === "DELIVERED") return <CheckCheck className="h-3 w-3 opacity-60" />;
  return <Check className="h-3 w-3 opacity-60" />;
}

interface AttachmentPreviewProps {
  attachment: ChatAttachment;
  isMine: boolean;
  onImageClick?: (url: string, name: string) => void;
}

function AttachmentPreview({ attachment, isMine, onImageClick }: AttachmentPreviewProps) {
  const [imgErr, setImgErr] = useState(false);

  const isImg =
    attachment.type?.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(attachment.url);

  const sizeKB = attachment.size ? (attachment.size / 1024).toFixed(1) + " KB" : null;

  if (isImg && !imgErr) {
    return (
      <div
        className="block mt-2 rounded-xl overflow-hidden cursor-zoom-in active:scale-95 transition-transform"
        onClick={(e) => {
          e.stopPropagation();
          if (onImageClick) {
            onImageClick(attachment.url, attachment.name || "Image");
          } else {
            window.open(attachment.url, "_blank");
          }
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.name || "image"}
          className="rounded-xl object-cover hover:opacity-90 transition-opacity"
          style={{ maxWidth: 220, maxHeight: 260, width: "100%", display: "block" }}
          onError={() => setImgErr(true)}
          loading="lazy"
          crossOrigin="anonymous"
        />
      </div>
    );
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      download={attachment.name}
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-2 mt-2 rounded-xl px-3 py-2.5 max-w-[220px] transition-opacity active:opacity-70"
      style={{
        background: isMine ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)",
        border: "1px solid " + (isMine ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)"),
      }}
    >
      <FileText className="h-4 w-4 shrink-0" style={{ opacity: 0.75 }} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium truncate">{attachment.name || "File"}</p>
        {sizeKB && <p className="text-[10px] opacity-50">{sizeKB}</p>}
      </div>
      <Download className="h-3.5 w-3.5 shrink-0 opacity-60" />
    </a>
  );
}

function ReplyPreview({ reply, isMine }: { reply: ChatMessage["replyTo"]; isMine: boolean }) {
  if (!reply) return null;
  return (
    <div
      className="mb-1 px-2.5 py-1.5 border-l-[3px] rounded-sm text-[11px] max-w-full"
      style={{
        borderLeftColor: isMine ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.2)",
        background: isMine ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      }}
    >
      <p className="truncate leading-relaxed opacity-85">
        {reply.deletedAt ? <em>Deleted message</em> : reply.body}
      </p>
    </div>
  );
}

function DeleteConfirmModal({
  isOpen,
  onClose,
  onDeleteForMe,
  onDeleteForEveryone,
  canDeleteForEveryone,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
  canDeleteForEveryone: boolean;
}) {
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div 
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />
      <div 
        className="relative w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-4 text-center"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '360px',
          borderRadius: '24px',
          padding: '24px',
          background: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          border: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 10,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center" style={{ display: 'flex', justifycontent: 'center' }}>
          <div 
            className="p-3.5 rounded-full"
            style={{
              padding: '14px',
              background: '#fef2f2',
              color: '#ef4444',
              borderRadius: '9999px',
              display: 'inline-flex',
            }}
          >
            <Trash2 className="h-6 w-6" />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-bold" style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Delete Message?</h3>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed" style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px', leadingheight: 1.5 }}>
            Choose whether to remove this message just for yourself or for all participants in the chat.
          </p>
        </div>

        <div className="flex flex-col gap-2 mt-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {canDeleteForEveryone && (
            <button
              onClick={() => { onDeleteForEveryone(); onClose(); }}
              className="w-full py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-all active:scale-98 shadow-sm cursor-pointer"
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: '16px',
                background: '#ef4444',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Delete for Everyone
            </button>
          )}
          
          <button
            onClick={() => { onDeleteForMe(); onClose(); }}
            className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm transition-all active:scale-98 cursor-pointer"
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: '16px',
              background: '#f3f4f6',
              color: '#1f2937',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Delete for Me
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-500 font-semibold text-sm transition-all active:scale-98 cursor-pointer"
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              color: '#9ca3af',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface MenuPos { x: number; y: number }

function DesktopContextMenu({
  pos, isMine, canEdit, isDeleted,
  onReply, onCopy, onEdit, onDelete, onReact, onClose,
}: {
  pos: MenuPos; isMine: boolean; canEdit: boolean; isDeleted: boolean;
  onReply: () => void; onCopy: () => void; onEdit: () => void; onDelete: () => void;
  onReact: (emoji: string) => void; onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const [isMeasured, setIsMeasured] = useState(false);

  useEffect(() => {
    function updatePosition() {
      const el = menuRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const width = rect.width || 200;
      const height = rect.height || (isDeleted ? 120 : 250);

      let left = pos.x;
      let top = pos.y;

      if (left + width > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - width - 8);
      }
      if (top + height > window.innerHeight - 8) {
        top = Math.max(8, pos.y - height);
      }

      setCoords({ left, top });
      setIsMeasured(true);
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [pos.x, pos.y, isDeleted]);

  const items = isDeleted 
    ? []
    : [
        { icon: Reply, label: "Reply", action: onReply },
        { icon: Copy, label: "Copy", action: onCopy },
        ...(canEdit ? [{ icon: Pencil, label: "Edit", action: onEdit }] : []),
        { icon: Trash2, label: "Delete", action: onDelete, destructive: true },
      ];

  return createPortal(
    <>
      <div className="fixed inset-0 z-[990]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div
        ref={menuRef}
        className="fixed z-[1000] rounded-2xl shadow-2xl overflow-hidden origin-top-left"
        style={{
          left: coords.left,
          top: coords.top,
          minWidth: 200,
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          visibility: isMeasured ? "visible" : "hidden",
          opacity: isMeasured ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!isDeleted && (
          <div className="flex items-center gap-1.5 px-3 py-2.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "rgba(0,0,0,0.01)" }}>
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => { onReact(emoji); onClose(); }}
                className="h-8 w-8 flex items-center justify-center text-lg rounded-full transition-transform hover:scale-125 cursor-pointer active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        
        {items.length > 0 ? (
          items.map(({ icon: Icon, label, action, destructive }) => (
            <button
              key={label}
              onClick={() => { action(); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer text-left"
              style={{ color: destructive ? "#ef4444" : "#111" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = destructive ? "rgba(239,68,68,0.07)" : "rgba(0,0,0,0.04)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{label}</span>
            </button>
          ))
        ) : (
          <div className="px-4 py-3 text-xs text-gray-400 italic text-center">No actions available</div>
        )}
      </div>
    </>,
    document.body
  );
}

function MobileActionSheet({
  isMine, canEdit, isDeleted,
  onReply, onCopy, onEdit, onDelete, onReact, onClose,
}: {
  isMine: boolean; canEdit: boolean; isDeleted: boolean;
  onReply: () => void; onCopy: () => void; onEdit: () => void; onDelete: () => void;
  onReact: (emoji: string) => void; onClose: () => void;
}) {
  const items = isDeleted
    ? []
    : [
        { icon: Reply, label: "Reply", action: onReply },
        { icon: Copy, label: "Copy text", action: onCopy },
        ...(canEdit ? [{ icon: Pencil, label: "Edit message", action: onEdit }] : []),
        { icon: Trash2, label: "Delete message", action: onDelete, destructive: true },
      ];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[990] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
      <div className="relative w-full" onClick={(e) => e.stopPropagation()}>
        {!isDeleted && (
          <div className="mx-3 mb-2 rounded-2xl flex items-center justify-around px-2 py-3" style={{ background: "rgba(255,255,255,0.97)", boxShadow: "0 -4px 40px rgba(0,0,0,0.12)" }}>
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => { onReact(emoji); onClose(); }}
                className="flex flex-col items-center gap-0.5 cursor-pointer active:scale-90 transition-transform"
              >
                <span className="text-3xl leading-none">{emoji}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mx-3 mb-2 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.97)", boxShadow: "0 -4px 40px rgba(0,0,0,0.08)" }}>
          {items.length > 0 ? (
            items.map(({ icon: Icon, label, action, destructive }, i) => (
              <button
                key={label}
                onClick={() => { action(); onClose(); }}
                className="w-full flex items-center gap-3.5 px-5 py-4 text-base transition-colors cursor-pointer text-left active:opacity-60"
                style={{
                  color: destructive ? "#ef4444" : "#111",
                  borderTop: i > 0 ? "1px solid rgba(0,0,0,0.07)" : "none",
                }}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="font-medium">{label}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-4 text-sm text-gray-400 italic text-center" style={{ background: "#fff" }}>No actions available</div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mx-3 mb-4 w-[calc(100%-24px)] py-4 rounded-2xl flex items-center justify-center gap-2 text-base font-semibold active:opacity-60 transition-opacity cursor-pointer"
          style={{ background: "rgba(255,255,255,0.97)", color: "#111", boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
}

interface MessageBubbleProps {
  msg: ChatMessage;
  isMine: boolean;
  isLastMine: boolean;
  chatTheme: string;
  onReply: (msg: ChatMessage) => void;
  onEdit: (msg: ChatMessage) => void;
  onDelete: (msgId: string) => void;
  onReact: (emoji: string) => void;
  userId: string;
  otherName?: string;
  onProfileClick?: () => void;
  onImageClick?: (url: string, name: string) => void;
}

function bubbleStyle(theme: string, isMine: boolean): React.CSSProperties {
  if (!isMine) {
    return {
      background: "rgba(0,0,0,0.06)",
      border: "1px solid rgba(0,0,0,0.07)",
      color: "var(--fg, #111)",
      borderRadius: "18px 18px 18px 4px",
    };
  }
  const themes: Record<string, React.CSSProperties> = {
    imessage: { background: "#007aff", color: "#fff", borderRadius: "18px 18px 4px 18px" },
    sms:      { background: "#34c759", color: "#fff", borderRadius: "18px 18px 4px 18px" },
    pink:     { background: "#ff2d55", color: "#fff", borderRadius: "18px 18px 4px 18px" },
    white:    { background: "#ffffff", color: "#111", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "18px 18px 4px 18px" },
  };
  return themes[theme] ?? themes.imessage;
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({
  msg, isMine, isLastMine, chatTheme, onReply, onEdit, onDelete, onReact, userId, otherName, onProfileClick, onImageClick,
}: MessageBubbleProps) {
  const [desktopMenuPos, setDesktopMenuPos] = useState<MenuPos | null>(null);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [deletedForMe, setDeletedForMe] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const list = JSON.parse(localStorage.getItem("helpmeman.deletedForMe") || "[]");
        return list.includes(msg.id);
      } catch {
        return false;
      }
    }
    return false;
  });

  const handleDeleteForMe = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const list = JSON.parse(localStorage.getItem("helpmeman.deletedForMe") || "[]");
        if (!list.includes(msg.id)) {
          list.push(msg.id);
          localStorage.setItem("helpmeman.deletedForMe", JSON.stringify(list));
        }
      } catch {}
    }
    setDeletedForMe(true);
  }, [msg.id]);

  if (deletedForMe) return null;

  const pickerRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchMoved = useRef(false);

  const isDeleted = !!msg.deletedAt;
  const isEdited = !!msg.editedAt && !isDeleted;
  const canEdit =
    isMine && !isDeleted && !!msg.createdAt &&
    Date.now() - new Date(msg.createdAt).getTime() < 15 * 60 * 1000;

  const attachments = Array.isArray(msg.attachments) ? (msg.attachments as ChatAttachment[]) : null;

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDesktopMenuPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleTouchStart = useCallback(() => {
    touchMoved.current = false;
    longPressTimer.current = setTimeout(() => {
      if (!touchMoved.current) {
        setShowMobileSheet(true);
        if ("vibrate" in navigator) navigator.vibrate(30);
      }
    }, 500);
  }, []);

  const handleTouchMove = useCallback(() => {
    touchMoved.current = true;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(msg.body).catch(() => {});
  }, [msg.body]);

  useEffect(() => {
    if (!showReactionPicker) return;
    function handler(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowReactionPicker(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showReactionPicker]);

  const bubbleSty = bubbleStyle(chatTheme, isMine);

  const existingReactions = msg.reactions || [];
  const reactionCounts = existingReactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const myReactionEntry = existingReactions.find(r => r.userId === userId);
  const myReaction = myReactionEntry?.emoji || null;

  const reactionEntries = Object.entries(reactionCounts).filter(([, count]) => count > 0);

  return (
    <div className={`flex w-full mb-1 select-text group ${isMine ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-col max-w-[78%] sm:max-w-[68%]">
        {!isMine && otherName && (
          <span 
            onClick={onProfileClick}
            className="text-[10px] font-bold mb-0.5 ml-1 tracking-wide select-none uppercase opacity-50 hover:opacity-100 transition-opacity cursor-pointer inline-block self-start"
          >
            {otherName}
          </span>
        )}

        <div
          style={{
            ...bubbleSty,
            opacity: msg._sending ? 0.65 : msg._failed ? 0.4 : 1,
            cursor: "pointer",
            transition: "opacity 0.15s",
          }}
          onContextMenu={handleContextMenu}
          onClick={() => setShowTime((p) => !p)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {msg.replyTo && (
            <div className="px-4 pt-3 pb-0">
              <ReplyPreview reply={msg.replyTo} isMine={isMine} />
            </div>
          )}

          {isDeleted ? (
            <div className="px-4 py-2.5 flex items-center gap-1.5 opacity-55 italic text-[13px]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              This message was deleted
            </div>
          ) : (
            <div className={`${attachments && attachments.length > 0 && !msg.body ? "p-0" : "px-4 py-2.5"}`}>
              {msg.body && (
                <div className={`${attachments && attachments.length > 0 ? "px-4 pt-2.5 pb-1" : ""}`}>
                  <p className="text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                    {msg.body.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                      /^https?:\/\//.test(part) ? (
                        <a
                           key={i}
                           href={part}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="underline underline-offset-2"
                           style={{ color: isMine ? "rgba(255,255,255,0.9)" : "#2563eb" }}
                           onClick={(e) => e.stopPropagation()}
                        >
                          {part}
                        </a>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </p>
                </div>
              )}

              {attachments && attachments.length > 0 && (
                <div className={msg.body ? "px-4 pb-2.5" : "p-1"}>
                  {attachments.map((att, i) => (
                    <AttachmentPreview key={i} attachment={att} isMine={isMine} onImageClick={onImageClick} />
                  ))}
                </div>
              )}

              {isEdited && (
                <span
                  className="block text-[10px] mt-0.5 px-4 pb-1"
                  style={{ color: isMine ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}
                >
                  edited
                </span>
              )}
            </div>
          )}
        </div>

        {!isDeleted && reactionEntries.length > 0 && (
          <div className={`flex items-center gap-1 mt-1 flex-wrap ${isMine ? "justify-end" : "justify-start"}`}>
            {reactionEntries.map(([emoji, count]) => {
              const hasReacted = myReaction === emoji;
              return (
                <button
                  key={emoji}
                  onClick={() => onReact(emoji)}
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-sm cursor-pointer transition-all active:scale-90 select-none shadow-sm"
                  style={{
                    background: hasReacted ? "rgba(0,122,255,0.12)" : "rgba(0,0,0,0.06)",
                    border: hasReacted ? "1px solid rgba(0,122,255,0.25)" : "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <span>{emoji}</span>
                  <span className="text-[11px] font-semibold" style={{ color: hasReacted ? "#007aff" : "#333" }}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        <div
          className={`flex items-center gap-1 mt-0.5 px-1 select-none opacity-65 ${
            isMine ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.5)" }}>
            {formatTime(msg.createdAt || new Date().toISOString())}
          </span>
          {isMine && (
            <>
              {msg._failed ? (
                <span className="text-[10px] text-red-400 font-semibold animate-pulse">Failed</span>
              ) : (
                <StatusIcon status={msg.status || (msg.isRead ? "READ" : "SENT")} isRead={msg.isRead} />
              )}
            </>
          )}
        </div>

        {isMine && isLastMine && !msg._sending && !msg._failed && msg.isRead && (
          <p className="text-[10px] font-semibold text-blue-400/70 text-right mr-1 -mt-0.5 select-none">
            Read
          </p>
        )}
      </div>

      {desktopMenuPos && (
        <DesktopContextMenu
          pos={desktopMenuPos}
          isMine={isMine}
          canEdit={canEdit}
          isDeleted={isDeleted}
          onReply={() => onReply(msg)}
          onCopy={handleCopy}
          onEdit={() => onEdit(msg)}
          onDelete={() => setShowDeleteConfirm(true)}
          onReact={onReact}
          onClose={() => setDesktopMenuPos(null)}
        />
      )}

      {showMobileSheet && (
        <MobileActionSheet
          isMine={isMine}
          canEdit={canEdit}
          isDeleted={isDeleted}
          onReply={() => onReply(msg)}
          onCopy={handleCopy}
          onEdit={() => onEdit(msg)}
          onDelete={() => setShowDeleteConfirm(true)}
          onReact={onReact}
          onClose={() => setShowMobileSheet(false)}
        />
      )}

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onDeleteForMe={handleDeleteForMe}
        onDeleteForEveryone={() => onDelete(msg.id)}
        canDeleteForEveryone={isMine && !isDeleted}
      />
    </div>
  );
}
