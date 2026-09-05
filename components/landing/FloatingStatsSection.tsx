"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "motion/react";

const LOGOS = [
  { name: "Google", slug: "google", size: 66, mobileSize: 44 },
  { name: "Apple", slug: "apple", size: 62, mobileSize: 42 },
  { name: "Spotify", slug: "spotify", size: 64, mobileSize: 42 },
  { name: "Microsoft", slug: "microsoft", size: 62, mobileSize: 42 },
  { name: "ChatGPT", slug: "chatgpt", size: 66, mobileSize: 44 },
  { name: "Amazon", slug: "amazon", size: 64, mobileSize: 42 },
  { name: "Meta", slug: "meta", size: 64, mobileSize: 42 },
  { name: "Slack", slug: "slack", size: 60, mobileSize: 40 },
  { name: "Figma", slug: "figma", size: 62, mobileSize: 42 },
  { name: "Airbnb", slug: "airbnb", size: 66, mobileSize: 44 },
  { name: "Adobe", slug: "adobe", size: 62, mobileSize: 42 },
  { name: "Uber", slug: "uber", size: 64, mobileSize: 42 },
];

const INITIAL_SPREAD = [
  { xPct: 0.08, yPct: 0.12 },
  { xPct: 0.06, yPct: 0.50 },
  { xPct: 0.10, yPct: 0.84 },
  { xPct: 0.88, yPct: 0.12 },
  { xPct: 0.90, yPct: 0.48 },
  { xPct: 0.86, yPct: 0.84 },
  { xPct: 0.32, yPct: 0.08 },
  { xPct: 0.66, yPct: 0.09 },
  { xPct: 0.22, yPct: 0.88 },
  { xPct: 0.60, yPct: 0.90 },
  { xPct: 0.16, yPct: 0.28 },
  { xPct: 0.82, yPct: 0.66 },
];

