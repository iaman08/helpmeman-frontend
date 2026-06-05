"use client";

import { motion, useScroll, useTransform, useInView } from "motion/react";
import { useRef, useEffect, useState } from "react";

/* ─────────────────────────────────────────────────
   Icons via jsDelivr (CSP-safe, no blocked domains)
   SVG paths fetched from simple-icons package.
   We inline the SVG as a data URI to avoid CORS/CSP.
   ───────────────────────────────────────────────── */
const LOGOS = [
  { name: "Google", color: "#4285F4", slug: "google", size: 62 },
  { name: "Apple", color: "#000000", slug: "apple", size: 58 },
  { name: "Spotify", color: "#1DB954", slug: "spotify", size: 60 },
  { name: "Microsoft", color: "#00A4EF", slug: "microsoft", size: 58 },
  { name: "Netflix", color: "#E50914", slug: "netflix", size: 62 },
  { name: "Amazon", color: "#FF9900", slug: "amazon", size: 60 },
  { name: "Meta", color: "#0668E1", slug: "meta", size: 58 },
  { name: "Slack", color: "#4A154B", slug: "slack", size: 56 },
  { name: "Figma", color: "#F24E1E", slug: "figma", size: 58 },
  { name: "Airbnb", color: "#FF5A5F", slug: "airbnb", size: 62 },
  { name: "Adobe", color: "#FF0000", slug: "adobe", size: 58 },
  { name: "Uber", color: "#000000", slug: "uber", size: 60 },
];

const STATS = [
  { number: "100+", label: "Mentors from Tier 1 Companies" },
  { number: "100+", label: "Global Companies Represented" },
  { number: "3+", label: "Sessions Completed" },
  { number: "4.9★", label: "Average Mentor Rating" },
];

/* Deterministic positions — logos spread across all edges/corners, never center */
const INITIAL_SPREAD = [
  { xPct: 0.05, yPct: 0.10 },   // far left top
  { xPct: 0.03, yPct: 0.50 },   // far left mid
  { xPct: 0.07, yPct: 0.84 },   // far left bottom
  { xPct: 0.88, yPct: 0.08 },   // far right top
  { xPct: 0.91, yPct: 0.48 },   // far right mid
  { xPct: 0.87, yPct: 0.83 },   // far right bottom
  { xPct: 0.30, yPct: 0.05 },   // top band left
  { xPct: 0.64, yPct: 0.06 },   // top band right
  { xPct: 0.18, yPct: 0.88 },   // bottom band left
  { xPct: 0.58, yPct: 0.91 },   // bottom band right
  { xPct: 0.14, yPct: 0.28 },   // mid-left
  { xPct: 0.80, yPct: 0.66 },   // mid-right
];

/* ── Logo icon component using jsDelivr (CSP safe) ── */
function LogoIcon({ slug, size }: { slug: string; size: number }) {
  const iconSize = Math.round(size * 0.46);
  return (
    <img
      src={`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`}
      alt={slug}
      width={iconSize}
      height={iconSize}
      style={{
        objectFit: "contain",
        filter: "brightness(0) invert(1)",
        display: "block",
      }}
      loading="eager"
      draggable={false}
    />
  );
}

