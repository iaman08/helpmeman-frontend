"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  X,
  Send,
  CheckCircle,
  Loader2,
  UploadCloud,
  FileImage,
  FileVideo,
  Trash2,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";

type Phase = "idle" | "flying" | "form" | "submitting" | "submitted";

interface EagleFlyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  originX: number;
  originY: number;
}

export function EagleFlyFormModal({
  isOpen,
  onClose,
  originX,
  originY,
}: EagleFlyFormModalProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [bugName, setBugName] = useState("");
  const [description, setDescription] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute flight path based on viewport
  const getFlightPath = useCallback(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1400;
    const h = typeof window !== "undefined" ? window.innerHeight : 900;
    const cx = w / 2;
    const cy = h / 2;

    return {
      x: [originX, originX - 120, cx + 80, cx - 200, cx - 60, cx],
      y: [originY, originY - 280, h * 0.12, h * 0.08, h * 0.2, cy - 60],
      scale: [1, 1.8, 3.2, 3.8, 2.8, 0],
      rotate: [0, -25, -10, 8, -5, 0],
    };
  }, [originX, originY]);

  // Phase transitions
  useEffect(() => {
    if (isOpen && phase === "idle") {
      setPhase("flying");
    }
  }, [isOpen, phase]);

  useEffect(() => {
    if (phase === "flying") {
      const timer = setTimeout(() => setPhase("form"), 2200);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Handle file preview
  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("File size exceeds 50MB limit.");
      return;
    }

    setErrorMessage("");
    setMediaFile(file);

    if (file.type.startsWith("image/")) {
      setMediaType("image");
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    } else if (file.type.startsWith("video/")) {
      setMediaType("video");
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    } else {
      setMediaType(null);
      setMediaPreview(null);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [mediaPreview]);

  // Cleanup on close
  const handleClose = useCallback(() => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setPhase("idle");
    setName("");
    setEmail("");
    setContactNo("");
    setBugName("");
    setDescription("");
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setErrorMessage("");
    onClose();
  }, [mediaPreview, onClose]);

  // Submit to Backend & Google Drive
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage("");
      setPhase("submitting");

      try {
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("email", email.trim());
        formData.append("contactNo", contactNo.trim());
        formData.append("bugName", bugName.trim());
        if (description) formData.append("description", description.trim());
        if (mediaFile) formData.append("media", mediaFile);

        const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
        const endpoint = rawUrl.endsWith("/api") ? `${rawUrl}/bugs/report` : `${rawUrl}/api/bugs/report`;
        const res = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to submit bug report");
        }

        setPhase("submitted");

        // Auto close after 4 seconds
        setTimeout(() => {
          handleClose();
        }, 4000);
      } catch (err: any) {
        console.error("Bug submission failed:", err);
        setErrorMessage(err.message || "Something went wrong. Please try again.");
        setPhase("form");
      }
    },
    [name, email, contactNo, bugName, description, mediaFile, handleClose]
  );

  if (!isOpen) return null;

  const flight = getFlightPath();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9998] pointer-events-auto overflow-y-auto">
          {/* Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
            onClick={phase === "form" ? handleClose : phase === "flying" ? () => setPhase("form") : undefined}
          />

          {/* ━━━ EAGLE FLYING ANIMATION ━━━ */}
          {phase === "flying" && (
            <>
              {/* Trail Ghost 1 (most blurred) */}
              <motion.div
                className="absolute pointer-events-none"
                style={{ left: 0, top: 0 }}
                initial={{
                  x: flight.x[0],
                  y: flight.y[0],
                  scale: flight.scale[0],
                  rotate: 0,
                  opacity: 0.12,
                }}
                animate={{
                  x: flight.x,
                  y: flight.y,
                  scale: flight.scale,
                  rotate: flight.rotate,
                  opacity: [0.12, 0.18, 0.15, 0.1, 0.05, 0],
                }}
                transition={{
                  duration: 2.2,
                  delay: 0.12,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                }}
              >
                <img
                  src="/eagle-logo.png"
                  alt=""
                  className="w-14 h-14"
                  style={{ filter: "blur(8px)" }}
                  draggable={false}
                />
              </motion.div>

              {/* Trail Ghost 2 (medium blur) */}
              <motion.div
                className="absolute pointer-events-none"
                style={{ left: 0, top: 0 }}
                initial={{
                  x: flight.x[0],
                  y: flight.y[0],
                  scale: flight.scale[0],
                  rotate: 0,
                  opacity: 0.2,
                }}
                animate={{
                  x: flight.x,
                  y: flight.y,
                  scale: flight.scale,
                  rotate: flight.rotate,
                  opacity: [0.2, 0.28, 0.22, 0.15, 0.08, 0],
                }}
                transition={{
                  duration: 2.2,
                  delay: 0.06,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                }}
              >
                <img
                  src="/eagle-logo.png"
                  alt=""
                  className="w-14 h-14"
                  style={{ filter: "blur(4px)" }}
                  draggable={false}
                />
              </motion.div>

              {/* Main Eagle (sharp, leading) */}
              <motion.div
                className="absolute pointer-events-none z-10"
                style={{ left: 0, top: 0 }}
                initial={{
                  x: flight.x[0],
                  y: flight.y[0],
                  scale: flight.scale[0],
                  rotate: 0,
                  opacity: 1,
                }}
                animate={{
                  x: flight.x,
                  y: flight.y,
                  scale: flight.scale,
                  rotate: flight.rotate,
                  opacity: [1, 1, 1, 1, 0.8, 0],
                }}
                transition={{
                  duration: 2.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                }}
              >
                <img
                  src="/eagle-logo.png"
                  alt="Flying Eagle"
                  className="w-14 h-14 drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                  draggable={false}
                />
              </motion.div>

              {/* Sparkle Particles along flight path */}
              {Array.from({ length: 18 }).map((_, i) => {
                const t = i / 17;
                const px = flight.x[0] + (flight.x[3] - flight.x[0]) * t + (Math.random() - 0.5) * 120;
                const py = flight.y[0] + (flight.y[3] - flight.y[0]) * t + (Math.random() - 0.5) * 80;
                return (
                  <motion.div
                    key={`sparkle-${i}`}
                    className="absolute w-1.5 h-1.5 rounded-full bg-blue-400 pointer-events-none"
                    style={{ left: px, top: py }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 0.9, 0],
                      scale: [0, 1.5, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.3 + t * 1.6,
                      ease: "easeOut",
                    }}
                  />
                );
              })}
            </>
          )}

          {/* ━━━ BUG REPORT MODAL ━━━ */}
          <AnimatePresence>
            {(phase === "form" || phase === "submitting" || phase === "submitted") && (
              <div className="min-h-full flex items-center justify-center p-4 sm:p-6 relative z-10">
                <motion.div
                  key="bug-modal"
                  initial={{ opacity: 0, y: 50, scale: 0.93 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 40, scale: 0.95 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full max-w-[540px] rounded-3xl bg-white dark:bg-[#17171C] border border-[#E5E7EB] dark:border-[#27272A] shadow-[0_30px_90px_rgba(0,0,0,0.35)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.85)] overflow-hidden my-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* ── Header ── */}
                  <div className="relative px-6 pt-6 pb-4 border-b border-[#F3F4F6] dark:border-[#27272A] bg-gradient-to-b from-blue-500/5 to-transparent">
                    {/* Eagle icon centered with glowing blue ring */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="mx-auto mb-3 w-14 h-14 rounded-full bg-black border-2 border-blue-500 shadow-[0_0_24px_rgba(59,130,246,0.45)] flex items-center justify-center p-2.5"
                    >
                      <img
                        src="/eagle-logo.png"
                        alt="Eagle"
                        className="w-full h-full object-contain filter drop-shadow-md"
                        draggable={false}
                      />
                    </motion.div>

                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-center text-[#111111] dark:text-[#F5F5F5] tracking-tight">
                        Report an Issue / Bug
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#A1A1AA] text-center max-w-sm mx-auto leading-relaxed">
                      Upload screenshot or video proof. Files are securely linked with Google Drive for our engineering team.
                    </p>

                    {/* Trenchers AI Link Button */}
                    <div className="mt-3.5 flex items-center justify-center">
                      <a
                        href="https://www.trenchers.ai/"
                        target="_blank"
                        rel="noopener noreferrer"
                        id="trenchers-ai-header-btn"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-[0_4px_16px_rgba(59,130,246,0.35)] hover:shadow-[0_6px_22px_rgba(59,130,246,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group border border-blue-400/30 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-200 animate-pulse" />
                        <span>Visit Trenchers AI</span>
                        <span className="text-[11px] text-blue-200/80 font-normal hidden xs:inline">
                          (trenchers.ai)
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-blue-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={handleClose}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F3F4F6] dark:bg-[#27272A] flex items-center justify-center text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-white hover:bg-[#E5E7EB] dark:hover:bg-[#3B3B44] transition-colors cursor-pointer"
                      aria-label="Close"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* ── Success State ── */}
                  {phase === "submitted" ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-6 py-12 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: 0.1,
                        }}
                        className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4"
                      >
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </motion.div>
                      <h3 className="text-lg font-bold text-[#111111] dark:text-[#F5F5F5]">
                        Bug Report Connected to Google Drive!
                      </h3>
                      <p className="text-sm text-[#6B7280] dark:text-[#A1A1AA] mt-2 max-w-xs mx-auto">
                        Your report and attachments have been logged. Our developers and admin team will review it shortly.
                      </p>

                      <div className="mt-5">
                        <a
                          href="https://www.trenchers.ai/"
                          target="_blank"
                          rel="noopener noreferrer"
                          id="trenchers-ai-success-btn"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <Sparkles size={14} />
                          <span>Visit Trenchers AI (trenchers.ai)</span>
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </motion.div>
                  ) : (
                    /* ── Form Body ── */
                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                      {errorMessage && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                          <AlertCircle size={15} className="shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      {/* Row 1: Name & Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#374151] dark:text-[#D4D4D8] mb-1 uppercase tracking-wider">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="John Doe"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAFB] dark:bg-[#111114] border border-[#E5E7EB] dark:border-[#27272A] text-[#111111] dark:text-[#F5F5F5] text-sm placeholder:text-[#9CA3AF] dark:placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#374151] dark:text-[#D4D4D8] mb-1 uppercase tracking-wider">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="john@example.com"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAFB] dark:bg-[#111114] border border-[#E5E7EB] dark:border-[#27272A] text-[#111111] dark:text-[#F5F5F5] text-sm placeholder:text-[#9CA3AF] dark:placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      {/* Row 2: Contact No & Bug Name */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#374151] dark:text-[#D4D4D8] mb-1 uppercase tracking-wider">
                            Contact No. *
                          </label>
                          <input
                            type="tel"
                            value={contactNo}
                            onChange={(e) => setContactNo(e.target.value)}
                            required
                            placeholder="+91 98765 43210"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAFB] dark:bg-[#111114] border border-[#E5E7EB] dark:border-[#27272A] text-[#111111] dark:text-[#F5F5F5] text-sm placeholder:text-[#9CA3AF] dark:placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#374151] dark:text-[#D4D4D8] mb-1 uppercase tracking-wider">
                            Bug / Issue Name *
                          </label>
                          <input
                            type="text"
                            value={bugName}
                            onChange={(e) => setBugName(e.target.value)}
                            required
                            placeholder="e.g. Chat window freezing"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAFB] dark:bg-[#111114] border border-[#E5E7EB] dark:border-[#27272A] text-[#111111] dark:text-[#F5F5F5] text-sm placeholder:text-[#9CA3AF] dark:placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      {/* Row 3: Description */}
                      <div>
                        <label className="block text-xs font-semibold text-[#374151] dark:text-[#D4D4D8] mb-1 uppercase tracking-wider">
                          Description & Steps to Reproduce
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={2}
                          placeholder="Describe what happened and when it occurred..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9FAFB] dark:bg-[#111114] border border-[#E5E7EB] dark:border-[#27272A] text-[#111111] dark:text-[#F5F5F5] text-sm placeholder:text-[#9CA3AF] dark:placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all resize-none"
                        />
                      </div>

                      {/* Row 4: Photo or Video File Upload */}
                      <div>
                        <label className="block text-xs font-semibold text-[#374151] dark:text-[#D4D4D8] mb-1 uppercase tracking-wider">
                          Bug Photo or Video (Connected to Google Drive)
                        </label>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*,.zip"
                          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                          className="hidden"
                          id="bug-media-input"
                        />

                        {!mediaFile ? (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDragging(false);
                              handleFileSelect(e.dataTransfer.files?.[0] || null);
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${isDragging
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-[#D1D5DB] dark:border-[#27272A] hover:border-blue-500/60 bg-[#F9FAFB] dark:bg-[#111114]"
                              }`}
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                              <UploadCloud size={20} />
                            </div>
                            <div className="text-center">
                              <p className="text-xs sm:text-sm font-semibold text-[#111111] dark:text-[#F5F5F5]">
                                Drag and drop screenshot or screen recording
                              </p>
                              <p className="text-[11px] text-[#6B7280] dark:text-[#71717A] mt-0.5">
                                Supports PNG, JPG, MP4, WEBM, MOV (up to 50MB)
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* Attached Preview Box */
                          <div className="rounded-2xl border border-[#E5E7EB] dark:border-[#27272A] bg-[#F9FAFB] dark:bg-[#111114] p-3 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                {mediaType === "video" ? (
                                  <FileVideo size={18} className="text-blue-500 shrink-0" />
                                ) : (
                                  <FileImage size={18} className="text-blue-500 shrink-0" />
                                )}
                                <span className="text-xs font-semibold text-[#111111] dark:text-[#F5F5F5] truncate max-w-[260px]">
                                  {mediaFile.name}
                                </span>
                                <span className="text-[11px] text-[#6B7280] dark:text-[#71717A] shrink-0">
                                  ({(mediaFile.size / (1024 * 1024)).toFixed(1)} MB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="p-1 text-red-500 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                                title="Remove file"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            {/* Preview image or video player */}
                            {mediaPreview && (
                              <div className="max-h-[140px] overflow-hidden rounded-xl bg-black/40 flex items-center justify-center">
                                {mediaType === "image" ? (
                                  <img
                                    src={mediaPreview}
                                    alt="Bug screenshot preview"
                                    className="max-h-[140px] w-auto object-contain rounded-xl"
                                  />
                                ) : mediaType === "video" ? (
                                  <video
                                    src={mediaPreview}
                                    controls
                                    className="max-h-[140px] w-full object-contain rounded-xl"
                                  />
                                ) : null}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={phase === "submitting" || !name || !email || !contactNo || !bugName}
                        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-blue-500/30"
                      >
                        {phase === "submitting" ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Uploading to Google Drive...</span>
                          </>
                        ) : (
                          <>
                            <Send size={15} />
                            <span>Submit Bug Report</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