function LogoIcon({ slug, size }: { slug: string; size: number }) {
  const iconSize = Math.round(size * 0.56);
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
  const sectionRef = useRef<HTMLDivElement>(null);
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const isSectionInView = useInView(sectionRef, { margin: "250px 0px 250px 0px" });

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Detect mobile screen */
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

  /* Track Scroll Progress while pinned */
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollDistance = rect.height - windowHeight;

      if (totalScrollDistance <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.min(Math.max(currentScroll / totalScrollDistance, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Active Organic Physics Animation Loop for Floating Icons */
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
          x: Math.max(r + 10, Math.min(w - r - 10, sp.xPct * w)),
          y: Math.max(r + 10, Math.min(h - r - 10, sp.yPct * h)),
        };
      });

      velRef.current = LOGOS.map(() => {
        const maxSpd = isMobileRef.current ? 0.45 : 0.95;
        const minSpd = isMobileRef.current ? 0.25 : 0.55;
        const spd = minSpd + Math.random() * (maxSpd - minSpd);
        const angle = Math.random() * Math.PI * 2;
        return { vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd };
      });
    };

    let initialized = false;

    const tick = () => {
      if (!isSectionInView) {
        frameId.current = requestAnimationFrame(tick);
        return;
      }

      let { w, h } = dims.current;
      if (w === 0 || h === 0) {
        readDims();
        w = dims.current.w;
        h = dims.current.h;
        if (w === 0 || h === 0) {
          frameId.current = requestAnimationFrame(tick);
          return;
        }
      }

      if (!initialized) {
        initPositions(w, h);
        initialized = true;
      }

      const pos = posRef.current;
      const vel = velRef.current;
      const cx = w / 2;
      const cy = h / 2;
      const mobile = isMobileRef.current;

      // Central Deadzone (keeps icons outside of the stacked numbers text)
      const deadW = mobile ? Math.min(w * 0.46, 180) : Math.min(w * 0.48, 480);
      const deadH = mobile ? Math.min(h * 0.44, 220) : Math.min(h * 0.38, 220);

      const spdMax = mobile ? 0.75 : 1.4;
      const spdMin = mobile ? 0.20 : 0.45;
      const jitter = mobile ? 0.025 : 0.045;
      const spdKick = mobile ? 0.25 : 0.5;

      for (let i = 0; i < pos.length; i++) {
        const r = getSize(i) / 2;
        pos[i].x += vel[i].vx;
        pos[i].y += vel[i].vy;

        // Container wall boundary collisions
        if (pos[i].x - r < 0) {
          vel[i].vx = Math.abs(vel[i].vx) * 0.95;
          pos[i].x = r;
        }
        if (pos[i].x + r > w) {
          vel[i].vx = -Math.abs(vel[i].vx) * 0.95;
          pos[i].x = w - r;
        }
        if (pos[i].y - r < 0) {
          vel[i].vy = Math.abs(vel[i].vy) * 0.95;
          pos[i].y = r;
        }
        if (pos[i].y + r > h) {
          vel[i].vy = -Math.abs(vel[i].vy) * 0.95;
          pos[i].y = h - r;
        }

        // Center Deadzone Repel
        const dxC = pos[i].x - cx;
        const dyC = pos[i].y - cy;
        const nX = dxC / deadW;
        const nY = dyC / deadH;
        const d = Math.sqrt(nX * nX + nY * nY);
        if (d < 1.25 && d > 0.01) {
          const f = ((1.25 - d) / 1.25) * 0.12;
          vel[i].vx += (dxC / (d * deadW)) * f * deadW;
          vel[i].vy += (dyC / (d * deadH)) * f * deadH;
        }

        // Ambient jitter for organic drifting feel
        vel[i].vx += (Math.random() - 0.5) * jitter;
        vel[i].vy += (Math.random() - 0.5) * jitter;

        const spd = Math.sqrt(vel[i].vx ** 2 + vel[i].vy ** 2);
        if (spd > spdMax) {
          vel[i].vx = (vel[i].vx / spd) * spdMax;
          vel[i].vy = (vel[i].vy / spd) * spdMax;
        }
        if (spd < spdMin) {
          vel[i].vx += (Math.random() - 0.5) * spdKick;
          vel[i].vy += (Math.random() - 0.5) * spdKick;
        }
      }

      // Inter-logo bouncing collisions
      for (let i = 0; i < pos.length; i++) {
        for (let j = i + 1; j < pos.length; j++) {
          const dx = pos[j].x - pos[i].x;
          const dy = pos[j].y - pos[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minD = (getSize(i) + getSize(j)) / 2 + 12;
          if (dist < minD && dist > 0.01) {
            const nx = dx / dist;
            const ny = dy / dist;
            const dvn = (vel[i].vx - vel[j].vx) * nx + (vel[i].vy - vel[j].vy) * ny;
            if (dvn > 0) {
              vel[i].vx -= dvn * nx * 0.9;
              vel[i].vy -= dvn * ny * 0.9;
              vel[j].vx += dvn * nx * 0.9;
              vel[j].vy += dvn * ny * 0.9;

              [i, j].forEach((idx) => {
                const inner = innerElsRef.current[idx];
                if (inner && !inner.dataset.bumping) {
                  inner.dataset.bumping = "1";
                  inner.style.transform = "scale(1.1)";
                  setTimeout(() => {
                    if (inner) {
                      inner.style.transform = "scale(1)";
                      delete inner.dataset.bumping;
                    }
                  }, 200);
                }
              });
            }
            const ov = minD - dist;
            pos[i].x -= (ov / 2) * nx;
            pos[i].y -= (ov / 2) * ny;
            pos[j].x += (ov / 2) * nx;
            pos[j].y += (ov / 2) * ny;
          }
        }
      }

      // Render positions with transform
      for (let i = 0; i < pos.length; i++) {
        const el = logoElsRef.current[i];
        if (el) {
          const s = getSize(i);
          el.style.transform = `translate3d(${pos[i].x - s / 2}px, ${pos[i].y - s / 2}px, 0)`;
        }
      }

      frameId.current = requestAnimationFrame(tick);
    };

    frameId.current = requestAnimationFrame(tick);

    const onResize = () => {
      const oldW = dims.current.w;
      const oldH = dims.current.h;
      readDims();
      const { w: nW, h: nH } = dims.current;
      if (oldW > 0 && oldH > 0 && nW > 0 && nH > 0) {
        for (let i = 0; i < posRef.current.length; i++) {
          const r = getSize(i) / 2;
          posRef.current[i].x = Math.max(r, Math.min(nW - r, (posRef.current[i].x / oldW) * nW));
          posRef.current[i].y = Math.max(r, Math.min(nH - r, (posRef.current[i].y / oldH) * nH));
        }
      } else {
        initialized = false;
      }
    };

    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frameId.current);
      window.removeEventListener("resize", onResize);
    };
  }, [mounted, isSectionInView]);

  // Stage flags based on scroll progress
  const isStage1Active = scrollProgress >= 0.05;
  const isStage2Active = scrollProgress >= 0.28;
  const isStage3Active = scrollProgress >= 0.58;

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[220vh] bg-white dark:bg-[#0A0A0A] border-t border-[var(--hairline)]"
    >
      {/* Sticky Full-Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center px-4 select-none">
        {/* Real-time Organic Physics Floating Icons Container */}
        <div ref={containerRef} className="absolute inset-0 z-10 pointer-events-none">
          {LOGOS.map((logo, i) => {
            const s = isMobile ? logo.mobileSize : logo.size;
            return (
              <div
                key={logo.name}
                ref={(el) => {
                  logoElsRef.current[i] = el;
                }}
                className="absolute will-change-transform pointer-events-auto"
                style={{
                  width: s,
                  height: s,
                  opacity: mounted ? 1 : 0,
                  transition: "opacity 0.4s ease",
                }}
              >
                <div
                  ref={(el) => {
                    innerElsRef.current[i] = el;
                  }}
                  className="w-full h-full flex items-center justify-center cursor-pointer bg-white dark:bg-[#18181B] border border-neutral-200/90 dark:border-neutral-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.35)] rounded-2xl sm:rounded-[20px] transition-transform duration-200 hover:scale-110 active:scale-95"
                >
                  <LogoIcon slug={logo.slug} size={s} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Central Scroll-Driven Numbers */}
        <div className="relative z-20 text-center flex flex-col items-center max-w-4xl mx-auto pointer-events-none">
          {/* Top Label */}
          <p className="text-[14px] sm:text-[17px] font-semibold text-[#111111] dark:text-white tracking-tight mb-2 sm:mb-4">
            A growing community of
          </p>

          {/* Line 1: No of Sessions */}
          <div
            className={`transition-all duration-500 ease-out transform ${isStage1Active
              ? "text-[#111111] dark:text-white opacity-100 scale-100"
              : "text-neutral-300 dark:text-neutral-700 opacity-60 scale-98"
              }`}
          >
            <h2 className="text-[clamp(36px,7.5vw,90px)] font-extrabold leading-[1.04] tracking-[-0.04em]">
              15+ sessions
            </h2>
          </div>

          {/* Line 2: Total Minutes */}
          <div
            className={`transition-all duration-500 ease-out transform ${isStage2Active
              ? "opacity-100 translate-y-0 scale-100 max-h-[140px] mt-1 sm:mt-2.5"
              : "opacity-0 translate-y-10 scale-95 max-h-0 overflow-hidden pointer-events-none"
              }`}
          >
            <h2 className="text-[clamp(36px,7.5vw,90px)] font-extrabold leading-[1.04] tracking-[-0.04em] text-[#111111] dark:text-white">
              100+ mentors
            </h2>
          </div>

          {/* Line 3: No of Mentees */}
          <div
            className={`transition-all duration-500 ease-out transform ${isStage3Active
              ? "opacity-100 translate-y-0 scale-100 max-h-[140px] mt-1 sm:mt-2.5"
              : "opacity-0 translate-y-10 scale-95 max-h-0 overflow-hidden pointer-events-none"
              }`}
          >
            <h2 className="text-[clamp(36px,7.5vw,90px)] font-extrabold leading-[1.04] tracking-[-0.04em] text-[#111111] dark:text-white">
              1000+ minutes
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}