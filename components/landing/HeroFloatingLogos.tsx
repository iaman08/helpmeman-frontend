"use client";

import { useRef, useEffect, useState } from "react";

interface LogoItem {
  name: string;
  slug?: string;
  customIcon?: React.ReactNode;
  size: number;
  mobileSize: number;
}

function GymIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-[#059669] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5h11M6.5 17.5h11M6 4v16M18 4v16M3 7v10M21 7v10M9.5 12h5" />
    </svg>
  );
}

function NutritionIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-[#65A30D] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.91 4.91 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
      <path d="M10 2c1 .5 2 2 2 5" />
    </svg>
  );
}

function MedicalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-[#2563EB] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .2.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" fill="#2563EB" />
    </svg>
  );
}

function LegalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-[#D97706] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c-.87.65-2.07 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-2.07 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10M12 3v18M3 7h18" />
    </svg>
  );
}

const HERO_LOGOS: LogoItem[] = [
  { name: "Google", slug: "google", size: 60, mobileSize: 42 },
  { name: "Apple", slug: "apple", size: 58, mobileSize: 40 },
  { name: "Spotify", slug: "spotify", size: 58, mobileSize: 40 },
  { name: "Microsoft", slug: "microsoft", size: 56, mobileSize: 38 },
  { name: "ChatGPT", slug: "chatgpt", size: 60, mobileSize: 42 },
  { name: "Amazon", slug: "amazon", size: 58, mobileSize: 40 },
  { name: "Meta", slug: "meta", size: 56, mobileSize: 38 },
  { name: "Slack", slug: "slack", size: 54, mobileSize: 36 },
  { name: "Figma", slug: "figma", size: 56, mobileSize: 38 },
  { name: "Airbnb", slug: "airbnb", size: 60, mobileSize: 42 },
  { name: "Adobe", slug: "adobe", size: 56, mobileSize: 38 },
  { name: "Uber", slug: "uber", size: 58, mobileSize: 40 },
  { name: "Gym & Fitness", customIcon: <GymIcon />, size: 58, mobileSize: 40 },
  { name: "Clinical Nutrition", customIcon: <NutritionIcon />, size: 58, mobileSize: 40 },
  { name: "Medical Doctor", customIcon: <MedicalIcon />, size: 58, mobileSize: 40 },
  { name: "Legal Counsel", customIcon: <LegalIcon />, size: 58, mobileSize: 40 },
];

const INITIAL_SPREAD = [
  { xPct: 0.06, yPct: 0.15 },
  { xPct: 0.04, yPct: 0.48 },
  { xPct: 0.08, yPct: 0.78 },
  { xPct: 0.89, yPct: 0.12 },
  { xPct: 0.92, yPct: 0.45 },
  { xPct: 0.88, yPct: 0.80 },
  { xPct: 0.14, yPct: 0.32 },
  { xPct: 0.83, yPct: 0.62 },
  { xPct: 0.18, yPct: 0.84 },
  { xPct: 0.78, yPct: 0.28 },
  { xPct: 0.10, yPct: 0.60 },
  { xPct: 0.86, yPct: 0.90 },
  { xPct: 0.22, yPct: 0.12 },
  { xPct: 0.72, yPct: 0.16 },
  { xPct: 0.25, yPct: 0.72 },
  { xPct: 0.70, yPct: 0.84 },
];

export function HeroFloatingLogos() {
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

  useEffect(() => { setMounted(true); }, []);

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
      isMobileRef.current ? HERO_LOGOS[i].mobileSize : HERO_LOGOS[i].size;

    const initPositions = (w: number, h: number) => {
      posRef.current = HERO_LOGOS.map((_, i) => {
        const sp = INITIAL_SPREAD[i % INITIAL_SPREAD.length];
        const r = getSize(i) / 2;
        return {
          x: Math.max(r + 8, Math.min(w - r - 8, sp.xPct * w)),
          y: Math.max(r + 8, Math.min(h - r - 8, sp.yPct * h)),
        };
      });
      velRef.current = HERO_LOGOS.map(() => {
        const maxSpd = isMobileRef.current ? 0.18 : 0.45;
        const minSpd = isMobileRef.current ? 0.10 : 0.30;
        const spd = minSpd + Math.random() * (maxSpd - minSpd);
        const angle = Math.random() * Math.PI * 2;
        return { vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd };
      });
    };

    let initialized = false;

    const tick = () => {
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

      const deadW = mobile ? Math.min(w * 0.40, 160) : Math.min(w * 0.42, 450);
      const deadH = mobile ? Math.min(h * 0.35, 200) : Math.min(h * 0.32, 220);

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
  }, [mounted]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      {HERO_LOGOS.map((logo, i) => {
        const s = isMobile ? logo.mobileSize : logo.size;
        const iconSize = Math.round(s * 0.58);
        return (
          <div
            key={logo.name}
            ref={(el) => { logoElsRef.current[i] = el; }}
            className="absolute will-change-transform"
            style={{ width: s, height: s, opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease" }}
          >
            <div
              ref={(el) => { innerElsRef.current[i] = el; }}
              className="w-full h-full flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-[0px_4px_16px_rgba(0,0,0,0.10)] dark:shadow-[0px_4px_16px_rgba(0,0,0,0.40)] rounded-2xl"
              style={{ transition: "transform 0.18s ease" }}
            >
              {logo.customIcon ? (
                logo.customIcon
              ) : (
                <img
                  src={`/logos/${logo.slug}.svg`}
                  alt={logo.name}
                  width={iconSize}
                  height={iconSize}
                  style={{ objectFit: "contain", display: "block" }}
                  loading="eager"
                  draggable={false}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
