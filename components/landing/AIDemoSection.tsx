"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView } from "motion/react";
import { Send, Sparkles, User } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { useAIStream } from "@/hooks/useAIStream";

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

const conversations: { prompt: string; messages: ChatMessage[] }[] = [
  {
    prompt: "How do I prepare for FAANG interviews?",
    messages: [
      { role: "user", text: "How do I prepare for FAANG interviews?" },
      {
        role: "ai",
        text: "Great question! Here's a focused 3-month roadmap:\n\n1. **DSA Fundamentals** — Solve 150+ curated problems on LeetCode\n2. **System Design** — Study distributed systems patterns\n3. **Behavioral** — Prepare STAR-format stories\n\nI'd recommend connecting with these mentors who've cracked FAANG:",
      },
    ],
  },
  {
    prompt: "Should I do an MBA or join a startup?",
    messages: [
      { role: "user", text: "Should I do an MBA or join a startup?" },
      {
        role: "ai",
        text: "It depends on your career stage and goals:\n\n• **MBA** — Best if you want to switch industries, build a network, or move into leadership\n• **Startup** — Best if you want hands-on building experience and are okay with uncertainty\n\nHere are mentors who can share both perspectives:",
      },
    ],
  },
  {
    prompt: "How do I crack UPSC after engineering?",
    messages: [
      { role: "user", text: "How do I crack UPSC after engineering?" },
      {
        role: "ai",
        text: "Many IIT/NIT graduates have made this transition successfully:\n\n1. **Optional Subject** — Choose one aligned with your engineering background\n2. **Foundation** — 6 months of NCERT + standard textbooks\n3. **Answer Writing** — Start daily practice from month 3\n\nThese mentors have made the same transition:",
      },
    ],
  },
];

const suggestedMentors = [
  { name: "Arjun M.", role: "L7 @ Google", img: "/mentor3.jpg" },
  { name: "Priya K.", role: "Staff @ Meta", img: "/mentor4.jpg" },
  { name: "Vineet R.", role: "GSoC × IIT-R", img: "/mentor1.png" },
];

