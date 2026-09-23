"use client";

import { OtpInput, type OtpInputProps, type OtpStatus } from "@/components/ui/otp-input";

export type { OtpStatus, OtpInputProps };

export interface LegacyOTPInputProps extends Omit<OtpInputProps, "status"> {
  error?: boolean;
  status?: OtpStatus;
}

export default function OTPInput({
  error,
  status,
  length = 6,
  size = "md",
  className,
  ...props
}: LegacyOTPInputProps) {
  const resolvedStatus: OtpStatus = status ?? (error ? "error" : "idle");

  return (
    <div className="flex justify-center items-center w-full my-2">
      <OtpInput
        length={length}
        size={size}
        status={resolvedStatus}
        className={className}
        {...props}
      />
    </div>
  );
}
