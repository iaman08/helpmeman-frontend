"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import api from "@/lib/api";
import { AxiosError } from "axios";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error",
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("Invalid verification link.");
      return;
    }

    api
      .post("/auth/verify-email", { token })
      .then(() => setStatus("success"))
      .catch((err: unknown) => {
        setStatus("error");
        if (err instanceof AxiosError) {
          setErrorMsg(
            err.response?.data?.error ?? "Verification failed. Link may have expired.",
          );
        } else {
          setErrorMsg("Something went wrong.");
        }
      });
  }, [token]);

  return (
    <>
      <div className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
          Email verification
        </p>
        <h1 className="font-display text-5xl leading-none">
          {status === "loading"
            ? "Verifying…"
            : status === "success"
              ? "Verified!"
              : "Oops."}
        </h1>
      </div>

      {status === "loading" && (
        <div className="flex items-center gap-3 text-(--muted)">
          <div className="h-4 w-4 rounded-full border-2 border-(--fg)/20 border-t-(--fg) animate-spin" />
          <span className="text-sm">Verifying your email…</span>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg bg-emerald-500/10 text-emerald-600 px-4 py-4 text-sm">
            Your email has been verified successfully.
          </div>
          <Link
            href="/signin"
            className="self-start rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3.5 text-sm hover:opacity-90 transition-opacity"
          >
            Continue to sign in
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col gap-4">
          <div
            className="rounded-lg bg-red-500/10 text-red-600 px-4 py-3 text-sm"
            role="alert"
          >
            {errorMsg}
          </div>
          <Link
            href="/signin"
            className="text-sm text-(--fg) underline-offset-4 hover:underline"
          >
            Go to sign in
          </Link>
        </div>
      )}
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md flex flex-col gap-10">
        <div>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.22em] text-(--muted) hover:text-(--fg)"
          >
            ← HelpMeMan
          </Link>
        </div>
        <Suspense fallback={<div className="h-64 animate-pulse" />}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </main>
  );
}