export function FloatingStatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const innerElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const posRef = useRef<{ x: number; y: number }[]>([]);
  const velRef = useRef<{ vx: number; vy: number }[]>([]);
  const frameId = useRef(0);
  const dims = useRef({ w: 0, h: 0 });
  const [mounted, setMounted] = useState(false);
  const isSectionInView = useInView(sectionRef, { margin: "200px 0px 200px 0px" });

  /* ── Scroll progress over the tall section ── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  /*
   * The section is 300vh tall (enough for 4 stats + breathing room).
   * Sticky child pins to viewport. scrollYProgress 0→1 maps across
   * the full scroll distance. Stats occupy equal bands.
   *
   * Badge + intro: always visible while any stat is showing (0.08–0.92)
   * Stat 1 : 0.10 → 0.34
   * Stat 2 : 0.34 → 0.56
   * Stat 3 : 0.56 → 0.76
   * Stat 4 : 0.76 → 0.94
   */

  const badgeOp = useTransform(scrollYProgress, [0.06, 0.14, 0.88, 0.96], [0, 1, 1, 0]);
  const badgeY = useTransform(scrollYProgress, [0.06, 0.14], [14, 0]);
  const introOp = useTransform(scrollYProgress, [0.08, 0.16, 0.88, 0.96], [0, 1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0.08, 0.16], [10, 0]);

  const s1Op = useTransform(scrollYProgress, [0.10, 0.17, 0.28, 0.35], [0, 1, 1, 0]);
  const s1Y = useTransform(scrollYProgress, [0.10, 0.17, 0.28, 0.35], [30, 0, 0, -30]);

  const s2Op = useTransform(scrollYProgress, [0.34, 0.41, 0.50, 0.57], [0, 1, 1, 0]);
  const s2Y = useTransform(scrollYProgress, [0.34, 0.41, 0.50, 0.57], [30, 0, 0, -30]);

  const s3Op = useTransform(scrollYProgress, [0.56, 0.63, 0.70, 0.77], [0, 1, 1, 0]);
  const s3Y = useTransform(scrollYProgress, [0.56, 0.63, 0.70, 0.77], [30, 0, 0, -30]);

  const s4Op = useTransform(scrollYProgress, [0.76, 0.82, 0.88, 0.94], [0, 1, 1, 0]);
  const s4Y = useTransform(scrollYProgress, [0.76, 0.82, 0.88, 0.94], [30, 0, 0, -30]);

  const statAnims = [
    { opacity: s1Op, y: s1Y },
    { opacity: s2Op, y: s2Y },
    { opacity: s3Op, y: s3Y },
    { opacity: s4Op, y: s4Y },
  ];

  useEffect(() => { setMounted(true); }, []);

  /* ── Physics simulation ── */
  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    if (!container) return;

    const readDims = () => {
      dims.current.w = container.clientWidth;
      dims.current.h = container.clientHeight;
    };
    readDims();

    const initPositions = (w: number, h: number) => {
      posRef.current = LOGOS.map((logo, i) => {
        const sp = INITIAL_SPREAD[i % INITIAL_SPREAD.length];
        const r = logo.size / 2;
        return {
          x: Math.max(r + 8, Math.min(w - r - 8, sp.xPct * w)),
          y: Math.max(r + 8, Math.min(h - r - 8, sp.yPct * h)),
        };
      });
      velRef.current = LOGOS.map(() => {
        const spd = 0.30 + Math.random() * 0.45;
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
      const deadW = Math.min(w * 0.36, 260);
      const deadH = Math.min(h * 0.30, 160);

      for (let i = 0; i < pos.length; i++) {
        const r = LOGOS[i].size / 2;
        pos[i].x += vel[i].vx;
        pos[i].y += vel[i].vy;

        if (pos[i].x - r < 0) { vel[i].vx = Math.abs(vel[i].vx) * 0.9; pos[i].x = r; }
        if (pos[i].x + r > w) { vel[i].vx = -Math.abs(vel[i].vx) * 0.9; pos[i].x = w - r; }
        if (pos[i].y - r < 0) { vel[i].vy = Math.abs(vel[i].vy) * 0.9; pos[i].y = r; }
        if (pos[i].y + r > h) { vel[i].vy = -Math.abs(vel[i].vy) * 0.9; pos[i].y = h - r; }

        /* Elliptical center dead-zone repulsion */
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

        vel[i].vx += (Math.random() - 0.5) * 0.035;
        vel[i].vy += (Math.random() - 0.5) * 0.035;

        const spd = Math.sqrt(vel[i].vx ** 2 + vel[i].vy ** 2);
        if (spd > 1.1) { vel[i].vx = (vel[i].vx / spd) * 1.1; vel[i].vy = (vel[i].vy / spd) * 1.1; }
        if (spd < 0.2) { vel[i].vx += (Math.random() - 0.5) * 0.3; vel[i].vy += (Math.random() - 0.5) * 0.3; }
      }

      /* Inter-logo collision */
      for (let i = 0; i < pos.length; i++) {
        for (let j = i + 1; j < pos.length; j++) {
          const dx = pos[j].x - pos[i].x;
          const dy = pos[j].y - pos[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minD = (LOGOS[i].size + LOGOS[j].size) / 2 + 10;
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
          const s = LOGOS[i].size;
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
          const r = LOGOS[i].size / 2;
          posRef.current[i].x = Math.max(r, Math.min(nW - r, (posRef.current[i].x / oldW) * nW));
          posRef.current[i].y = Math.max(r, Math.min(nH - r, (posRef.current[i].y / oldH) * nH));
        }
      } else { initialized = false; }
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(frameId.current); window.removeEventListener("resize", onResize); };
  }, [mounted, isSectionInView]);

  return (
    /*
     * Section height = 300vh → gives enough scroll to cycle through
     * 4 stats comfortably without a massive blank area.
     * Sticky child stays pinned for the full scroll distance.
     */
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: "300vh", background: "var(--bg, #ffffff)" }}
    >
      <div
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* ── Physics canvas ── */}
        <div ref={containerRef} className="absolute inset-0 z-10 pointer-events-none">
          {LOGOS.map((logo, i) => (
            <div
              key={logo.name}
              ref={(el) => { logoElsRef.current[i] = el; }}
              className="absolute will-change-transform"
              style={{
                width: logo.size,
                height: logo.size,
                opacity: mounted ? 1 : 0,
                transition: "opacity 0.5s ease",
              }}
            >
              <div
                ref={(el) => { innerElsRef.current[i] = el; }}
                className="w-full h-full flex items-center justify-center"
                style={{
                  backgroundColor: logo.color,
                  borderRadius: Math.round(logo.size * 0.24),
                  boxShadow: "0 4px 18px -4px rgba(0,0,0,0.20), 0 1px 4px rgba(0,0,0,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  transition: "transform 0.18s ease",
                }}
              >
                <LogoIcon slug={logo.slug} size={logo.size} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Center text overlay ── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none select-none">

          {/* Badge pill */}
          <motion.div
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full"
            style={{
              opacity: badgeOp as any,
              y: badgeY as any,
              background: "rgba(255,255,255,0.90)",
              border: "1px solid rgba(0,0,0,0.08)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              fontSize: 12,
              fontWeight: 500,
              color: "#555",
              letterSpacing: "0.02em",
            }}
          >
            <span
              style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#22c55e",
                animation: "fss-pulse 2s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            Where our mentors work
          </motion.div>

          {/* "A growing library of" style subtitle */}
          <motion.p
            style={{
              opacity: introOp as any,
              y: introY as any,
              fontSize: 15,
              fontWeight: 400,
              color: "#aaa",
              letterSpacing: "0.01em",
              marginBottom: 4,
            }}
          >
            Trusted by professionals at
          </motion.p>

          {/* Sequential stats */}
          <div
            style={{
              position: "relative",
              width: "min(90vw, 560px)",
              height: 150,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                style={{
                  ...(statAnims[i] as any),
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "0 16px",
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(54px, 11vw, 90px)",
                    fontWeight: 900,
                    color: "#0A0A0A",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    display: "block",
                  }}
                >
                  {stat.number}
                </span>
                <span
                  style={{
                    display: "block",
                    marginTop: 8,
                    fontSize: "clamp(13px, 1.8vw, 16px)",
                    fontWeight: 400,
                    color: "#999",
                    letterSpacing: "0.01em",
                  }}
                >
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>

        </div>
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