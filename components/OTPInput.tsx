"use client";

import { useEffect, useRef, type KeyboardEvent, type ClipboardEvent } from "react";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export default function OTPInput({
  value,
  onChange,
  disabled = false,
  error = false,
}: OTPInputProps) {
  const length = 6;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array
  const otpArray = value.split("").slice(0, length);
  while (otpArray.length < length) {
    otpArray.push("");
  }

  // Handle single character change
  const handleChange = (val: string, index: number) => {
    // Only allow numbers
    const cleanVal = val.replace(/[^0-9]/g, "");
    if (!cleanVal) return;

    const newOtp = [...otpArray];
    newOtp[index] = cleanVal.substring(cleanVal.length - 1); // take the last entered char
    const newOtpString = newOtp.join("");
    onChange(newOtpString);

    // Auto-focus next input
    if (index < length - 1 && cleanVal) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace, arrows
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otpArray[index] && index > 0) {
        // Current is empty, focus previous and clear it
        const newOtp = [...otpArray];
        newOtp[index - 1] = "";
        onChange(newOtp.join(""));
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current
        const newOtp = [...otpArray];
        newOtp[index] = "";
        onChange(newOtp.join(""));
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  // Handle pasting
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    const pastedText = e.clipboardData.getData("text");
    const cleanText = pastedText.replace(/[^0-9]/g, "").slice(0, length);

    if (cleanText.length > 0) {
      onChange(cleanText);
      // Focus the last filled box or the next empty box
      const targetIndex = Math.min(cleanText.length, length - 1);
      inputRefs.current[targetIndex]?.focus();
    }
  };

  return (
    <div className="flex gap-2.5 sm:gap-4 justify-between items-center w-full max-w-md mx-auto my-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otpArray[i]}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-semibold rounded-xl outline-none
            transition-all duration-200 border-2
            ${
              error
                ? "border-red-500/50 bg-red-500/5 focus:border-red-500 text-red-500"
                : "border-transparent bg-(--fg)/5 focus:bg-(--fg)/8 text-(--fg) focus:border-(--accent) focus:ring-1 focus:ring-(--accent)"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
      ))}
    </div>
  );
}
