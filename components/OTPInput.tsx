"use client";

import { useEffect, useRef, type KeyboardEvent, type ClipboardEvent } from "react";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void; // called instantly when all 6 digits entered
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

export default function OTPInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = true,
}: OTPInputProps) {
  const length = 6;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const completedRef = useRef(false); // prevent double-firing onComplete

  // Split value into array
  const otpArray = value.split("").slice(0, length);
  while (otpArray.length < length) {
    otpArray.push("");
  }

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && !disabled) {
      // Small delay so the page transition finishes before focusing
      const timer = setTimeout(() => inputRefs.current[0]?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, disabled]);

  // Reset completed flag when value clears
  useEffect(() => {
    if (value.length < length) completedRef.current = false;
  }, [value]);

  // Fire onComplete when all 6 digits are filled — avoids needing a Submit button
  useEffect(() => {
    if (value.length === length && !completedRef.current && onComplete) {
      completedRef.current = true;
      onComplete(value);
    }
  }, [value, onComplete]);

  // Handle single character change
  const handleChange = (val: string, index: number) => {
    if (disabled) return;
    const cleanVal = val.replace(/[^0-9]/g, "");
    if (!cleanVal) return;

    const newOtp = [...otpArray];
    newOtp[index] = cleanVal.substring(cleanVal.length - 1);
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
        const newOtp = [...otpArray];
        newOtp[index - 1] = "";
        onChange(newOtp.join(""));
        inputRefs.current[index - 1]?.focus();
      } else {
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

  // Handle pasting — fills all boxes instantly
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    const pastedText = e.clipboardData.getData("text");
    const cleanText = pastedText.replace(/[^0-9]/g, "").slice(0, length);

    if (cleanText.length > 0) {
      onChange(cleanText);
      const targetIndex = Math.min(cleanText.length, length - 1);
      inputRefs.current[targetIndex]?.focus();
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3 md:gap-4 justify-between items-center w-full max-w-md mx-auto my-2">
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
          autoComplete={i === 0 ? "one-time-code" : "off"}
          className={`
            flex-1 min-w-0 aspect-[5/6] max-w-[3.5rem] text-center text-lg sm:text-xl font-semibold rounded-xl outline-none
            transition-all duration-150 border-2
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
