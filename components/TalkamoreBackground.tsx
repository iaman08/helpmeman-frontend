"use client";

import { useEffect, useState } from "react";

export function TalkamoreBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Base Background Color (Talkamore Warm Cream #EDE8DB in Light, Deep Obsidian #0B0C0E in Dark) */}
      <div className="absolute inset-0 bg-[#EDE8DB] dark:bg-[#0B0C0E] transition-colors duration-500" />

      {/* 2. Soft Ambient Glowing Light Orbs */}
      {/* Top Left Warm Glow */}
      <div
        className="absolute -top-32 left-1/6 w-[550px] h-[550px] bg-amber-600/15 dark:bg-emerald-500/10 rounded-full blur-[140px] animate-pulse"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease" }}
      />

      {/* Center Right Soft Emerald / Indigo Glow */}
      <div
        className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-emerald-600/12 dark:bg-indigo-500/10 rounded-full blur-[160px]"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease" }}
      />

      {/* Bottom Left Deep Warm Glow */}
      <div
        className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-orange-500/10 dark:bg-purple-500/10 rounded-full blur-[180px]"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease" }}
      />

      {/* 3. Hairline Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.035)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* 4. Film Grain / Noise Overlay (SVG Filter) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035] dark:opacity-[0.05] mix-blend-overlay pointer-events-none">
        <filter id="talkamore-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#talkamore-noise)" />
      </svg>
    </div>
  );
}
