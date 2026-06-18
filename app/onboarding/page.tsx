"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  Clock3,
  Loader2,
  Send,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type QuestionType = "text" | "single_choice" | "multi_choice";
type Answer = { id: string; question: string; answer: string; skipped: boolean; questionKey?: string };
type Question = {
  key: string;
  phase: string;
  type?: QuestionType;
  text: string;
  prompt?: string;
  placeholder?: string;
  options?: string[];
};
type Profile = { preferredName?: string; bio?: string; expertiseTags?: string[]; summary?: string };
type State = {
  role: "MENTOR" | "MENTEE" | null;
  status: "NOT_STARTED" | "IN_PROGRESS" | "PROCESSING" | "COMPLETED";
  currentQuestion: number;
  totalQuestions: number;
  question: Question | null;
  answers: Answer[];
  profile?: Profile;
  mentor?: { id: string; approvalStatus: string; isActive: boolean } | null;
  message?: string;
};

type Stage = "role" | "name" | "preparing" | "tour" | "chat";

const DEMO_QUESTIONS: Question[] = [
  { key: "full_name", phase: "Identity", type: "text", text: "Let's begin with your name.", prompt: "What's your full name?", placeholder: "Enter your name" },
  { key: "preferred_name", phase: "Identity", type: "text", text: "What should mentees call you?", placeholder: "Example: Rahul, Dr. Mehta, Priya" },
  { key: "role_type", phase: "Identity", type: "single_choice", text: "Which best describes your current work?", options: ["Founder", "Product leader", "Engineer", "Designer", "Marketer", "Operator", "Investor", "Other"] },
  { key: "role_company", phase: "Identity", type: "text", text: "Where are you doing your work right now?", placeholder: "Example: Senior PM at Razorpay" },
  { key: "location", phase: "Identity", type: "text", text: "Where are you based?", placeholder: "City, country, or remote" },
  { key: "skills", phase: "Expertise", type: "multi_choice", text: "Pick the skills you feel strongest in.", options: ["Product strategy", "Software engineering", "AI/ML", "Growth", "Fundraising", "Leadership", "Design", "Career growth"] },
  { key: "topics", phase: "Expertise", type: "text", text: "What topics can you mentor people in?", placeholder: "Add a few topics, separated by commas" },
  { key: "experience", phase: "Expertise", type: "single_choice", text: "How many years of experience do you have?", options: ["1-3 years", "4-6 years", "7-10 years", "10+ years", "15+ years"] },
  { key: "industries", phase: "Expertise", type: "multi_choice", text: "Which industries have shaped your experience?", options: ["SaaS", "Fintech", "AI", "Consumer", "Healthcare", "Education", "E-commerce", "Enterprise"] },
  { key: "focus", phase: "Expertise", type: "text", text: "What are you currently focused on?", placeholder: "A product, goal, learning curve, or mission" },
  { key: "journey", phase: "Background", type: "text", text: "Tell me the short version of your career journey.", placeholder: "A few lines is perfect" },
  { key: "achievement", phase: "Background", type: "text", text: "What's an achievement you're proud of?", placeholder: "Something that still feels meaningful" },
  { key: "leadership_projects", phase: "Background", type: "single_choice", text: "Have you founded a startup, led a team, or owned a major project?", options: ["Founded a startup", "Led a team", "Owned a major project", "Not yet", "A mix of these"] },
  { key: "why_mentor", phase: "Mentoring style", type: "text", text: "Why do you mentor?", placeholder: "What makes it worth your time?" },
  { key: "mentoring_style", phase: "Mentoring style", type: "multi_choice", text: "How do you usually help people?", options: ["Direct feedback", "Hands-on problem solving", "Strategy sessions", "Accountability", "Career clarity", "Network introductions"] },
  { key: "preferred_mentees", phase: "Mentoring style", type: "single_choice", text: "What type of mentees do you enjoy working with most?", options: ["Early-career professionals", "Founders", "Students", "Career switchers", "Senior leaders", "Builders with an idea"] },
  { key: "personal", phase: "Personal", type: "text", text: "Last one: what motivates you, inspires you, or keeps you curious outside work?", placeholder: "Books, creators, leaders, hobbies, long-term goals" },
];

