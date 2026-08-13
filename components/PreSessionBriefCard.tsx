"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, FileText, Target, HelpCircle, Link2, ExternalLink } from "lucide-react";

interface PreSessionBriefCardProps {
  aiBriefSummary?: string | null;
  intakeAnswers?: {
    primaryGoal?: string;
    keyQuestions?: string[] | string;
    currentLevel?: string;
    links?: string;
  } | null;
  menteeName: string;
}

export function PreSessionBriefCard({
  aiBriefSummary,
  intakeAnswers,
  menteeName,
}: PreSessionBriefCardProps) {
  const [expanded, setExpanded] = useState(true);

  if (!aiBriefSummary && !intakeAnswers) {
    return (
      <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-xs text-zinc-400 italic">
        Pending mentee pre-session intake.
      </div>
    );
  }

  const questionsList = Array.isArray(intakeAnswers?.keyQuestions)
    ? intakeAnswers.keyQuestions
    : typeof intakeAnswers?.keyQuestions === "string"
    ? [intakeAnswers.keyQuestions]
    : [];

  return (
    <div className="bg-zinc-950/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span>⚡ Pre-Session AI Briefing</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-extrabold">
                10-Sec Read
              </span>
            </h4>
            <p className="text-[11px] text-zinc-400">Context & Goals for {menteeName}</p>
          </div>
        </div>
        <button type="button" className="text-zinc-400 hover:text-white p-1">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 pt-3 border-t border-zinc-800/80 animate-in fade-in duration-200">
          {/* AI Synthesized Summary */}
          {aiBriefSummary && (
            <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">
              {aiBriefSummary}
            </div>
          )}

          {/* Raw Intake Answers Detail (Collapsible Notes) */}
          {intakeAnswers && (
            <div className="space-y-2 text-xs">
              {intakeAnswers.primaryGoal && (
                <div className="flex items-start gap-2">
                  <Target size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-300">Mentee Goal: </span>
                    <span className="text-zinc-300">{intakeAnswers.primaryGoal}</span>
                  </div>
                </div>
              )}

              {questionsList.length > 0 && (
                <div className="flex items-start gap-2">
                  <HelpCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-300">Questions to Answer:</span>
                    <ul className="list-disc list-inside text-zinc-400 mt-1 space-y-0.5">
                      {questionsList.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {intakeAnswers.currentLevel && (
                <div className="flex items-start gap-2">
                  <FileText size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-300">Background: </span>
                    <span className="text-zinc-400">{intakeAnswers.currentLevel}</span>
                  </div>
                </div>
              )}

              {intakeAnswers.links && (
                <div className="flex items-start gap-2 pt-1">
                  <Link2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <a
                    href={intakeAnswers.links}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 underline font-semibold flex items-center gap-1 hover:text-amber-300"
                  >
                    <span>View Mentee Attachment / Document</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
