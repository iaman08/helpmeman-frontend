"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Bot, Send, X, Trash2, Sparkles, Minimize2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { AxiosError } from "axios";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

function parseMarkdownLinks(text: string) {
  // Convert [text](/path) to clickable links
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    const match = part.match(/\[(.*?)\]\((.*?)\)/);
    if (match) {
      return (
        <Link
          key={i}
          href={match[2]}
          className="text-(--accent) hover:underline font-medium"
        >
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

    // Bold text
    const boldParts = trimmed.split(/(\*\*.*?\*\*)/g);
    const formatted = boldParts.map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return (
          <strong key={j} className="font-semibold">
            {parseMarkdownLinks(p.slice(2, -2))}
          </strong>
        );
      }
      return <span key={j}>{parseMarkdownLinks(p)}</span>;
    });

    // List items
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      return (
        <li key={i} className="ml-4 list-disc">
          {formatted.map((f, j) => (
            <span key={j}>{j === 0 ? f.props.children : f}</span>
          ))}
        </li>
      );
    }

    if (trimmed.length === 0) {
      return <br key={i} />;
    }

    return (
      <p key={i} className="leading-relaxed">
        {formatted}
      </p>
    );
  });
}

export function AIChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  if (!user) return null;

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || loading) return;

    setInput("");
    setError("");

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      content: msg,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chat", { message: msg });
      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        role: "ai",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Failed to get response");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    try {
      await api.post("/ai/clear");
    } catch {
      /* best effort */
    }
    setMessages([]);
    setError("");
  }

  return (
    <>
      {/* ─── Floating button ─── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-(--accent) text-(--accent-fg) shadow-lg hover:scale-105 transition-transform cursor-pointer"
          aria-label="Open AI chat"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {/* ─── Chat panel ─── */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[380px] h-[520px] rounded-2xl shadow-2xl border border-(--hairline) overflow-hidden"
          style={{ background: "var(--bg)" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-(--hairline) bg-(--fg)/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--accent)/10">
                <Bot className="h-4 w-4 text-(--accent)" />
              </div>
              <div>
                <h3 className="text-sm font-medium">HelpMeMan AI</h3>
                <p className="text-[10px] text-(--muted)">
                  Mentor finder &amp; career guide
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-(--muted) hover:text-(--fg) rounded-lg hover:bg-(--fg)/5 cursor-pointer"
                title="Clear chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-(--muted) hover:text-(--fg) rounded-lg hover:bg-(--fg)/5 cursor-pointer"
                title="Close"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--accent)/10">
                  <Sparkles className="h-5 w-5 text-(--accent)" />
                </div>
                <p className="text-sm font-medium">
                  Hi {user.name.split(" ")[0]}! 👋
                </p>
                <p className="text-xs text-(--muted) max-w-[260px] leading-relaxed">
                  I can help you find the perfect mentor, answer questions about
                  sessions, or give career advice. Try asking:
                </p>
                <div className="flex flex-col gap-1.5 w-full">
                  {[
                    "Find me a DSA mentor under ₹500",
                    "How do I book a session?",
                    "I need help with PM interviews",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="text-[11px] text-left rounded-lg bg-(--fg)/[0.02] hover:bg-(--fg)/5 px-3 py-2 transition-colors cursor-pointer"
                    >
                      &ldquo;{suggestion}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-(--accent) text-(--accent-fg) rounded-br-md"
                      : "bg-(--fg)/[0.04] rounded-bl-md"
                  }`}
                >
                  {msg.role === "ai" ? (
                    <div className="flex flex-col gap-1 text-[13px] leading-relaxed">
                      {formatAIContent(msg.content)}
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-(--fg)/[0.04] rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-(--muted) animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-(--muted) animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-(--muted) animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 px-3 py-3 border-t border-(--hairline)"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              maxLength={2000}
              disabled={loading}
              className="flex-1 bg-(--fg)/5 rounded-full px-4 py-2.5 text-sm outline-none focus:bg-(--fg)/8 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-(--accent) text-(--accent-fg) hover:opacity-90 cursor-pointer disabled:opacity-30 shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