export function AIDemoSection() {
  const sectionRef = useRef(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [activeConvo, setActiveConvo] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showMentors, setShowMentors] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [autoplayActive, setAutoplayActive] = useState(true);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const streamingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { streamState, startStream } = useAIStream({
    endpoint: `${API_BASE}/public/ai/demo-chat/stream`,
    onToken: (text) => {
      setDisplayedMessages((prev) => {
        const next = [...prev];
        const lastMsg = next[next.length - 1];
        if (lastMsg && lastMsg.role === "ai") {
          next[next.length - 1] = { role: "ai", text };
        } else {
          next.push({ role: "ai", text });
        }
        return next;
      });
    },
    onMeta: (data) => {
      if (data && data.suggestMentor) {
        setShowMentors(true);
      }
    },
    onError: (err) => {
      setDisplayedMessages((prev) => [...prev, { role: "ai", text: err }]);
    }
  });

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [displayedMessages, isTyping, showMentors]);

  // Word-by-word simulated streaming effect
  const streamAIMessage = useCallback((text: string, onComplete?: () => void) => {
    setIsTyping(false);
    const words = text.split(" ");
    let currentText = "";
    let wordIndex = 0;

    setDisplayedMessages((prev) => [...prev, { role: "ai", text: "" }]);

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 ? "" : " ") + words[wordIndex];
        setDisplayedMessages((prev) => {
          const next = [...prev];
          if (next.length > 0) {
            next[next.length - 1] = { role: "ai", text: currentText };
          }
          return next;
        });
        wordIndex++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 30 + Math.random() * 20); // Fast, natural flow

    return interval;
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Stop any autoplay/active streams
    clearTimeouts();
    setAutoplayActive(false);
    setIsTyping(false);
    setShowMentors(false);

    const userText = inputValue;
    setDisplayedMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInputValue("");

    startStream(userText);
  };

  const playConversation = useCallback(
    (index: number) => {
      clearTimeouts();
      const convo = conversations[index];
      setDisplayedMessages([]);
      setIsTyping(false);
      setShowMentors(false);
      setAutoplayActive(true);

      const t1 = setTimeout(() => {
        setDisplayedMessages([convo.messages[0]]);
      }, 400);

      const t2 = setTimeout(() => {
        setIsTyping(true);
      }, 900);

      const t3 = setTimeout(() => {
        const interval = streamAIMessage(convo.messages[1].text, () => {
          setShowMentors(true);
        });
        streamingIntervalRef.current = interval;
      }, 2200);

      timeoutsRef.current = [t1, t2, t3];
    },
    [clearTimeouts, streamAIMessage]
  );

  useEffect(() => {
    if (inView) {
      playConversation(0);
    }
    return clearTimeouts;
  }, [inView, playConversation, clearTimeouts]);

  const handlePromptClick = (index: number) => {
    if (index === activeConvo && autoplayActive) return;
    setActiveConvo(index);
    playConversation(index);
  };

  // Stop autoplay when user focuses input
  const handleInputFocus = () => {
    if (autoplayActive && isTyping) {
      clearTimeouts();
      setIsTyping(false);
      setAutoplayActive(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="ai-section-bg py-20 md:py-28 lg:py-36 px-6"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--hairline)] text-[12px] font-medium text-[var(--muted)] mb-6 select-none">
            <Sparkles size={13} />
            Powered by AI
          </div>
          <h2 className="text-[clamp(30px,5vw,52px)] font-semibold tracking-[-0.025em] text-[var(--fg)] leading-[1.1]">
            Ask Ruth's AI
          </h2>
          <p className="mt-4 text-[16px] md:text-[18px] text-[var(--muted)] max-w-xl mx-auto leading-relaxed">
            Get instant career guidance and mentor recommendations.
            No sign-in required.
          </p>
        </motion.div>

        {/* Chat demo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="max-w-[640px] mx-auto"
        >
          {/* Prompt selector tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
            {conversations.map((convo, i) => (
              <button
                key={i}
                onClick={() => handlePromptClick(i)}
                className={`ai-prompt-tab px-4 py-2 text-[13px] font-medium rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${activeConvo === i ? "ai-prompt-tab--active" : ""
                  }`}
              >
                &ldquo;{convo.prompt}&rdquo;
              </button>
            ))}
          </div>

          {/* Chat window */}
          <div className="ai-chat-container rounded-xl overflow-hidden">
            {/* Header */}
            <div className="ai-chat-header px-5 py-3.5 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-[#2563EB] flex items-center justify-center">
                <Sparkles size={12} className="text-white" />
              </div>
              <span className="text-[13px] font-medium text-[var(--fg)]">
                Ruth
              </span>
              <span className="ml-auto flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                Online
              </span>
            </div>

            {/* Messages (scrollable) */}
            <div ref={chatBodyRef} className="ai-chat-body p-5 flex flex-col gap-4">
              {displayedMessages.map((msg, i) => (
                <div
                  key={`${activeConvo}-${i}`}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  style={{ animation: "landing-fade-up 0.35s ease forwards" }}
                >
                  {msg.role === "ai" && (
                    <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles size={13} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-xl px-4 py-3 max-w-[85%] text-[14px] leading-[1.7] ${msg.role === "user"
                      ? "bg-[#2563EB] text-white"
                      : "ai-msg-bubble"
                      }`}
                  >
                    {msg.text.split("\n").map((line, li) => (
                      <span key={li}>
                        {line.split(/(\*\*.*?\*\*)/).map((part, pi) => {
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return (
                              <strong key={pi} className="font-semibold text-current">
                                {part.slice(2, -2)}
                              </strong>
                            );
                          }
                          return <span key={pi}>{part}</span>;
                        })}
                        {li < msg.text.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-[var(--hairline)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={13} className="text-[var(--muted)]" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {(isTyping || streamState === "waiting_first_token" || streamState === "sending") && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center flex-shrink-0">
                    <Sparkles size={13} className="text-white" />
                  </div>
                  <div className="ai-msg-bubble rounded-xl px-4 py-3.5 flex items-center gap-1.5">
                    <span className="ai-typing-dot" />
                    <span className="ai-typing-dot" />
                    <span className="ai-typing-dot" />
                  </div>
                </div>
              )}

              {/* Suggested mentors */}
              {showMentors && (
                <div
                  className="flex gap-3 mt-1"
                  style={{ animation: "landing-fade-up 0.35s ease forwards" }}
                >
                  <div className="w-7 flex-shrink-0" />
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {suggestedMentors.map((m) => (
                      <div
                        key={m.name}
                        className="ai-suggested-card flex items-center gap-2.5 rounded-lg px-3 py-2.5 flex-shrink-0"
                      >
                        <img
                          src={m.img}
                          alt={m.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-[12px] font-semibold text-[var(--fg)] leading-tight">
                            {m.name}
                          </p>
                          <p className="text-[11px] text-[var(--muted)]">{m.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input bar — always enabled */}
            <form onSubmit={handleSendMessage} className="px-5 pb-5">
              <div className="ai-chat-input-bar flex items-center gap-3 rounded-xl px-4 py-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={handleInputFocus}
                  placeholder="Ask anything about your career..."
                  className="text-[14px] bg-transparent border-none outline-none flex-1 py-1"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="w-8 h-8 rounded-lg bg-[#2563EB] disabled:opacity-40 flex items-center justify-center cursor-pointer transition-opacity border-none flex-shrink-0"
                >
                  <Send size={14} className="text-white" />
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