const PHASES = ["Identity", "Expertise", "Background", "Mentoring style", "Personal"];

function RuthMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8", md: "h-11 w-11", lg: "h-16 w-16" };
  return (
    <div className={`${sizes[size]} relative shrink-0 rounded-2xl bg-fg text-bg shadow-[0_22px_70px_rgba(10,10,10,.16)]`}>
      <div className="absolute inset-[-14px] -z-10 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,.26),transparent_62%)] blur-xl" />
      <div className="flex h-full w-full items-center justify-center rounded-2xl">
        <Sparkles className={size === "lg" ? "h-7 w-7" : "h-5 w-5"} />
      </div>
    </div>
  );
}

function Aura() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-20 h-[520px] w-[320px] -translate-x-1/2 rotate-12 rounded-[90px] bg-[linear-gradient(90deg,transparent,rgba(91,216,255,.28),rgba(190,255,120,.22),transparent)] blur-2xl" />
      <div className="absolute -bottom-24 left-[-80px] h-72 w-72 rounded-full bg-[rgba(190,255,120,.22)] blur-3xl" />
      <div className="absolute -bottom-20 right-[-70px] h-72 w-72 rounded-full bg-[rgba(91,216,255,.20)] blur-3xl" />
    </div>
  );
}

function initialState(): State {
  return {
    role: "MENTOR",
    status: "IN_PROGRESS",
    currentQuestion: 0,
    totalQuestions: DEMO_QUESTIONS.length,
    question: DEMO_QUESTIONS[0],
    answers: [],
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading, updateUser } = useAuth();
  const [state, setState] = useState<State | null>(null);
  const [stage, setStage] = useState<Stage>("role");
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [tourStep, setTourStep] = useState(0);
  const [latestRuthMessage, setLatestRuthMessage] = useState("Hi, I'm Ruth. I'll set up your mentor memory in a few focused questions.");
  const [streamedRuthMessage, setStreamedRuthMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const question = state?.question;
  const questionType = question?.type || "text";
  const isDemo = Boolean(user?.id?.startsWith("demo_"));
  const completed = state?.status === "COMPLETED";
  const progress = state ? Math.round((state.currentQuestion / state.totalQuestions) * 100) : 0;
  const firstName = useMemo(() => {
    const savedName = state?.answers.find(answer => answer.questionKey === "full_name" || answer.question.toLowerCase().includes("name"))?.answer;
    return (savedName || user?.name || "there").split(" ")[0];
  }, [state?.answers, user?.name]);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
    if (!user) return;

    if (user.id.startsWith("demo_")) {
      if (user.role === "MENTOR") {
        const next = initialState();
        setState(next);
        setStage("name");
      }
      return;
    }

    api.get<State>("/onboarding/status")
      .then(({ data }) => {
        if (data.role === "MENTEE") return router.replace("/dashboard");
        if (data.status === "COMPLETED") return router.replace("/mentor");
        setState(data);
        if (!data.role) setStage("role");
        else if (data.currentQuestion === 0 && data.answers.length === 0) setStage("name");
        else setStage("chat");
        if (data.question) setLatestRuthMessage(data.message || data.question.text);
      })
      .catch(() => setError("Ruth couldn't load your conversation. Please try again."));
  }, [user, loading, router]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [state?.answers.length, sending, latestRuthMessage]);

  useEffect(() => {
    setSelected([]);
    setInput("");
  }, [question?.key]);

  useEffect(() => {
    if (stage !== "chat") {
      setStreamedRuthMessage(latestRuthMessage);
      return;
    }

    setStreamedRuthMessage("");
    let index = 0;
    const interval = window.setInterval(() => {
      index += 2;
      setStreamedRuthMessage(latestRuthMessage.slice(0, index));
      if (index >= latestRuthMessage.length) window.clearInterval(interval);
    }, 16);

    return () => window.clearInterval(interval);
  }, [latestRuthMessage, stage]);

  async function chooseRole(role: "MENTOR" | "MENTEE") {
    if (!user) return;
    setSending(true);
    setError("");
    try {
      if (isDemo) {
        if (role === "MENTEE") return router.replace("/dashboard");
        updateUser({ role: "MENTOR" });
        setState(initialState());
        setStage("name");
        return;
      }

      const { data } = await api.post<State>("/onboarding/role", { role });
      if (role === "MENTEE") return router.replace("/dashboard");
      updateUser({ role: "MENTOR" });
      setState(data);
      setStage("name");
    } catch {
      setError("Couldn't save that choice. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function nextDemoQuestion(current: State, answerText: string, skip: boolean): State {
    const answer: Answer = {
      id: crypto.randomUUID(),
      question: current.question?.text || "",
      questionKey: current.question?.key,
      answer: skip ? "Skipped" : answerText,
      skipped: skip,
    };
    const answers = [...current.answers, answer];
    const nextIndex = current.currentQuestion + 1;
    let nextQuestion = DEMO_QUESTIONS[nextIndex] || null;

    if (nextQuestion?.key === "role_company") {
      const roleType = answers.find(a => a.questionKey === "role_type")?.answer;
      if (roleType && roleType !== "Other") {
        nextQuestion = { ...nextQuestion, text: `${answers[0]?.answer?.split(" ")[0] || "Nice"}, where are you doing your ${roleType.toLowerCase()} work right now?` };
      }
    }
    if (nextQuestion?.key === "topics") {
      const skills = answers.find(a => a.questionKey === "skills")?.answer;
      if (skills) nextQuestion = { ...nextQuestion, text: `Nice — ${skills} gives me a signal. What specific topics can you mentor people in?` };
    }

    return {
      ...current,
      answers,
      currentQuestion: nextIndex,
      question: nextQuestion,
      status: nextIndex >= current.totalQuestions ? "COMPLETED" : "IN_PROGRESS",
      profile: nextIndex >= current.totalQuestions ? { preferredName: answers[1]?.answer || firstName, expertiseTags: ["Product", "AI", "Leadership"], summary: "Ruth created your mentor profile and memory from the onboarding conversation." } : current.profile,
    };
  }

  async function submitAnswer(answerText: string, skip = false) {
    if (!state?.question || sending || (!skip && !answerText.trim())) return;
    const value = answerText.trim();
    setSending(true);
    setError("");

    try {
      if (isDemo) {
        const next = nextDemoQuestion(state, value, skip);
        const demoName = next.answers.find(answer => answer.questionKey === "preferred_name")?.answer || next.answers.find(answer => answer.questionKey === "full_name")?.answer?.split(" ")[0] || firstName;
        setState(next);
        setLatestRuthMessage(next.status === "COMPLETED" ? "That's everything I need. Your mentor profile is ready." : `Got it, ${demoName}. ${next.question?.text || ""}`);
        return next;
      }

      const { data } = await api.post<State>("/onboarding/answer", { answer: value, skip });
      setState(data);
      setLatestRuthMessage(data.message || data.question?.text || "Tell me more.");
      if (data.status === "COMPLETED" && data.mentor) localStorage.setItem("helpmeman.mentor", JSON.stringify(data.mentor));
      return data;
    } catch {
      setError("That didn't save. Your answer is still here — try once more.");
    } finally {
      setSending(false);
    }
  }

  async function submitName(e: FormEvent) {
    e.preventDefault();
    const saved = await submitAnswer(input);
    if (!saved) return;
    setInput("");
    setStage("preparing");
    window.setTimeout(() => setStage("chat"), 1200);
  }

  function submitCurrent(e?: FormEvent, skip = false) {
    e?.preventDefault();
    const answerText = questionType === "text" ? input : selected.join(", ");
    submitAnswer(answerText, skip).then(() => {
      setInput("");
      setSelected([]);
    });
  }

  function toggleChoice(option: string) {
    if (questionType === "single_choice") {
      setSelected([option]);
      return;
    }
    setSelected(current => current.includes(option) ? current.filter(item => item !== option) : [...current, option]);
  }

  if (loading || !user || (!state && !error && stage !== "role")) {
    return <div className="min-h-screen bg-bg" />;
  }

  if (completed && state) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-5 text-fg">
        <Aura />
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-fg text-bg"><Check className="h-7 w-7" /></div>
          <p className="mt-7 text-xs font-semibold uppercase tracking-[.25em] text-muted">Mentor memory created</p>
          <h1 className="mt-4 font-display text-5xl tracking-[-.05em] sm:text-6xl">You're ready, {state.profile?.preferredName || firstName}.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted">{state.profile?.summary || "Ruth turned your answers into a profile, expertise tags, and a memory layer for your mentor experience."}</p>
          <div className="mx-auto mt-7 flex max-w-lg flex-wrap justify-center gap-2">
            {state.profile?.expertiseTags?.map(tag => (
              <span key={tag} className="rounded-full border border-hairline bg-fg/[.03] px-3 py-1.5 text-xs">{tag}</span>
            ))}
          </div>
          <button onClick={() => router.replace("/mentor")} className="mt-9 inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3 text-sm font-semibold text-bg transition hover:scale-[1.02]">
            Enter mentor workspace <ArrowRight className="h-4 w-4" />
          </button>
        </motion.section>
      </main>
    );
  }

  if (stage === "role" || !state?.role) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-5 text-fg">
        <Aura />
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-3xl">
          <div className="mb-10 text-center">
            <RuthMark size="lg" />
            <p className="mt-7 text-xs font-semibold uppercase tracking-[.24em] text-muted">Before Ruth starts</p>
            <h1 className="mt-3 font-display text-5xl tracking-[-.05em] sm:text-6xl">How will you use HelpMeMan?</h1>
            <p className="mx-auto mt-4 max-w-lg text-muted">We'll shape the experience around what you're here to do. Mentors get the AI onboarding flow.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { role: "MENTOR" as const, icon: BriefcaseBusiness, title: "Continue as a mentor", text: "Build a mentor profile Ruth can personalize deeply." },
              { role: "MENTEE" as const, icon: UsersRound, title: "Continue as a mentee", text: "Find the right guide for your next meaningful step." },
            ].map(({ role, icon: Icon, title, text }) => (
              <button key={role} onClick={() => chooseRole(role)} disabled={sending} className="group rounded-[32px] border border-hairline bg-bg/80 p-7 text-left shadow-[0_24px_80px_rgba(0,0,0,.08)] backdrop-blur transition hover:-translate-y-1 hover:border-fg/35">
                <span className="mb-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-fg text-bg"><Icon className="h-5 w-5" /></span>
                <span className="flex items-center justify-between gap-4">
                  <span><strong className="block text-lg">{title}</strong><span className="mt-2 block text-sm leading-6 text-muted">{text}</span></span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            ))}
          </div>
          {error && <p className="mt-5 text-center text-sm text-red-500">{error}</p>}
        </motion.section>
      </main>
    );
  }

  if (stage === "name") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-5 text-fg">
        <Aura />
        <motion.form onSubmit={submitName} initial={{ opacity: 0, scale: .96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative w-full max-w-[640px] rounded-[30px] border border-hairline bg-bg/85 p-8 text-center shadow-[0_30px_120px_rgba(0,0,0,.12)] backdrop-blur-xl sm:p-12">
          <div className="mx-auto mb-8 flex justify-center"><RuthMark size="lg" /></div>
          <p className="text-xs font-semibold uppercase tracking-[.24em] text-muted">Ruth AI onboarding</p>
          <h1 className="mt-4 text-4xl tracking-[-.05em] sm:text-5xl">Tell us your name</h1>
          <p className="mt-3 text-sm text-muted">Ruth will use this to make the onboarding feel human from the first message.</p>
          <input
            autoFocus
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder={question?.placeholder || "Enter your name"}
            className="mt-10 w-full bg-transparent text-center text-5xl font-semibold tracking-[-.05em] text-fg outline-none placeholder:text-fg/25 sm:text-6xl"
          />
          <button disabled={!input.trim() || sending} className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-fg px-6 py-4 text-sm font-semibold text-bg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-35">
            Continue <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-5 text-xs text-muted">Tip: this becomes the first saved mentor onboarding answer.</p>
        </motion.form>
      </main>
    );
  }

  if (stage === "preparing") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg text-fg">
        <Aura />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative text-center">
          <motion.div animate={{ rotate: 360, scale: [1, 1.08, 1] }} transition={{ rotate: { repeat: Infinity, duration: 4, ease: "linear" }, scale: { repeat: Infinity, duration: 1.4 } }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-fg text-bg shadow-[0_30px_100px_rgba(0,0,0,.18)]">
            <Sparkles className="h-9 w-9" />
          </motion.div>
          <p className="mt-72 text-lg">Ruth AI is preparing your mentor onboarding...</p>
        </motion.div>
      </main>
    );
  }

  if (stage === "tour") {
    const steps = [
      { title: "Ask Ruth anything", body: "You can ask for clarification while onboarding. Ruth keeps things short and remembers what you say." },
      { title: "Answer your way", body: "Some questions are typed. Some are choices. The next question adapts from your previous answers." },
      { title: "Your mentor memory", body: "Every answer becomes profile data and mentor memory for matching, dashboard suggestions, and AI conversations." },
    ];
    return (
      <main className="relative min-h-screen overflow-hidden bg-bg text-fg">
        <Aura />
        <div className="mx-auto max-w-5xl px-6 pt-20">
          <h1 className="text-3xl font-semibold tracking-[-.04em]">Hello {firstName}, I am Ruth your AI onboarding agent!</h1>
          <p className="mt-3 text-lg text-muted">Let's set up your mentor profile. You can also ask me any questions.</p>
          <div className="mt-10 rounded-[28px] border border-hairline bg-bg/90 p-8 shadow-[0_22px_90px_rgba(0,0,0,.08)]">
            <p className="font-semibold">Please select where your mentorship is strongest right now.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {["Career clarity", "Startup advice", "Product strategy", "Technical guidance", "Leadership", "Portfolio reviews"].map(item => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-hairline px-4 py-3 text-muted">
                  <span className="h-5 w-5 rounded-md border border-hairline" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-fg/55" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-32 left-1/2 w-[min(92vw,410px)] -translate-x-1/2 rounded-[22px] bg-bg p-5 text-fg shadow-[0_24px_90px_rgba(0,0,0,.24)]">
          <span className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 bg-bg" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{steps[tourStep].title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{steps[tourStep].body}</p>
              </div>
              <button onClick={() => setStage("chat")} className="rounded-full p-1 text-muted hover:text-fg"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <button onClick={() => setStage("chat")} className="rounded-xl border border-hairline px-4 py-2 text-sm">Skip</button>
              <span className="text-sm font-semibold">{tourStep + 1} / {steps.length}</span>
              <button onClick={() => tourStep === steps.length - 1 ? setStage("chat") : setTourStep(step => step + 1)} className="rounded-xl bg-fg px-4 py-2 text-sm font-semibold text-bg">
                {tourStep === steps.length - 1 ? "Start" : "Next"}
              </button>
            </div>
          </div>
        </motion.div>
        <div className="absolute bottom-5 left-1/2 w-[min(92vw,960px)] -translate-x-1/2 rounded-[24px] border border-hairline bg-bg p-4 shadow-[0_16px_60px_rgba(0,0,0,.14)]">
          <div className="min-h-24 text-muted">Can I save and continue later? <span className="rounded-md bg-fg/5 px-2 py-1 text-xs">Tab</span></div>
          <div className="flex items-center justify-between">
            <span className="text-sm">+ Add context</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fg text-bg"><Send className="h-4 w-4" /></span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex h-screen overflow-hidden bg-bg px-3 py-3 text-fg sm:px-6 sm:py-6">
      <Aura />
      <section className="relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-hairline bg-bg/88 shadow-[0_28px_120px_rgba(0,0,0,.12)] backdrop-blur-xl">
        <header className="flex shrink-0 items-center justify-between border-b border-hairline px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <RuthMark size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Ruth AI onboarding</p>
              <p className="truncate text-xs text-muted">Question {Math.min((state?.currentQuestion || 0) + 1, state?.totalQuestions || 1)} of {state?.totalQuestions} · {question?.phase}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-fg/10 sm:block">
              <motion.div animate={{ width: `${progress}%` }} className="h-full rounded-full bg-fg" />
            </div>
            <button onClick={() => router.replace("/mentor/status")} className="flex items-center gap-2 rounded-full border border-hairline px-3 py-2 text-xs text-muted hover:text-fg">
              <Clock3 className="h-3.5 w-3.5" /> Later
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="pointer-events-none sticky top-0 z-10 -mx-6 -mt-6 h-10 bg-gradient-to-b from-bg to-transparent" />
          <div className="mx-auto max-w-3xl space-y-6 pb-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
              <RuthMark size="sm" />
              <div className="rounded-[6px_22px_22px_22px] border border-hairline bg-bg px-5 py-4 text-sm leading-7 shadow-[0_12px_45px_rgba(0,0,0,.05)]">
                Hi {firstName}, I’m Ruth. I’ll ask one thing at a time, remember every answer, and shape your mentor profile as we go.
              </div>
            </motion.div>

            {state?.answers.map((answer, index) => (
              <motion.div
                key={answer.id || `${answer.questionKey}-${index}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: index < Math.max(0, state.answers.length - 3) ? 0.58 : 1, y: 0 }}
                transition={{ duration: 0.28 }}
                className="space-y-3"
              >
                <div className="flex items-start gap-3">
                  <RuthMark size="sm" />
                  <div className="max-w-[78%] rounded-[6px_22px_22px_22px] border border-hairline bg-bg px-5 py-4 text-sm leading-7 shadow-[0_12px_45px_rgba(0,0,0,.05)]">
                    {answer.question}
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[78%] rounded-[22px_6px_22px_22px] bg-fg px-5 py-3 text-sm leading-6 text-bg shadow-lg">
                    {answer.skipped ? <span className="opacity-70">Skipped</span> : answer.answer}
                  </div>
                </div>
              </motion.div>
            ))}

            {question && !sending && (
              <motion.div key={question.key} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                <RuthMark size="sm" />
                <div className="max-w-[78%] rounded-[6px_22px_22px_22px] border border-hairline bg-bg px-5 py-4 text-sm leading-7 shadow-[0_12px_45px_rgba(0,0,0,.05)]">
                  <span>{streamedRuthMessage || latestRuthMessage}</span>
                  {streamedRuthMessage.length < latestRuthMessage.length && <span className="ml-1 inline-block h-4 w-1 translate-y-0.5 animate-pulse rounded-full bg-fg" />}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {sending && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                  <RuthMark size="sm" />
                  <div className="flex items-center gap-2 rounded-full border border-hairline bg-bg px-5 py-3 text-sm text-muted">
                    <Loader2 className="h-4 w-4 animate-spin" /> Ruth is preparing the next question
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="shrink-0 border-t border-hairline bg-bg/92 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="mx-auto max-w-3xl">
            {questionType === "text" ? (
              <form onSubmit={event => submitCurrent(event)} className="rounded-[24px] border border-hairline bg-bg p-3 shadow-[0_14px_55px_rgba(0,0,0,.08)] focus-within:border-fg/40">
                <textarea
                  autoFocus
                  rows={2}
                  value={input}
                  onChange={event => setInput(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      submitCurrent();
                    }
                  }}
                  placeholder={question?.placeholder || "Type your answer..."}
                  className="max-h-28 min-h-12 w-full resize-none bg-transparent px-1 text-sm outline-none placeholder:text-muted"
                />
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => submitCurrent(undefined, true)} disabled={sending} className="px-1 text-xs text-muted hover:text-fg">Skip</button>
                  <button disabled={!input.trim() || sending} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-fg text-bg disabled:opacity-25"><Send className="h-4 w-4" /></button>
                </div>
              </form>
            ) : (
              <div className="rounded-[24px] border border-hairline bg-bg p-3 shadow-[0_14px_55px_rgba(0,0,0,.08)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-muted">{questionType === "single_choice" ? "Choose one answer" : "Choose all that apply"}</span>
                  <button onClick={() => submitCurrent(undefined, true)} disabled={sending} className="text-xs text-muted hover:text-fg">Skip</button>
                </div>
                <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto pr-1">
                  {question?.options?.map(option => {
                    const active = selected.includes(option);
                    return (
                      <button key={option} type="button" onClick={() => toggleChoice(option)} className={`rounded-full border px-4 py-2 text-sm transition ${active ? "border-fg bg-fg text-bg" : "border-hairline bg-fg/[.025] text-fg hover:border-fg/40"}`}>
                        {option}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => submitCurrent()} disabled={!selected.length || sending} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-fg px-4 py-3 text-sm font-semibold text-bg disabled:opacity-30">
                  Confirm <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
            {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
