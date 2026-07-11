"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { ChevronDown, HelpCircle, Award, Calendar, BookOpen, Clock, Shield } from "lucide-react";

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

export function HelpSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqItems: FAQItem[] = [
    {
      question: "1. How does the onboarding process work?",
      answer: (
        <div className="flex flex-col gap-4 text-sm leading-relaxed text-[#5B5B5B] dark:text-[#9A9A9A]">
          <div>
            <span className="font-bold text-[#111111] dark:text-white block mb-1">Step 1 – Apply</span>
            Visit the <span className="font-semibold text-[var(--fg)]">Apply as a Mentor</span> section and have a conversation with Ruth AI. Instead of filling lengthy forms, simply answer naturally—as if you're talking to a friend. Share your journey, achievements, challenges, lessons, and the type of mentees you'd like to help so we can match you effectively.
          </div>
          <div>
            <span className="font-bold text-[#111111] dark:text-white block mb-1">Step 2 – Profile Review</span>
            Our team carefully reviews every application.
          </div>
          <div>
            <span className="font-bold text-[#111111] dark:text-white block mb-1">Step 3 – Verification</span>
            If shortlisted, our HR team schedules a quick verification call. Depending on your profile, we may request a Government ID, Student ID, Employee ID, or other supporting credentials.
          </div>
          <div>
            <span className="font-bold text-[#111111] dark:text-white block mb-1">Step 4 – Go Live</span>
            After successful verification, your mentor profile goes live on HelpMeMan within 24 hours.
          </div>
        </div>
      ),
    },
    {
      question: "2. What is the typical duration of each mentorship session?",
      answer: (
        <p className="text-sm leading-relaxed text-[#5B5B5B] dark:text-[#9A9A9A]">
          The typical mentorship session lasts <span className="font-semibold text-[#111111] dark:text-white">10–15 minutes</span>. Depending on the mentorship category or mentee's requirements, longer session formats may be introduced in the future.
        </p>
      ),
    },
    {
      question: "3. Can mentors choose their own availability and schedule?",
      answer: (
        <p className="text-sm leading-relaxed text-[#5B5B5B] dark:text-[#9A9A9A]">
          Yes. HelpMeMan offers AI-powered scheduling through Ruth AI. Simply tell Ruth AI your daily routine in natural language. Ruth AI understands your availability, finds suitable time slots, and schedules sessions only when you're free. You can update your routine anytime and reschedule sessions whenever required. There are no fixed working hours or mandatory minimum session commitments.
        </p>
      ),
    },
    {
      question: "4. Roles & Responsibilities",
      answer: (
        <p className="text-sm leading-relaxed text-[#5B5B5B] dark:text-[#9A9A9A]">
          Conduct meaningful 1:1 mentorship sessions, share practical guidance from your own experiences, keep your availability updated through Ruth AI, and maintain professionalism during every interaction.
        </p>
      ),
    },
    {
      question: "5. Compensation",
      answer: (
        <p className="text-sm leading-relaxed text-[#5B5B5B] dark:text-[#9A9A9A]">
          Mentors earn for every completed mentorship session. The detailed payout structure, platform commission, and settlement cycle are shared during onboarding.
        </p>
      ),
    },
    {
      question: "6. Legal Information",
      answer: (
        <p className="text-sm leading-relaxed text-[#5B5B5B] dark:text-[#9A9A9A]">
          Every mentor undergoes identity and credential verification. Mentors are expected to comply with HelpMeMan's community guidelines and mentor agreement covering platform policies, payments, cancellations, and privacy.
        </p>
      ),
    },
    {
      question: "7. Exit Policy",
      answer: (
        <p className="text-sm leading-relaxed text-[#5B5B5B] dark:text-[#9A9A9A]">
          There is no lock-in period or exclusivity requirement. Mentors may pause or discontinue mentoring at any time. We only request that already-confirmed sessions be completed or appropriately rescheduled/cancelled before profile deactivation.
        </p>
      ),
    },
  ];

  return (
    <section id="help" ref={ref} className="py-20 md:py-28 lg:py-32 bg-white dark:bg-[#0A0A0A] border-t border-[#F3F4F6] dark:border-[#1F1F23] transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 text-blue-500 text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            Mentor Information
          </div>
          <h2 className="text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.02em] text-[#111111] dark:text-white leading-[1.1]">
            Help &amp; Guidelines
          </h2>
          <p className="mt-4 text-[16px] text-[#6B7280] dark:text-[#A1A1AA] leading-relaxed">
            Everything you need to know about the HelpMeMan onboarding process, session formats, scheduling, and mentor policies.
          </p>
        </motion.div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: About & Accordion FAQs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* About Box */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="rounded-2xl p-6 bg-slate-50 dark:bg-[#18181B] border border-slate-100 dark:border-[#27272A]"
            >
              <h3 className="text-lg font-bold text-[#111111] dark:text-white mb-2.5">About HelpMeMan</h3>
              <p className="text-sm leading-relaxed text-[#5B5B5B] dark:text-[#9A9A9A]">
                HelpMeMan is an AI-powered 1:1 mentorship platform connecting ambitious learners with experienced mentors from leading colleges, companies, startups, and diverse professional backgrounds. Our mission is to make quality mentorship accessible while giving mentors complete flexibility over when and how they mentor.
              </p>
            </motion.div>

            {/* Accordion FAQ list */}
            <div className="flex flex-col gap-3">
              {faqItems.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="border border-[#E5E7EB] dark:border-[#27272A] rounded-2xl overflow-hidden bg-white dark:bg-[#0A0A0A] hover:border-[#CCCCCC] dark:hover:border-[#3F3F46] transition-all"
                  >
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full flex items-center justify-between text-left px-5 py-4 cursor-pointer focus:outline-none"
                    >
                      <span className="font-semibold text-sm sm:text-base text-[#111111] dark:text-white">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform text-[#6B7280] ${
                          isOpen ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 border-t border-[#F3F4F6] dark:border-[#1F1F23]/40 pt-4 bg-slate-50/55 dark:bg-[#18181B]/10">
                        {item.answer}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Why Mentors Choose Us Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 relative lg:sticky lg:top-24 rounded-3xl p-8 bg-[#111111] dark:bg-[#18181B] text-white shadow-xl border border-transparent dark:border-[#27272A]"
          >
            <h3 className="text-xl font-bold tracking-tight mb-6">Why Mentors Choose HelpMeMan</h3>
            
            <div className="flex flex-col gap-6">
              
              <div className="flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-blue-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-white">AI-powered Matchmaking</h4>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                    Intelligent mentor-mentee pairing based on goals, background, and matching lessons.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-white">Natural-Language Scheduling</h4>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                    Simply text Ruth AI your availability and let the AI find slots and schedule sessions dynamically.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-amber-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-white">Complete Flexibility</h4>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                    Decide exactly when you mentor and how many sessions you want to accept. Update schedules anytime.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-indigo-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-white">Meaningful 1:1 Connections</h4>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                    Focus on quality, high-impact interactions through short, focused 10-15 minute video calls.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-rose-400 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-white">No Fixed Commitments</h4>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                    No long-term contracts, minimum hourly commitments, or mandatory platform exclusivity.
                  </p>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
