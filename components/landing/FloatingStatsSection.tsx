"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";

const LOGOS = [
  { name: "Google", slug: "google", size: 62, mobileSize: 42 },
  { name: "Apple", slug: "apple", size: 58, mobileSize: 40 },
  { name: "Spotify", slug: "spotify", size: 60, mobileSize: 42 },
  { name: "Microsoft", slug: "microsoft", size: 58, mobileSize: 40 },
  { name: "ChatGPT", slug: "chatgpt", size: 62, mobileSize: 42 },
  { name: "Amazon", slug: "amazon", size: 60, mobileSize: 40 },
  { name: "Meta", slug: "meta", size: 58, mobileSize: 40 },
  { name: "Slack", slug: "slack", size: 56, mobileSize: 38 },
  { name: "Figma", slug: "figma", size: 58, mobileSize: 40 },
  { name: "Airbnb", slug: "airbnb", size: 62, mobileSize: 42 },
  { name: "Adobe", slug: "adobe", size: 58, mobileSize: 40 },
  { name: "Uber", slug: "uber", size: 60, mobileSize: 42 },
];

const INITIAL_SPREAD = [
  { xPct: 0.05, yPct: 0.10 },
  { xPct: 0.03, yPct: 0.50 },
  { xPct: 0.07, yPct: 0.84 },
  { xPct: 0.88, yPct: 0.08 },
  { xPct: 0.91, yPct: 0.48 },
  { xPct: 0.87, yPct: 0.83 },
  { xPct: 0.30, yPct: 0.05 },
  { xPct: 0.64, yPct: 0.06 },
  { xPct: 0.18, yPct: 0.88 },
  { xPct: 0.58, yPct: 0.91 },
  { xPct: 0.14, yPct: 0.28 },
  { xPct: 0.80, yPct: 0.66 },
];

function LogoIcon({ slug, size }: { slug: string; size: number }) {
  const iconSize = Math.round(size * 0.58);
  return (
    <img
      src={`/logos/${slug}.svg`}
      alt={slug}
      width={iconSize}
      height={iconSize}
      style={{ objectFit: "contain", display: "block" }}
      loading="eager"
      draggable={false}
    />
  );
}

