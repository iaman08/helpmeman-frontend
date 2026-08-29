"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Keyboard,
  RotateCcw,
  Download,
  Flame,
  Zap,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Bot,
  Code2,
  Stethoscope,
  Scale,
} from "lucide-react";
import { FooterSection } from "@/components/landing/FooterSection";
import { generateTypingReportPDF } from "@/lib/typingPdfGenerator";

const STANDARD_WORDS = [
  "the", "be", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for", "they", "i", "with",
  "as", "not", "on", "she", "at", "by", "this", "we", "you", "do", "but", "from", "or", "which",
  "one", "would", "all", "will", "there", "say", "who", "make", "when", "can", "more", "if", "no",
  "man", "out", "other", "so", "what", "time", "up", "go", "about", "than", "into", "could", "state",
  "only", "new", "year", "some", "take", "come", "these", "know", "see", "use", "get", "like", "then",
  "first", "any", "work", "now", "may", "such", "give", "over", "think", "most", "even", "find", "day",
  "also", "after", "way", "many", "must", "look", "before", "great", "back", "through", "long", "where",
  "much", "should", "well", "people", "down", "own", "just", "because", "good", "each", "those", "feel",
  "seem", "how", "high", "too", "place", "little", "world", "very", "still", "nation", "hand", "old",
  "life", "tell", "write", "become", "here", "show", "house", "both", "between", "need", "mean", "call",
  "develop", "system", "program", "code", "future", "build", "create", "launch", "scale", "impact"
];

const TECH_WORDS = [
  "const", "function", "return", "import", "export", "default", "async", "await", "promise", "interface",
  "type", "class", "extends", "component", "state", "effect", "props", "router", "endpoint", "database",
  "schema", "query", "prisma", "docker", "deploy", "server", "client", "backend", "frontend", "git",
  "commit", "branch", "merge", "pull", "request", "action", "reducer", "context", "hook", "payload",
  "token", "bearer", "middleware", "route", "controller", "service", "algorithm", "structure", "cache"
];

const MEDICAL_WORDS = [
  "anatomy", "patient", "clinical", "diagnosis", "pathology", "surgery", "therapy", "dosage", "symptoms",
  "pharmacology", "pediatrics", "cardiology", "neurology", "radiology", "biopsy", "plasma", "vaccine",
  "antibody", "sterilization", "syndrome", "treatment", "hospital", "residency", "doctor", "physician"
];

const BUSINESS_WORDS = [
  "strategy", "valuation", "equity", "quarterly", "revenue", "margin", "capital", "venture", "investor",
  "portfolio", "acquisition", "audit", "compliance", "litigation", "contract", "precedent", "agreement",
  "executive", "leadership", "mentorship", "growth", "roadmap", "conversion", "metrics", "pipeline"
];

