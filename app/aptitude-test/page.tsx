"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Brain,
  CheckCircle2,
  Clock,
  Award,
  Download,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  BookOpen,
  HelpCircle,
  AlertCircle,
  FileText,
  Mail,
  Zap,
  Lock,
  Check,
  Flag,
  UserCheck
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { FooterSection } from "@/components/landing/FooterSection";
import { generateAptitudeReportPDF, AptitudePDFData } from "@/lib/aptitudePdfGenerator";
import "../landing.css";

interface Question {
  id: string;
  section: string;
  question: string;
  options: string[];
}

interface ReviewDetail {
  id: string;
  section: string;
  question: string;
  options: string[];
  selectedOption: number | null;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}

interface TestResult {
  totalCorrect: number;
  totalQuestions: number;
  scorePercentage: number;
  percentile: number;
  timeTakenSeconds: number;
  sectionBreakdown: Record<string, { total: number; correct: number }>;
  aiAssessment: string;
  reviewDetails: ReviewDetail[];
  candidateName: string;
  candidateEmail: string;
  timestamp: string;
}

export default function AptitudeTestPage() {
  const { user } = useAuth();

  // Test state machine: "landing" | "testing" | "submitted"
  const [stage, setStage] = useState<"landing" | "testing" | "submitted">("landing");

  // Lock status
  const [unlocked, setUnlocked] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Exam state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState<string>("Quantitative Aptitude");

  // Timer
  const [timeLeft, setTimeLeft] = useState<number>(20 * 60); // 20 mins
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Submission & Results
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<TestResult | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    if (typeof window !== "undefined" && !document.getElementById("razorpay-script")) {
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Fetch access status & questions
  useEffect(() => {
    async function loadInitialData() {
      try {
        const qRes = await api.get("/aptitude-test/questions");
        setQuestions(qRes.data.questions || []);

        if (user) {
          const sRes = await api.get("/aptitude-test/status");
          setUnlocked(Boolean(sRes.data.unlocked));
        }
      } catch (err) {
        console.error("Error loading aptitude data:", err);
      } finally {
        setCheckingStatus(false);
      }
    }
    loadInitialData();
  }, [user]);

  // Timer interval effect
  useEffect(() => {
    if (stage === "testing") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            handleFinalSubmit();
            return 0;
          }
          return prev - 1;
        });
        setTimeTaken((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage]);

  // Group questions by section
  const sections = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => set.add(q.section));
    return Array.from(set);
  }, [questions]);

  const activeQuestion = questions[activeQuestionIdx];

  // Answer selection
  const handleSelectOption = (optIdx: number) => {
    if (!activeQuestion) return;
    setAnswers((prev) => ({ ...prev, [activeQuestion.id]: optIdx }));
  };

  const handleToggleReview = () => {
    if (!activeQuestion) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [activeQuestion.id]: !prev[activeQuestion.id],
    }));
  };

  // Payment checkout
  const handleUnlockPayment = async () => {
    if (!user) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("open-auth"));
      }
      return;
    }
    setPaymentLoading(true);

    try {
      const orderRes = await api.post("/aptitude-test/create-order");
      const { orderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "HelpMeMan Competency",
        description: "Unlock Aptitude Practice & Mock Test Series",
        order_id: orderId,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#2563EB",
        },
        handler: async function (response: any) {
          try {
            await api.post("/aptitude-test/verify-payment", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setUnlocked(true);
            setStage("testing");
          } catch (vErr) {
            alert("Payment verification failed. Please contact support.");
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay checkout error:", err);
      alert("Failed to initiate checkout. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Start test
  const handleStartTest = () => {
    setStage("testing");
    setTimeLeft(20 * 60);
    setTimeTaken(0);
    setActiveQuestionIdx(0);
  };

  // Final submission
  const handleFinalSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);

    try {
      const res = await api.post("/aptitude-test/submit", {
        answers,
        timeTakenSeconds: timeTaken,
      });

      setResults(res.data);
      setStage("submitted");
    } catch (err) {
      console.error("Error submitting test:", err);
      alert("Failed to submit test. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  // PDF download handler
  const handleDownloadPDF = () => {
    if (!results) return;
    const pdfData: AptitudePDFData = {
      candidateName: results.candidateName || user?.name || "Candidate",
      candidateEmail: results.candidateEmail || user?.email || "",
      scorePercentage: results.scorePercentage,
      totalCorrect: results.totalCorrect,
      totalQuestions: results.totalQuestions,
      percentile: results.percentile,
      timeTakenSeconds: results.timeTakenSeconds,
      sectionBreakdown: results.sectionBreakdown,
      aiAssessment: results.aiAssessment,
      timestamp: results.timestamp,
    };
    generateAptitudeReportPDF(pdfData);
  };

  // Format timer mins:secs
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="landing-page min-h-screen flex flex-col bg-[#0B0B0C] text-[var(--fg)]">
      <LandingNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* ─────────────────────────────────────────────────────────────────
            1. LANDING & UNLOCK SCREEN
        ───────────────────────────────────────────────────────────────── */}
        {stage === "landing" && (
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center py-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <Award className="w-4 h-4" />
              HelpMeMan Official Aptitude Assessment
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
              Aptitude Practice & <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Mock Test Series</span>
            </h1>

            <p className="text-base md:text-lg text-[var(--muted)] max-w-2xl leading-relaxed mb-8">
              Evaluate your Quantitative Aptitude, Logical Reasoning, and Verbal Ability skills under timed exam conditions. Receive an instant AI scorecard, downloadable PDF certificate, and detailed performance breakdown.
            </p>

            {/* Test Info Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl mb-10">
              <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col items-center">
                <Brain className="w-6 h-6 text-blue-400 mb-2" />
                <span className="text-xs text-[var(--muted)] font-medium">Sections</span>
                <span className="text-sm font-bold text-white mt-0.5">Quant, Logic, Verbal</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col items-center">
                <HelpCircle className="w-6 h-6 text-indigo-400 mb-2" />
                <span className="text-xs text-[var(--muted)] font-medium">Questions</span>
                <span className="text-sm font-bold text-white mt-0.5">{questions.length} Items</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col items-center">
                <Clock className="w-6 h-6 text-purple-400 mb-2" />
                <span className="text-xs text-[var(--muted)] font-medium">Time Limit</span>
                <span className="text-sm font-bold text-white mt-0.5">20 Minutes</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col items-center">
                <FileText className="w-6 h-6 text-emerald-400 mb-2" />
                <span className="text-xs text-[var(--muted)] font-medium">Report</span>
                <span className="text-sm font-bold text-white mt-0.5">Certified PDF + Email</span>
              </div>
            </div>

            {/* Action Card */}
            <div className="w-full max-w-xl p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#18181B] to-[#0F0F11] border border-blue-500/30 shadow-2xl flex flex-col items-center">
              {unlocked ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">Aptitude Test Series Unlocked</h3>
                  <p className="text-xs text-[var(--muted)] mb-6 text-center max-w-sm">
                    You have active access to the complete Aptitude Practice & Mock Test Series. Click below to begin your timed test.
                  </p>
                  <button
                    onClick={handleStartTest}
                    className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Start Aptitude Mock Test</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">Full Test Access Pass</h3>
                  <p className="text-xs text-[var(--muted)] mb-4 text-center max-w-sm">
                    Unlock complete aptitude mock test series with unlimited retakes, AI performance diagnostics, and certified PDF reports.
                  </p>

                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-black text-white">₹299</span>
                    <span className="text-xs text-[var(--muted)] line-through">₹999</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      70% OFF
                    </span>
                  </div>

                  <button
                    onClick={handleUnlockPayment}
                    disabled={paymentLoading || checkingStatus}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {paymentLoading ? (
                      <span>Initiating Checkout...</span>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Unlock Aptitude Test Series (₹299)</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            2. LIVE EXAM RUNNER SCREEN
        ───────────────────────────────────────────────────────────────── */}
        {stage === "testing" && activeQuestion && (
          <div className="flex flex-col gap-6">
            {/* Top Bar: Timer & Section Navigation */}
            <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Section Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
                {sections.map((sec) => {
                  const secQuestions = questions.filter((q) => q.section === sec);
                  const answeredCount = secQuestions.filter((q) => answers[q.id] !== undefined).length;
                  return (
                    <button
                      key={sec}
                      onClick={() => {
                        setActiveSection(sec);
                        const firstIdx = questions.findIndex((q) => q.section === sec);
                        if (firstIdx !== -1) setActiveQuestionIdx(firstIdx);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap flex items-center gap-2 ${
                        activeQuestion.section === sec
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-[var(--muted)] hover:text-white bg-black/40"
                      }`}
                    >
                      <span>{sec}</span>
                      <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-black/30 font-mono">
                        {answeredCount}/{secQuestions.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Timer & Finish Button */}
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-mono font-bold ${
                    timeLeft < 180
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse"
                      : "bg-black/40 border-[#27272A] text-blue-400"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{formatTimer(timeLeft)}</span>
                </div>

                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Submit Exam
                </button>
              </div>
            </div>

            {/* Main Test Layout: Question + Navigation Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Active Question Card */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-[#18181B] border border-[#27272A] flex flex-col justify-between min-h-[420px]">
                <div>
                  {/* Question Header */}
                  <div className="flex items-center justify-between gap-4 pb-4 mb-6 border-b border-[#27272A]">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      Question {activeQuestionIdx + 1} of {questions.length}
                    </span>
                    <button
                      onClick={handleToggleReview}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        markedForReview[activeQuestion.id]
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-black/40 text-[var(--muted)] border border-[#27272A] hover:text-white"
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>{markedForReview[activeQuestion.id] ? "Marked for Review" : "Mark for Review"}</span>
                    </button>
                  </div>

                  {/* Question Text */}
                  <h2 className="text-lg md:text-xl font-bold text-white mb-6 leading-relaxed">
                    {activeQuestion.question}
                  </h2>

                  {/* Options List */}
                  <div className="flex flex-col gap-3">
                    {activeQuestion.options.map((opt, optIdx) => {
                      const isSelected = answers[activeQuestion.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(optIdx)}
                          className={`w-full p-4 rounded-2xl border text-left text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-blue-600/15 border-blue-500 text-white shadow-sm"
                              : "bg-black/30 border-[#27272A] text-[var(--muted)] hover:border-slate-600 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                                isSelected ? "bg-blue-600 text-white" : "bg-[#27272A] text-[var(--muted)]"
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#27272A]">
                  <button
                    onClick={() => setActiveQuestionIdx((prev) => Math.max(0, prev - 1))}
                    disabled={activeQuestionIdx === 0}
                    className="px-4 py-2 rounded-xl bg-black/40 border border-[#27272A] text-xs font-semibold text-white hover:bg-[#27272A] disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={() => setActiveQuestionIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                    disabled={activeQuestionIdx === questions.length - 1}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Question Palette Palette Grid */}
              <div className="p-6 rounded-3xl bg-[#18181B] border border-[#27272A] flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-4">Question Palette</h3>

                  {/* Grid */}
                  <div className="grid grid-cols-5 gap-2 mb-6">
                    {questions.map((q, idx) => {
                      const isAnswered = answers[q.id] !== undefined;
                      const isMarked = markedForReview[q.id];
                      const isActive = activeQuestionIdx === idx;

                      let bgStyle = "bg-black/40 text-[var(--muted)] border-[#27272A]";
                      if (isActive) {
                        bgStyle = "ring-2 ring-blue-500 bg-blue-600 text-white font-bold";
                      } else if (isMarked) {
                        bgStyle = "bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold";
                      } else if (isAnswered) {
                        bgStyle = "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold";
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => setActiveQuestionIdx(idx)}
                          className={`h-10 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-center ${bgStyle}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-col gap-2 pt-4 border-t border-[#27272A] text-xs">
                    <div className="flex items-center gap-2 text-[var(--muted)]">
                      <span className="w-3 h-3 rounded-md bg-emerald-500/20 border border-emerald-500/40" />
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--muted)]">
                      <span className="w-3 h-3 rounded-md bg-amber-500/20 border border-amber-500/40" />
                      <span>Marked for Review</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--muted)]">
                      <span className="w-3 h-3 rounded-md bg-black/40 border border-[#27272A]" />
                      <span>Unanswered</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full py-3 mt-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Submit Test & View Results
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            3. SUBMITTED & RESULTS DASHBOARD
        ───────────────────────────────────────────────────────────────── */}
        {stage === "submitted" && results && (
          <div className="max-w-4xl mx-auto flex flex-col gap-8 py-4">
            {/* Top Score Banner */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#18181B] via-[#121215] to-[#0A0A0C] border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Test Evaluation Complete
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white">
                  Aptitude Performance Scorecard
                </h1>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Candidate: <strong className="text-white">{results.candidateName}</strong> ({results.candidateEmail})
                </p>
              </div>

              {/* Score Gauge */}
              <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-[#27272A] shrink-0">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-blue-400">{results.scorePercentage}%</span>
                  <span className="text-[10px] text-[var(--muted)] font-semibold">OVERALL SCORE</span>
                </div>
                <div className="h-10 w-px bg-[#27272A]" />
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-emerald-400">Top {100 - results.percentile}%</span>
                  <span className="text-[10px] text-[var(--muted)] font-semibold">EST. PERCENTILE</span>
                </div>
              </div>
            </div>

            {/* Actions Bar: PDF & Email */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#18181B] border border-[#27272A]">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <Mail className="w-4 h-4" />
                <span>Detailed scorecard has been emailed to {results.candidateEmail || "your email"}.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Official PDF Report</span>
                </button>
                <button
                  onClick={handleStartTest}
                  className="px-4 py-2.5 rounded-xl bg-black/40 border border-[#27272A] hover:bg-[#27272A] text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
              </div>
            </div>

            {/* AI Diagnostic Breakdown */}
            <div className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Diagnostic & Skill Assessment
              </h3>
              <p className="text-sm text-blue-100 leading-relaxed font-medium">
                {results.aiAssessment}
              </p>
            </div>

            {/* Detailed Question Review List */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white">Question Review & Explanations</h3>

              {results.reviewDetails.map((q, idx) => (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border flex flex-col gap-3 ${
                    q.isCorrect
                      ? "bg-[#18181B] border-emerald-500/30"
                      : "bg-[#18181B] border-rose-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-[var(--muted)]">
                      Question {idx + 1} · {q.section}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase border ${
                        q.isCorrect
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {q.isCorrect ? "Correct (+1)" : "Incorrect (0)"}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-white">{q.question}</p>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const isCandidateChoice = q.selectedOption === oIdx;
                      const isCorrectAnswer = q.correctIndex === oIdx;

                      let style = "bg-black/30 text-[var(--muted)] border-[#27272A]";
                      if (isCorrectAnswer) {
                        style = "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold";
                      } else if (isCandidateChoice && !isCorrectAnswer) {
                        style = "bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold";
                      }

                      return (
                        <div key={oIdx} className={`p-2.5 rounded-xl border flex items-center justify-between ${style}`}>
                          <span>{opt}</span>
                          {isCorrectAnswer && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="mt-2 p-3 rounded-xl bg-black/40 text-xs text-[var(--muted)] leading-relaxed">
                    <strong className="text-white block mb-1">Explanation:</strong>
                    {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="p-6 rounded-3xl bg-[#18181B] border border-[#27272A] max-w-md w-full flex flex-col gap-4 text-center">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Submit Aptitude Exam?</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              You have answered {Object.keys(answers).length} of {questions.length} questions. Are you sure you want to submit your exam now?
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-black/40 border border-[#27272A] text-xs font-semibold text-white hover:bg-[#27272A] cursor-pointer"
              >
                Continue Exam
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Evaluating..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      <FooterSection />
    </div>
  );
}