export function FloatingStatsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const textOpacity = useTransform(scrollYProgress, [0.2, 0.45, 0.55, 0.8], [0, 1, 1, 0]);
  const textY = useTransform(scrollYProgress, [0.2, 0.45, 0.55, 0.8], [30, 0, 0, -30]);

  const containerRef = useRef<HTMLDivElement>(null);
  const logoElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const innerElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const posRef = useRef<{ x: number; y: number }[]>([]);
  const velRef = useRef<{ vx: number; vy: number }[]>([]);
  const frameId = useRef(0);
  const dims = useRef({ w: 0, h: 0 });
  const isMobileRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isSectionInView = useInView(sectionRef, { margin: "200px 0px 200px 0px" });

  useEffect(() => { setMounted(true); }, []);

  /* Detect mobile for React render (logo size) */
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      isMobileRef.current = mobile;
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    if (!container) return;

    const readDims = () => {
      dims.current.w = container.clientWidth;
      dims.current.h = container.clientHeight;
    };
    readDims();

    const getSize = (i: number) =>
      isMobileRef.current ? LOGOS[i].mobileSize : LOGOS[i].size;

    const initPositions = (w: number, h: number) => {
      posRef.current = LOGOS.map((_, i) => {
        const sp = INITIAL_SPREAD[i % INITIAL_SPREAD.length];
        const r = getSize(i) / 2;
        return {
          x: Math.max(r + 8, Math.min(w - r - 8, sp.xPct * w)),
          y: Math.max(r + 8, Math.min(h - r - 8, sp.yPct * h)),
        };
      });
      velRef.current = LOGOS.map(() => {
        // ✅ Mobile speed ~40% of desktop
        const maxSpd = isMobileRef.current ? 0.18 : 0.45;
        const minSpd = isMobileRef.current ? 0.10 : 0.30;
        const spd = minSpd + Math.random() * (maxSpd - minSpd);
        const angle = Math.random() * Math.PI * 2;
        return { vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd };
      });
    };

    let initialized = false;

    const tick = () => {
      if (!isSectionInView) { frameId.current = requestAnimationFrame(tick); return; }

      let { w, h } = dims.current;
      if (w === 0 || h === 0) {
        readDims(); w = dims.current.w; h = dims.current.h;
        if (w === 0 || h === 0) { frameId.current = requestAnimationFrame(tick); return; }
      }
      if (!initialized) { initPositions(w, h); initialized = true; }

      const pos = posRef.current;
      const vel = velRef.current;
      const cx = w / 2;
      const cy = h / 2;
      const mobile = isMobileRef.current;

      const deadW = mobile ? Math.min(w * 0.42, 160) : Math.min(w * 0.45, 450);
      const deadH = mobile ? Math.min(h * 0.38, 200) : Math.min(h * 0.30, 150);

      // ✅ Speed caps per platform
      const spdMax = mobile ? 0.35 : 1.1;
      const spdMin = mobile ? 0.08 : 0.2;
      const jitter = mobile ? 0.012 : 0.035;
      const spdKick = mobile ? 0.12 : 0.3;

      for (let i = 0; i < pos.length; i++) {
        const r = getSize(i) / 2;
        pos[i].x += vel[i].vx;
        pos[i].y += vel[i].vy;

        if (pos[i].x - r < 0) { vel[i].vx = Math.abs(vel[i].vx) * 0.9; pos[i].x = r; }
        if (pos[i].x + r > w) { vel[i].vx = -Math.abs(vel[i].vx) * 0.9; pos[i].x = w - r; }
        if (pos[i].y - r < 0) { vel[i].vy = Math.abs(vel[i].vy) * 0.9; pos[i].y = r; }
        if (pos[i].y + r > h) { vel[i].vy = -Math.abs(vel[i].vy) * 0.9; pos[i].y = h - r; }

        const dxC = pos[i].x - cx;
        const dyC = pos[i].y - cy;
        const nX = dxC / deadW;
        const nY = dyC / deadH;
        const d = Math.sqrt(nX * nX + nY * nY);
        if (d < 1.2 && d > 0.01) {
          const f = ((1.2 - d) / 1.2) * 0.09;
          vel[i].vx += (dxC / (d * deadW)) * f * deadW;
          vel[i].vy += (dyC / (d * deadH)) * f * deadH;
        }

        vel[i].vx += (Math.random() - 0.5) * jitter;
        vel[i].vy += (Math.random() - 0.5) * jitter;

        const spd = Math.sqrt(vel[i].vx ** 2 + vel[i].vy ** 2);
        if (spd > spdMax) { vel[i].vx = (vel[i].vx / spd) * spdMax; vel[i].vy = (vel[i].vy / spd) * spdMax; }
        if (spd < spdMin) { vel[i].vx += (Math.random() - 0.5) * spdKick; vel[i].vy += (Math.random() - 0.5) * spdKick; }
      }

      /* Inter-logo collision */
      for (let i = 0; i < pos.length; i++) {
        for (let j = i + 1; j < pos.length; j++) {
          const dx = pos[j].x - pos[i].x;
          const dy = pos[j].y - pos[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minD = (getSize(i) + getSize(j)) / 2 + 10;
          if (dist < minD && dist > 0.01) {
            const nx = dx / dist;
            const ny = dy / dist;
            const dvn = (vel[i].vx - vel[j].vx) * nx + (vel[i].vy - vel[j].vy) * ny;
            if (dvn > 0) {
              vel[i].vx -= dvn * nx * 0.85; vel[i].vy -= dvn * ny * 0.85;
              vel[j].vx += dvn * nx * 0.85; vel[j].vy += dvn * ny * 0.85;
              [i, j].forEach((idx) => {
                const inner = innerElsRef.current[idx];
                if (inner && !inner.dataset.bumping) {
                  inner.dataset.bumping = "1";
                  inner.style.transform = "scale(1.11)";
                  setTimeout(() => { inner.style.transform = "scale(1)"; delete inner.dataset.bumping; }, 190);
                }
              });
            }
            const ov = minD - dist;
            pos[i].x -= (ov / 2) * nx; pos[i].y -= (ov / 2) * ny;
            pos[j].x += (ov / 2) * nx; pos[j].y += (ov / 2) * ny;
          }
        }
      }

      for (let i = 0; i < pos.length; i++) {
        const el = logoElsRef.current[i];
        if (el) {
          const s = getSize(i);
          el.style.transform = `translate(${pos[i].x - s / 2}px, ${pos[i].y - s / 2}px)`;
        }
      }
      frameId.current = requestAnimationFrame(tick);
    };

    frameId.current = requestAnimationFrame(tick);

    const onResize = () => {
      const oldW = dims.current.w; const oldH = dims.current.h;
      readDims();
      const { w: nW, h: nH } = dims.current;
      if (oldW > 0 && oldH > 0) {
        for (let i = 0; i < posRef.current.length; i++) {
          const r = getSize(i) / 2;
          posRef.current[i].x = Math.max(r, Math.min(nW - r, (posRef.current[i].x / oldW) * nW));
          posRef.current[i].y = Math.max(r, Math.min(nH - r, (posRef.current[i].y / oldH) * nH));
        }
      } else { initialized = false; }
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(frameId.current); window.removeEventListener("resize", onResize); };
  }, [mounted, isSectionInView]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-white dark:bg-[#0A0A0A]"
      style={{ height: "650px" }}
    >
      <div ref={containerRef} className="absolute inset-0 z-10 pointer-events-none">
        {LOGOS.map((logo, i) => {
          const s = isMobile ? logo.mobileSize : logo.size;
          return (
            <div
              key={logo.name}
              ref={(el) => { logoElsRef.current[i] = el; }}
              className="absolute will-change-transform"
              style={{ width: s, height: s, opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease" }}
            >
              <div
                ref={(el) => { innerElsRef.current[i] = el; }}
                className="w-full h-full flex items-center justify-center"
                style={{
                  backgroundColor: "#ffffff",
                  borderWidth: "1px",
                  borderColor: "#dddcdc",
                  boxShadow: "0px 2px 10px 0px rgba(0,0,0,0.12)",
                  borderRadius: Math.round(s * 0.24),
                  transition: "transform 0.18s ease",
                }}
              >
                <LogoIcon slug={logo.slug} size={s} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none select-none px-6">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-slate-50/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)] backdrop-filter backdrop-blur-md text-[12px] font-medium text-slate-600 dark:text-zinc-400 select-none">
          <span
            style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#22c55e",
              animation: "fss-pulse 2s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
          Where our mentors work
        </div>

        <p className="text-[15px] font-normal text-slate-400 dark:text-zinc-500 tracking-wide mb-8">
          Trusted by professionals at
        </p>

        <motion.div
          className="flex flex-col items-center justify-center text-center pointer-events-auto z-30 mt-4"
          style={{ opacity: textOpacity, y: textY }}
        >
          <span className="text-[#111111] dark:text-white text-[90px] md:text-[120px] font-black tracking-tighter leading-[0.9]">
            100+
          </span>
          <span className="text-slate-400 dark:text-zinc-500 text-[15px] md:text-[18px] font-medium tracking-wide mt-3">
            Mentors from Tier 1 Companies
          </span>
        </motion.div>
      </div>

      <style>{`
        @keyframes fss-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </section>
  );
}