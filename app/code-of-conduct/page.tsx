"use client";

import Link from "next/link";
import { FooterSection } from "@/components/landing/FooterSection";
import { ShieldCheck, HeartHandshake, BookOpenCheck, AlertTriangle, Lock, UserCheck, PhoneOff, Award, FileText, CheckCircle2 } from "lucide-react";

export default function CodeOfConductPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0A0A0B] text-gray-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#0A0A0B]/80 border-b border-gray-200/80 dark:border-zinc-800/80">
        <nav className="mx-auto flex max-w-[1100px] items-center justify-between px-6 sm:px-10 py-4">
          <Link href="/" className="font-bold text-xl tracking-tight text-[var(--fg)] flex items-center gap-2 select-none">
            <img src="/logo.svg" alt="HelpMeMan Logo" className="w-7 h-7 object-contain" />
            <span>HelpMeMan</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            ← Back to home
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-[900px] px-6 sm:px-10 pt-28 pb-20 w-full">
        {/* Hero Header */}
        <div className="flex flex-col gap-3 mb-10 pb-8 border-b border-gray-200/80 dark:border-zinc-800/80">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-full w-fit uppercase tracking-wider border border-blue-200 dark:border-blue-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            Community Standards & Safety
          </div>
          <h1 className="font-bold text-3xl sm:text-4xl text-[var(--fg)] tracking-tight">
            HelpMeMan Mentor Code of Conduct
          </h1>
          <p className="text-sm text-[var(--muted)] leading-relaxed max-w-2xl mt-1">
            At HelpMeMan, mentors play a critical role in helping students make informed decisions, build confidence, and navigate their academic and career journeys. This Code of Conduct establishes the standards expected from every mentor on the platform.
          </p>
          <p className="text-xs text-[var(--muted)] font-medium">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Introduction Callout */}
        <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 mb-10">
          <div className="flex items-start gap-3.5">
            <HeartHandshake className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-base text-[var(--fg)] mb-1">
                Student-First Commitment
              </h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                By joining HelpMeMan as a mentor, you agree to follow this Code of Conduct and maintain a professional, respectful, and student-first environment. Mentorship is a position of trust.
              </p>
            </div>
          </div>
        </div>

        {/* 13 Rules Sections */}
        <div className="space-y-10">
          
          {/* Section 1 */}
          <section className="bg-white dark:bg-[#121214] p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
              <h2 className="text-xl font-bold text-[var(--fg)]">Professionalism & Respect</h2>
            </div>
            <p className="text-sm text-[var(--muted)] mb-3">Mentors must:</p>
            <ul className="space-y-2 text-sm text-[var(--fg)]/90 pl-1">
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Treat every student with respect, patience, fairness, and professionalism.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Communicate clearly, honestly, and respectfully.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Respect differences in background, abilities, opinions, and career goals.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Avoid insulting, humiliating, threatening, mocking, or intimidating students.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Maintain appropriate professional boundaries at all times.</span>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 text-xs font-semibold text-red-600 dark:text-red-400">
              Discrimination, harassment, bullying, or abusive behaviour of any kind will not be tolerated.
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white dark:bg-[#121214] p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-sm">2</span>
              <h2 className="text-xl font-bold text-[var(--fg)]">Student-First Guidance</h2>
            </div>
            <p className="text-sm text-[var(--muted)] mb-3">
              Mentors should provide guidance based on the student's individual situation, goals, and interests rather than imposing personal preferences.
            </p>
            <p className="text-sm text-[var(--muted)] mb-2 font-medium">Mentors must:</p>
            <ul className="space-y-2 text-sm text-[var(--fg)]/90 pl-1 mb-4">
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Encourage students to make their own informed decisions.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Present multiple reasonable options where appropriate.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Clearly distinguish personal opinions from facts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Avoid guaranteeing specific academic, career, or financial outcomes.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Encourage students to verify important information through reliable official sources where appropriate.</span>
              </li>
            </ul>
            <div className="p-3 bg-gray-50 dark:bg-zinc-900/60 rounded-xl text-xs font-semibold text-[var(--fg)] border border-gray-200/50 dark:border-zinc-800">
              A mentor's role is to guide and empower, not to make decisions on behalf of the student.
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white dark:bg-[#121214] p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-sm">3</span>
              <h2 className="text-xl font-bold text-[var(--fg)]">Accuracy & Transparency</h2>
            </div>
            <p className="text-sm text-[var(--muted)] mb-3">
              Mentors are expected to provide information that is accurate to the best of their knowledge.
            </p>
            <p className="text-sm text-[var(--muted)] mb-2 font-medium">Mentors must not:</p>
            <ul className="space-y-2 text-sm text-[var(--fg)]/90 pl-1 mb-4">
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 mt-1">•</span>
                <span>Falsify qualifications, achievements, experience, or professional background.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 mt-1">•</span>
                <span>Misrepresent their association with companies, institutions, or organisations.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 mt-1">•</span>
                <span>Deliberately provide misleading information.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 mt-1">•</span>
                <span>Claim expertise in areas in which they have no reasonable knowledge or experience.</span>
              </li>
            </ul>
            <p className="text-xs text-[var(--muted)] italic">
              If a mentor does not know the answer to a question, they should acknowledge it rather than provide potentially misleading information.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-white dark:bg-[#121214] p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-sm">4</span>
              <h2 className="text-xl font-bold text-[var(--fg)]">Appropriate Boundaries</h2>
            </div>
            <p className="text-sm text-[var(--muted)] mb-3">
              Mentor-student interactions must remain professional and relevant to the purpose of mentorship.
            </p>
            <p className="text-sm text-[var(--muted)] mb-2 font-medium">Mentors must not:</p>
            <ul className="space-y-2 text-sm text-[var(--fg)]/90 pl-1 mb-4">
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 mt-1">•</span>
                <span>Engage in inappropriate, sexual, romantic, or exploitative interactions with students.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 mt-1">•</span>
                <span>Request unnecessary personal information.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 mt-1">•</span>
                <span>Pressure students into personal relationships or meetings.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 mt-1">•</span>
                <span>Use mentorship as a means to recruit, manipulate, or exploit students.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 mt-1">•</span>
                <span>Make students feel obligated to continue interacting with them.</span>
              </li>
            </ul>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-300 font-medium">
              Where a student is a minor, mentors must exercise additional care and maintain particularly strict professional boundaries.
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-white dark:bg-[#121214] p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-sm">5</span>
              <h2 className="text-xl font-bold text-[var(--fg)]">Privacy & Confidentiality</h2>
            </div>
            <p className="text-sm text-[var(--muted)] mb-3">
              Mentors may receive personal, academic, or career-related information from students.
            </p>
            <p className="text-sm text-[var(--muted)] mb-2 font-medium">Mentors must:</p>
            <ul className="space-y-2 text-sm text-[var(--fg)]/90 pl-1 mb-4">
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Keep student information confidential.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Use information shared during mentorship only for legitimate mentoring purposes.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Not share screenshots, conversations, personal details, or other student information publicly without appropriate permission.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Avoid requesting sensitive information that is unnecessary for providing guidance.</span>
              </li>
            </ul>
            <p className="text-xs text-[var(--muted)]">
              If a mentor believes a student's safety may be at serious risk, they should report the concern to HelpMeMan rather than attempting to handle the situation independently.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-white dark:bg-[#121214] p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-sm">6</span>
              <h2 className="text-xl font-bold text-[var(--fg)]">No Exploitation or Unauthorised Promotion</h2>
            </div>
            <p className="text-sm text-[var(--muted)] mb-3">Mentors must not use access to students to:</p>
            <ul className="space-y-2 text-sm text-[var(--fg)]/90 pl-1 mb-4">
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 mt-1">•</span>
                <span>Promote unrelated businesses, products, services, or personal ventures without approval.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 mt-1">•</span>
                <span>Solicit money, investments, or donations.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 mt-1">•</span>
                <span>Recruit students into potentially exploitative schemes.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 mt-1">•</span>
                <span>Obtain personal benefits unrelated to the agreed mentorship.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 mt-1">•</span>
                <span>Spam students with promotional or referral content.</span>
              </li>
            </ul>
            <p className="text-xs text-[var(--muted)]">
              Any paid service, course, coaching programme, or external opportunity promoted to students must be disclosed transparently and must not be presented as an official HelpMeMan offering unless authorised by HelpMeMan.
            </p>
          </section>

          {/* Section 7 */}
          <section className="bg-white dark:bg-[#121214] p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-sm">7</span>
              <h2 className="text-xl font-bold text-[var(--fg)]">Communication & Availability</h2>
            </div>
            <p className="text-sm text-[var(--muted)] mb-3">
              Mentors should make reasonable efforts to honour their stated availability and commitments.
            </p>
            <p className="text-sm text-[var(--muted)] mb-2 font-medium">Mentors should:</p>
            <ul className="space-y-2 text-sm text-[var(--fg)]/90 pl-1 mb-4">
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Respond within a reasonable timeframe where a response is expected.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Inform students when they are unavailable for an extended period.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Avoid repeatedly cancelling or abandoning scheduled mentorship interactions.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Communicate any changes in availability honestly.</span>
              </li>
            </ul>
            <p className="text-xs text-[var(--muted)] italic">
              Mentors should not promise a level of availability they cannot realistically maintain.
            </p>
          </section>

          {/* Section 8 */}
          <section className="bg-white dark:bg-[#121214] p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-sm">8</span>
              <h2 className="text-xl font-bold text-[var(--fg)]">Conflicts of Interest</h2>
            </div>
            <p className="text-sm text-[var(--muted)] mb-3">
              Mentors must disclose any situation where their personal, professional, or financial interests could influence their advice.
            </p>
            <p className="text-sm text-[var(--muted)] mb-2 font-medium">For example, mentors should clearly disclose if recommending:</p>
            <ul className="space-y-2 text-sm text-[var(--fg)]/90 pl-1 mb-4">
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>Their own business or service.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>A company or institution with which they have a financial relationship.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-500 mt-1">•</span>
                <span>A paid course, coaching service, or referral programme from which they may benefit.</span>
              </li>
            </ul>
            <div className="p-3 bg-gray-50 dark:bg-zinc-900/60 rounded-xl text-xs font-semibold text-[var(--fg)]">
              Students must never be pressured to accept such recommendations.
            </div>
          </section>

          {/* Section 9 */}
          <section className="bg-white dark:bg-[#121214] p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-sm">9</span>
              <h2 className="text-xl font-bold text-[var(--fg)]">External Communication</h2>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-3">
              Mentors should preferably use HelpMeMan's designated communication channels wherever available. If communication outside the platform is permitted, mentors must continue to follow this Code of Conduct and maintain appropriate professional boundaries.
            </p>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400">
              Moving a conversation outside HelpMeMan must not be used to bypass platform policies, fees, safety measures, or reporting mechanisms.
            </div>
          </section>

          {/* Section 10 */}
          <section className="bg-red-500/5 dark:bg-red-950/20 p-6 sm:p-8 rounded-2xl border border-red-500/20 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400">10. Prohibited Conduct</h2>
            </div>
            <p className="text-sm text-[var(--muted)] mb-3 font-medium">
              The following may result in immediate review, suspension, or termination:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[var(--fg)]">
              <li className="flex items-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-zinc-900/60 border border-red-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span>Harassment, bullying, or discrimination</span>
              </li>
              <li className="flex items-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-zinc-900/60 border border-red-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span>Sexual or romantic behaviour toward students</span>
              </li>
              <li className="flex items-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-zinc-900/60 border border-red-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span>Threats, intimidation, or abusive communication</span>
              </li>
              <li className="flex items-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-zinc-900/60 border border-red-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span>Fraud, deception, or impersonation</span>
              </li>
              <li className="flex items-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-zinc-900/60 border border-red-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span>Misrepresentation of qualifications or experience</span>
              </li>
              <li className="flex items-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-zinc-900/60 border border-red-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span>Unauthorised disclosure of student information</span>
              </li>
              <li className="flex items-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-zinc-900/60 border border-red-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span>Financial exploitation or solicitation</span>
              </li>
              <li className="flex items-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-zinc-900/60 border border-red-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span>Attempts to bypass safety or payment mechanisms</span>
              </li>
            </ul>
          </section>

          {/* Section 11 */}
          <section className="bg-white dark:bg-[#121214] p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-sm">11</span>
              <h2 className="text-xl font-bold text-[var(--fg)]">Reporting Concerns</h2>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-3">
              Students and mentors are encouraged to report inappropriate behaviour, safety concerns, or violations of this Code of Conduct to HelpMeMan through the platform's designated reporting mechanism or by emailing <a href="mailto:safety@helpmeman.com" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">safety@helpmeman.com</a>.
            </p>
            <p className="text-xs text-[var(--muted)]">
              Reports will be reviewed appropriately, and HelpMeMan may take action based on the circumstances and available information. Retaliation against anyone who makes a good-faith report is strictly prohibited.
            </p>
          </section>

          {/* Section 12 */}
          <section className="bg-white dark:bg-[#121214] p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-sm">12</span>
              <h2 className="text-xl font-bold text-[var(--fg)]">Enforcement & Consequences</h2>
            </div>
            <p className="text-sm text-[var(--muted)] mb-3">
              HelpMeMan reserves the right to review reported conduct and take appropriate action. Depending on the seriousness and circumstances of a violation, actions may include:
            </p>
            <ul className="space-y-2 text-sm text-[var(--fg)]/90 pl-1 mb-4">
              <li className="flex items-start gap-2.5"><span className="text-blue-500 mt-1">•</span><span>Warning or formal notice.</span></li>
              <li className="flex items-start gap-2.5"><span className="text-blue-500 mt-1">•</span><span>Temporary restriction of mentoring activities.</span></li>
              <li className="flex items-start gap-2.5"><span className="text-blue-500 mt-1">•</span><span>Removal of specific platform privileges.</span></li>
              <li className="flex items-start gap-2.5"><span className="text-blue-500 mt-1">•</span><span>Suspension of the mentor account.</span></li>
              <li className="flex items-start gap-2.5"><span className="text-blue-500 mt-1">•</span><span>Permanent removal from HelpMeMan.</span></li>
              <li className="flex items-start gap-2.5"><span className="text-blue-500 mt-1">•</span><span>Escalation to relevant authorities where required by law or safety concerns.</span></li>
            </ul>
          </section>

          {/* Section 13 */}
          <section className="bg-white dark:bg-[#121214] p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-sm">13</span>
              <h2 className="text-xl font-bold text-[var(--fg)]">Mentor Responsibility</h2>
            </div>
            <p className="text-sm text-[var(--muted)] mb-3">
              By becoming a HelpMeMan mentor, you acknowledge that mentorship involves a position of trust. You agree to:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--fg)] font-medium">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200/60 dark:border-zinc-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Act honestly and professionally
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200/60 dark:border-zinc-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Put student interests at the centre
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200/60 dark:border-zinc-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Maintain appropriate boundaries
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200/60 dark:border-zinc-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Protect student privacy
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200/60 dark:border-zinc-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Respect HelpMeMan policies
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200/60 dark:border-zinc-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Take responsibility for your conduct
              </div>
            </div>
          </section>

          {/* Acknowledgement Footer Box */}
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white p-8 rounded-3xl shadow-xl border border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-6 h-6 text-blue-400 shrink-0" />
              <h3 className="text-xl font-bold">Mentor Acknowledgement</h3>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
              By registering as a mentor on HelpMeMan, I confirm that I have read, understood, and agree to comply with the HelpMeMan Mentor Code of Conduct. I understand that violations may result in restrictions, suspension, or removal from the platform.
            </p>
            <p className="text-xs text-zinc-400">
              HelpMeMan reserves the right to update this Code of Conduct from time to time to reflect changes in the platform, applicable requirements, and community safety standards.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <FooterSection />
    </div>
  );
}
