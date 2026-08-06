"use client";

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const criteria = [
    { label: "Min. 8 characters", met: password.length >= 8 },
    { label: "A number", met: /[0-9]/.test(password) },
    { label: "A special symbol", met: /[^A-Za-z0-9]/.test(password) },
    { label: "Mixed case (aA)", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
  ];

  const score = criteria.filter((c) => c.met).length;

  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthText = strengthLabels[score];

  const barColors = [
    "bg-red-500",      // 1: Weak (Red)
    "bg-orange-500",   // 2: Fair (Orange)
    "bg-amber-500",    // 3: Good (Amber/Yellow)
    "bg-emerald-500",  // 4: Strong (Green)
  ];

  const activeColor = score > 0 ? barColors[score - 1] : "bg-gray-200 dark:bg-zinc-800";

  return (
    <div className="flex flex-col gap-3 mt-2.5 p-3.5 rounded-xl bg-gray-100/60 dark:bg-zinc-900/80 border border-gray-200/80 dark:border-zinc-800 animate-fade-in">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500 dark:text-zinc-400 font-medium">Password Strength</span>
        <span className={`font-semibold ${
          score <= 1 ? "text-red-500 dark:text-red-400" : score === 2 ? "text-orange-500 dark:text-orange-400" : score === 3 ? "text-amber-500 dark:text-amber-400" : "text-emerald-500 dark:text-emerald-400"
        }`}>
          {strengthText}
        </span>
      </div>

      {/* 4 strength segments */}
      <div className="grid grid-cols-4 gap-1.5 h-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-full rounded-full transition-all duration-300 ${
              i < score ? activeColor : "bg-gray-200 dark:bg-zinc-800"
            }`}
          />
        ))}
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] mt-0.5">
        {criteria.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              c.met ? "bg-emerald-500 scale-110 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-300 dark:bg-zinc-700"
            }`} />
            <span className={`transition-colors duration-300 ${
              c.met 
                ? "text-gray-900 dark:text-zinc-200 font-medium" 
                : "text-gray-400 dark:text-zinc-500"
            }`}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
