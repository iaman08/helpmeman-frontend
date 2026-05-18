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

  // Custom event listener for opening AI Assistant from Sidebar
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    if (typeof window !== "undefined") {
      window.addEventListener("open-ai", handleOpen);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("open-ai", handleOpen);
      }
    };
  }, []);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  if (!user) return null;

  async function handleSend() {
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
      {/* ─── Chat Fullscreen panel ─── */}
      {isOpen && (
        <div
          className="fixed inset-y-0 right-0 left-0 md:left-64 z-30 flex flex-col overflow-hidden bg-(--bg) animate-in slide-in-from-bottom duration-300 border-l border-(--hairline)"
        >
          {/* Header */}
          <div className="w-full border-b border-(--hairline) bg-(--fg)/[0.02] px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex max-w-4xl w-full mx-auto items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--accent)/10">
                  <Bot className="h-5 w-5 text-(--accent)" />
                </div>
                <div>
                  <h3 className="text-base font-medium">HelpMeMan AI</h3>
                  <p className="text-xs text-(--muted)">
                    Mentor finder &amp; career guide
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 text-(--muted) hover:text-(--fg) rounded-lg hover:bg-(--fg)/5 cursor-pointer transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new Event("close-ai"));
                    }
                  }}
                  className="p-2 text-(--muted) hover:text-(--fg) rounded-lg hover:bg-(--fg)/5 cursor-pointer transition-colors"
                  title="Close"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 w-full">
            <div className="max-w-4xl w-full mx-auto flex flex-col gap-5 h-full">
              {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--accent)/10 animate-pulse">
                    <Sparkles className="h-6 w-6 text-(--accent)" />
                  </div>
                  <p className="text-lg font-medium">
                    Hi {user.name.split(" ")[0]}! 👋
                  </p>
                  <p className="text-sm text-(--muted) max-w-sm leading-relaxed">
                    I can help you find the perfect mentor, answer questions about
                    sessions, or give career advice. Try asking:
                  </p>
                  <div className="flex flex-col gap-2 w-full max-w-md">
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
                        className="text-xs text-left rounded-xl bg-(--fg)/[0.02] hover:bg-(--fg)/5 px-4 py-3 transition-colors cursor-pointer"
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
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-(--accent) text-(--accent-fg) rounded-br-md"
                        : "bg-(--fg)/[0.04] rounded-bl-md"
                    }`}
                  >
                    {msg.role === "ai" ? (
                      <div className="flex flex-col gap-1.5 text-[14px] leading-relaxed">
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
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-(--muted) animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-(--muted) animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-(--muted) animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-xs text-red-500 bg-red-500/10 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="w-full border-t border-(--hairline) bg-(--bg) px-6 py-4 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="max-w-4xl w-full mx-auto flex items-center gap-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                maxLength={2000}
                disabled={loading}
                className="flex-1 bg-(--fg)/5 rounded-full px-5 py-3 text-sm outline-none focus:bg-(--fg)/8 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-(--accent) text-(--accent-fg) hover:opacity-90 cursor-pointer disabled:opacity-30 shrink-0 transition-opacity"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