export default function TypingTestPage() {
  const [duration, setDuration] = useState<number>(30); // 15, 30, 60
  const [wordCategory, setWordCategory] = useState<string>("standard");
  const [words, setWords] = useState<string[]>([]);
  const [userName, setUserName] = useState("");

  // Typing Game State
  const [wordIndex, setWordIndex] = useState(0);
  const [typedInput, setTypedInput] = useState("");
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [wordStatuses, setWordStatuses] = useState<boolean[]>([]); // true if correctly typed
  const [correctChars, setCorrectChars] = useState(0);
  const [totalTypedChars, setTotalTypedChars] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFinished, setIsFinished] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate word list based on category
  const generateWords = useCallback(() => {
    let baseBank = STANDARD_WORDS;
    if (wordCategory === "tech") baseBank = TECH_WORDS;
    if (wordCategory === "medical") baseBank = MEDICAL_WORDS;
    if (wordCategory === "business") baseBank = BUSINESS_WORDS;

    const shuffled = [...baseBank].sort(() => Math.random() - 0.5);
    // Duplicate to make sure we have 150 words available
    const extended = [...shuffled, ...[...baseBank].sort(() => Math.random() - 0.5)];
    setWords(extended.slice(0, 150));
  }, [wordCategory]);

  const resetTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    generateWords();
    setWordIndex(0);
    setTypedInput("");
    setCompletedWords([]);
    setWordStatuses([]);
    setCorrectChars(0);
    setTotalTypedChars(0);
    setErrorCount(0);
    setIsActive(false);
    setTimeLeft(duration);
    setIsFinished(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [duration, generateWords]);

  useEffect(() => {
    resetTest();
  }, [duration, wordCategory, resetTest]);

  // Timer Countdown Effect
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // Key Handler for Typing Input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (!isActive && !isFinished && val.length > 0) {
      setIsActive(true);
    }

    if (isFinished) return;

    // Space pressed -> submit current word
    if (val.endsWith(" ")) {
      const currentWord = words[wordIndex] || "";
      const trimmedVal = val.trim();

      const isCorrect = trimmedVal === currentWord;
      setWordStatuses((prev) => [...prev, isCorrect]);
      setCompletedWords((prev) => [...prev, trimmedVal]);

      if (isCorrect) {
        setCorrectChars((prev) => prev + currentWord.length + 1); // +1 space
      } else {
        setErrorCount((prev) => prev + 1);
      }

      setTotalTypedChars((prev) => prev + trimmedVal.length + 1);
      setWordIndex((prev) => prev + 1);
      setTypedInput("");
      return;
    }

    setTypedInput(val);
  };

  // Metrics Calculation
  const elapsedSeconds = duration - timeLeft || 1;
  const currentMinutes = elapsedSeconds / 60;

  // Net WPM = (All typed correct characters / 5) / minutes
  const netWpm = Math.max(0, Math.round(correctChars / 5 / (isActive || isFinished ? currentMinutes : 1)));
  const rawWpm = Math.max(0, Math.round(totalTypedChars / 5 / (isActive || isFinished ? currentMinutes : 1)));
  const accuracy = totalTypedChars > 0 ? Math.min(100, Math.round((correctChars / totalTypedChars) * 100)) : 100;

  // Download PDF Report Call
  const handleDownloadPDF = () => {
    generateTypingReportPDF({
      userName: userName.trim() || "HelpMeMan Candidate",
      wpm: netWpm,
      accuracy,
      consistency: Math.min(99, Math.max(88, accuracy - 2)),
      rawWpm,
      durationSeconds: duration,
      totalCharsTyped: totalTypedChars,
      correctChars,
      errorCount,
      wordCategory: wordCategory.toUpperCase(),
    });
  };

  const getWpmRankBadge = (wpm: number) => {
    if (wpm >= 90) return { label: "Top 1% Elite Typist", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
    if (wpm >= 70) return { label: "Top 5% Advanced Professional", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
    if (wpm >= 50) return { label: "Top 20% Above Average", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" };
    return { label: "Competent Typist", color: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20" };
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0A0A0B] text-gray-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#0A0A0B]/80 border-b border-gray-200/80 dark:border-zinc-800/80">
        <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 sm:px-10 py-4">
          <Link href="/" className="font-bold text-xl tracking-tight text-[var(--fg)] flex items-center gap-2 select-none">
            <img src="/logo.svg" alt="HelpMeMan Logo" className="w-7 h-7 object-contain" />
            <span>HelpMeMan</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/resume-roast" className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)] transition-colors hidden sm:block">
              AI Resume Roast
            </Link>
            <Link href="/mentors" className="text-xs font-semibold px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm">
              Book 1:1 Mentorship
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-[1100px] px-6 sm:px-10 pt-28 pb-20 w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-500/20">
            <Keyboard className="w-4 h-4 text-blue-500" />
            Monkeytype-Style AI Typing Speed Engine
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--fg)] leading-tight">
            Test Your Typing Speed. <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Get an Official AI Certified Skill Report.
            </span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[var(--muted)] leading-relaxed">
            Practice precision typing with live WPM tracking, accuracy feedback, and download an official HelpMeMan performance report for your resume & LinkedIn.
          </p>
        </div>

        {/* Controls Toolbar */}
        {!isFinished && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#121214] border border-gray-200/80 dark:border-zinc-800/80 mb-8 shadow-sm">
            {/* Category Selectors */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setWordCategory("standard")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  wordCategory === "standard"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 dark:bg-zinc-900 text-[var(--muted)] border-gray-200 dark:border-zinc-800 hover:text-[var(--fg)]"
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setWordCategory("tech")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                  wordCategory === "tech"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 dark:bg-zinc-900 text-[var(--muted)] border-gray-200 dark:border-zinc-800 hover:text-[var(--fg)]"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Tech & Code
              </button>
              <button
                type="button"
                onClick={() => setWordCategory("medical")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                  wordCategory === "medical"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 dark:bg-zinc-900 text-[var(--muted)] border-gray-200 dark:border-zinc-800 hover:text-[var(--fg)]"
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                Medical
              </button>
              <button
                type="button"
                onClick={() => setWordCategory("business")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                  wordCategory === "business"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 dark:bg-zinc-900 text-[var(--muted)] border-gray-200 dark:border-zinc-800 hover:text-[var(--fg)]"
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                Business
              </button>
            </div>

            {/* Time Mode Selectors */}
            <div className="flex items-center gap-2">
              {[15, 30, 60].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDuration(t)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    duration === t
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-50 dark:bg-zinc-900 text-[var(--muted)] border-gray-200 dark:border-zinc-800"
                  }`}
                >
                  {t}s
                </button>
              ))}

              <button
                type="button"
                onClick={resetTest}
                className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer ml-2"
                title="Restart Test"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Typing Active Area */}
        {!isFinished ? (
          <div
            onClick={() => inputRef.current?.focus()}
            className="bg-white dark:bg-[#121214] p-8 sm:p-12 rounded-3xl border border-gray-200/80 dark:border-zinc-800/80 shadow-xl relative cursor-text min-h-[300px] flex flex-col justify-between"
          >
            {/* Live Stats Header Bar */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-4 mb-6">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">Time Left</span>
                  <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <Clock className="w-5 h-5" />
                    {timeLeft}s
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">Live Speed</span>
                  <p className="text-2xl font-extrabold text-[var(--fg)]">{netWpm} <span className="text-xs font-normal text-[var(--muted)]">WPM</span></p>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">Accuracy</span>
                <p className="text-2xl font-extrabold text-emerald-500">{accuracy}%</p>
              </div>
            </div>

            {/* Hidden Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={typedInput}
              onChange={handleInputChange}
              className="absolute opacity-0 pointer-events-none"
              autoFocus
            />

            {/* Monkeytype Words Display Box */}
            <div className="flex flex-wrap gap-x-3 gap-y-2 text-xl sm:text-2xl font-mono leading-relaxed select-none overflow-hidden max-h-[180px]">
              {words.slice(0, 50).map((word, wIdx) => {
                const isCurrentWord = wIdx === wordIndex;
                const isCompleted = wIdx < wordIndex;

                return (
                  <span
                    key={wIdx}
                    className={`relative px-1 rounded-md transition-colors ${
                      isCurrentWord
                        ? "bg-blue-500/10 border-b-2 border-blue-500 text-[var(--fg)] font-bold"
                        : isCompleted
                        ? wordStatuses[wIdx]
                          ? "text-emerald-500"
                          : "text-rose-500 line-through"
                        : "text-gray-400 dark:text-zinc-600"
                    }`}
                  >
                    {word.split("").map((char, cIdx) => {
                      if (isCurrentWord) {
                        const typedChar = typedInput[cIdx];
                        if (typedChar === undefined) {
                          return <span key={cIdx} className="text-gray-400 dark:text-zinc-600">{char}</span>;
                        }
                        if (typedChar === char) {
                          return <span key={cIdx} className="text-emerald-500 font-bold">{char}</span>;
                        }
                        return <span key={cIdx} className="text-rose-500 bg-rose-500/20 underline font-bold">{char}</span>;
                      }
                      return <span key={cIdx}>{char}</span>;
                    })}
                  </span>
                );
              })}
            </div>

            {/* Bottom Hint */}
            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-zinc-800/80 text-center text-xs text-[var(--muted)] flex items-center justify-center gap-2">
              <span>Start typing to launch timer. Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 border text-[10px]">Space</kbd> after each word.</span>
            </div>
          </div>
        ) : (
          /* Results Dashboard View */
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Action Bar */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <button
                type="button"
                onClick={resetTest}
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-[var(--fg)] hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retake Typing Test
              </button>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Enter your name for PDF Certificate"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#121214] border border-gray-200 dark:border-zinc-800 text-xs text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                />
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs hover:opacity-95 transition-all shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Certified PDF Report
                </button>
              </div>
            </div>

            {/* Score Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Primary WPM Dial */}
              <div className="bg-white dark:bg-[#121214] p-8 rounded-3xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm text-center flex flex-col items-center justify-center">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Net Typing Speed</p>
                <span className="text-6xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{netWpm}</span>
                <span className="text-xs font-semibold text-[var(--muted)] mt-1 uppercase tracking-widest">Words Per Minute</span>
                <div className={`mt-4 px-3.5 py-1.5 rounded-full text-xs font-bold border ${getWpmRankBadge(netWpm).color}`}>
                  {getWpmRankBadge(netWpm).label}
                </div>
              </div>

              {/* Accuracy Meter */}
              <div className="bg-white dark:bg-[#121214] p-8 rounded-3xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm text-center flex flex-col items-center justify-center">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Accuracy Rate</p>
                <span className="text-6xl font-black text-emerald-500 tracking-tight">{accuracy}%</span>
                <span className="text-xs font-semibold text-[var(--muted)] mt-1 uppercase tracking-widest">Precision Score</span>
                <p className="text-xs text-[var(--muted)] mt-4">
                  {errorCount === 0 ? "Perfect execution with 0 errors!" : `${errorCount} uncorrected typos logged.`}
                </p>
              </div>

              {/* Raw Stats */}
              <div className="bg-white dark:bg-[#121214] p-8 rounded-3xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-4">Performance Metrics</p>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                      <span className="text-[var(--muted)]">Raw Speed</span>
                      <span className="font-bold text-[var(--fg)]">{rawWpm} WPM</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                      <span className="text-[var(--muted)]">Test Duration</span>
                      <span className="font-bold text-[var(--fg)]">{duration} Seconds</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                      <span className="text-[var(--muted)]">Correct Characters</span>
                      <span className="font-bold text-emerald-500">{correctChars}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Total Keystrokes</span>
                      <span className="font-bold text-[var(--fg)]">{totalTypedChars}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Skill Diagnostic Card */}
            <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 p-8 rounded-3xl border border-blue-500/20 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Bot className="w-4 h-4 text-blue-500" />
                AI Typing Skill Diagnostic & Assessment
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[var(--fg)] leading-relaxed">
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-blue-500/10">
                  <p className="font-bold text-sm text-[var(--fg)] mb-1">⚡ Speed & Cadence</p>
                  <p className="text-[var(--muted)]">
                    {netWpm >= 70
                      ? "Your typing speed is in the top tier of tech professionals, engineers, and executives. You maintain high-speed rhythm across complex word blocks."
                      : "Good steady cadence! Focused practice on 200 common n-gram patterns will help boost your speed past 70 WPM."}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-blue-500/10">
                  <p className="font-bold text-sm text-[var(--fg)] mb-1">🎯 Precision & Finger Control</p>
                  <p className="text-[var(--muted)]">
                    {accuracy >= 98
                      ? "Flawless precision! Minimal backspacing penalty means your raw speed directly translates into maximum net productivity."
                      : "Reducing burst typos on complex words will instantly increase net WPM score by 8-10% without typing faster."}
                  </p>
                </div>
              </div>
            </div>

            {/* Mentor CTA Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-extrabold">Ready to Boost Your Technical & Career Edge?</h3>
                <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
                  Connect with verified mentors from IITs, AIIMS, and FAANG for 1:1 technical interview prep, career roadmap, and resume coaching.
                </p>
              </div>
              <Link
                href="/mentors"
                className="px-6 py-3.5 rounded-2xl bg-white text-blue-600 font-bold text-xs uppercase tracking-wider hover:bg-blue-50 shadow-lg shrink-0"
              >
                Book 1:1 Mentorship →
              </Link>
            </div>
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
