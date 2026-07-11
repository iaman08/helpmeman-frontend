import { clsx } from "clsx";
import type { InstitutionType } from "@/lib/types";

const colorMap: Record<string, string> = {
  /* Blue — IIT, AIIMS, BITS, NIT */
  IIT: "bg-blue-500/12 text-blue-600",
  AIIMS: "bg-blue-500/12 text-blue-600",
  BITS: "bg-blue-500/12 text-blue-600",
  NIT: "bg-blue-500/12 text-blue-600",
  /* Amber — FAANG and top companies */
  FAANG: "bg-amber-500/12 text-amber-600",
  Google: "bg-amber-500/12 text-amber-600",
  Microsoft: "bg-amber-500/12 text-amber-600",
  Amazon: "bg-amber-500/12 text-amber-600",
  Apple: "bg-amber-500/12 text-amber-600",
  Meta: "bg-amber-500/12 text-amber-600",
  Netflix: "bg-amber-500/12 text-amber-600",
  Goldman: "bg-amber-500/12 text-amber-600",
  McKinsey: "bg-amber-500/12 text-amber-600",
  /* Purple — NLU, Startup */
  NLU: "bg-purple-500/12 text-purple-600",
  Startup: "bg-purple-500/12 text-purple-600",
};

const typeMap: Record<InstitutionType, string> = {
  COLLEGE: "bg-blue-500/12 text-blue-600",
  COMPANY: "bg-amber-500/12 text-amber-600",
  STARTUP: "bg-purple-500/12 text-purple-600",
};

function resolveColor(name: string, type: InstitutionType): string {
  /* Try exact keyword match first */
  for (const [key, val] of Object.entries(colorMap)) {
    if (name.toUpperCase().includes(key.toUpperCase())) return val;
  }
  /* Fallback to type-based */
  return typeMap[type] ?? "bg-(--fg)/8 text-(--fg)/70";
}

type Props = {
  institutionName: string;
  institutionType: InstitutionType;
  className?: string;
};

export function InstitutionBadge({
  institutionName,
  institutionType,
  className,
}: Props) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium tracking-wide",
        resolveColor(institutionName, institutionType),
        className,
      )}
    >
      {institutionName}
    </span>
  );
}
