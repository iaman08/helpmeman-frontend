"use client";

import { useState } from "react";
import { Plus, X, ChevronDown, Check, Globe } from "lucide-react";
import type { UserLanguage } from "@/lib/types";

const AVAILABLE_LANGUAGES = [
  // Popular Indian Languages
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "pa", name: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "bn", name: "Bengali (বাংলা)" },
  { code: "te", name: "Telugu (తెలుగు)" },
  { code: "ta", name: "Tamil (தமிழ்)" },
  { code: "mr", name: "Marathi (मराठी)" },
  { code: "gu", name: "Gujarati (ગુજરાતી)" },
  { code: "kn", name: "Kannada (ಕನ್ನಡ)" },
  { code: "ml", name: "Malayalam (മലയാളം)" },
  { code: "or", name: "Odia (ଓଡ଼ିଆ)" },
  { code: "ur", name: "Urdu (اردو)" },
  { code: "as", name: "Assamese (অসমীয়া)" },
  { code: "sa", name: "Sanskrit (संस्कृत)" },

  // Global Languages
  { code: "es", name: "Spanish (Español)" },
  { code: "fr", name: "French (Français)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "ar", name: "Arabic (العربية)" },
  { code: "ja", name: "Japanese (日本語)" },
  { code: "zh", name: "Mandarin (中文)" },
  { code: "ru", name: "Russian (Русский)" },
  { code: "pt", name: "Portuguese (Português)" },
];

export const PROFICIENCY_LEVELS = [
  { value: "Native", label: "Native", description: "Mother tongue or primary fluent speaker" },
  { value: "Fluent", label: "Fluent", description: "Complete command of language" },
  { value: "Professional", label: "Professional", description: "Workplace & business competence" },
  { value: "Intermediate", label: "Intermediate", description: "Conversational understanding" },
  { value: "Basic", label: "Basic", description: "Elementary spoken or written phrases" },
];

interface Props {
  languages: UserLanguage[];
  onChange: (langs: UserLanguage[]) => void;
}

export function LanguageProficiencySelector({ languages = [], onChange }: Props) {
  const [selectedLangName, setSelectedLangName] = useState("");
  const [selectedProficiency, setSelectedProficiency] = useState("Fluent");
  const [customLangInput, setCustomLangInput] = useState("");

  const existingNames = new Set(languages.map((l) => l.languageName.toLowerCase()));

  const handleAdd = () => {
    const rawName = selectedLangName || customLangInput.trim();
    if (!rawName) return;

    // Normalize standard name (e.g. "Hindi (हिन्दी)" -> "Hindi")
    const cleanName = rawName.split(" (")[0].trim();
    if (existingNames.has(cleanName.toLowerCase())) {
      alert("This language is already added.");
      return;
    }

    const matched = AVAILABLE_LANGUAGES.find(
      (l) => l.name === rawName || l.name.startsWith(cleanName)
    );

    const newLang: UserLanguage = {
      languageName: cleanName,
      languageCode: matched?.code || null,
      proficiency: selectedProficiency,
      displayOrder: languages.length,
    };

    onChange([...languages, newLang]);
    setSelectedLangName("");
    setCustomLangInput("");
  };

  const handleRemove = (index: number) => {
    const updated = languages.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      displayOrder: idx,
    }));
    onChange(updated);
  };

  const handleProficiencyChange = (index: number, nextProficiency: string) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], proficiency: nextProficiency };
    onChange(updated);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= languages.length) return;

    const copy = [...languages];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    onChange(copy.map((item, idx) => ({ ...item, displayOrder: idx })));
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Existing selected languages */}
      {languages.length > 0 ? (
        <div className="flex flex-col gap-2">
          {languages.map((lang, idx) => (
            <div
              key={lang.languageName}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--hairline)] transition-colors"
              style={{
                background: "color-mix(in srgb, var(--fg) 2%, transparent)",
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold bg-orange-500/10 text-orange-500 shrink-0">
                  {idx + 1}
                </span>
                <span className="font-semibold text-xs sm:text-sm text-[var(--fg)] truncate">
                  {lang.languageName}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Proficiency dropdown */}
                <select
                  value={lang.proficiency || "Fluent"}
                  onChange={(e) => handleProficiencyChange(idx, e.target.value)}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium border border-[var(--hairline)] focus:outline-none cursor-pointer"
                  style={{
                    background: "var(--bg)",
                    color: "var(--fg)",
                  }}
                >
                  {PROFICIENCY_LEVELS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>

                {/* Move buttons */}
                {languages.length > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, "up")}
                      className="p-1 rounded hover:bg-[color:var(--fg)]/10 text-xs text-[var(--muted)] disabled:opacity-20 cursor-pointer"
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === languages.length - 1}
                      onClick={() => handleMove(idx, "down")}
                      className="p-1 rounded hover:bg-[color:var(--fg)]/10 text-xs text-[var(--muted)] disabled:opacity-20 cursor-pointer"
                      title="Move down"
                    >
                      ▼
                    </button>
                  </div>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 text-[var(--muted)] transition-colors cursor-pointer"
                  title="Remove language"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--muted)] italic">
          No languages added yet. Add the languages you communicate in below.
        </p>
      )}

      {/* Add New Language Row */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-2xl border border-[var(--hairline)]"
        style={{
          background: "color-mix(in srgb, var(--fg) 3%, transparent)",
        }}
      >
        <div className="flex-1">
          <select
            value={selectedLangName}
            onChange={(e) => {
              setSelectedLangName(e.target.value);
              if (e.target.value) setCustomLangInput("");
            }}
            className="w-full rounded-xl px-3 py-2 text-xs sm:text-sm font-medium border border-[var(--hairline)] focus:outline-none"
            style={{
              background: "var(--bg)",
              color: "var(--fg)",
            }}
          >
            <option value="">Select a language...</option>
            {AVAILABLE_LANGUAGES.map((l) => (
              <option
                key={l.code}
                value={l.name}
                disabled={existingNames.has(l.name.split(" (")[0].toLowerCase())}
              >
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Proficiency selector */}
        <div className="w-full sm:w-44">
          <select
            value={selectedProficiency}
            onChange={(e) => setSelectedProficiency(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-xs sm:text-sm font-medium border border-[var(--hairline)] focus:outline-none"
            style={{
              background: "var(--bg)",
              color: "var(--fg)",
            }}
          >
            {PROFICIENCY_LEVELS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!selectedLangName && !customLangInput.trim()}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus size={14} />
          <span>Add Language</span>
        </button>
      </div>
    </div>
  );
}
