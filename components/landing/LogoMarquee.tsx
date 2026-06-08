"use client";

import { motion } from "motion/react";

/* ── Company logo items rendered as icon + name ── */
const LOGOS = [
  { name: "Google", icon: (
    <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )},
  { name: "Apple", icon: (
    <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
      <path d="M17.05 20.28c-.98.95-2.05 1.88-3.08 1.88-1.07 0-1.37-.62-2.6-.62-1.22 0-1.56.62-2.6.62-1.03 0-2.13-.93-3.1-1.88-1.95-1.95-3.43-5.5-3.43-8.8 0-5.23 3.38-8 6.55-8 1.63 0 3.07.62 3.97.62.9 0 2.65-.7 4.5-.7 1.95 0 3.7.8 4.78 2.25-4.13 2.1-3.47 7.4.2 9 0 .1.03.2.03.3-.3 1-.72 2-1.3 3.08zM15.03 4.1c.88-1.08 1.48-2.6 1.32-4.1-1.28.05-2.84.85-3.76 1.93-.82.95-1.53 2.5-1.34 3.98 1.4.1 2.9-.73 3.78-1.8z" />
    </svg>
  )},
  { name: "Microsoft", icon: (
    <svg className="w-[15px] h-[15px] fill-current" viewBox="0 0 24 24">
      <path d="M0 0h11v11H0zM13 0h11v11H13zM0 13h11v11H0zM13 13h11v11H13z" />
    </svg>
  )},
  { name: "Amazon", icon: (
    <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
      <path d="M15.9 14.6c-.6.6-1.5 1-2.5 1-1.8 0-3-1.1-3-3s1.2-3 3-3c1 0 1.9.4 2.5 1v-1c0-1.5-.8-2.2-2.5-2.2-1.3 0-2.5.5-3.2 1.1l-.8-1.5C10.5 4.3 12.3 3.5 14.5 3.5c3.2 0 4.5 1.7 4.5 4.5v5.5c0 1 .3 1.5.7 2h-2.5c-.2-.4-.3-.8-.3-1zm-.1-3c-.4-.5-1-.8-1.8-.8-1 0-1.5.5-1.5 1.5s.5 1.5 1.5 1.5 1.4-.4 1.8-1v-1.2z M6.5 18c3 1.8 6.5 2.5 10 2 .5 0 .8.4.5.8-2.2 1.8-5.5 2.5-8.5 2-2.5-.4-4.5-1.5-6-3.2-.3-.4 0-.8.5-.6z" />
    </svg>
  )},
  { name: "McKinsey", icon: null },
  { name: "Meta", icon: (
    <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
      <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.93 3.78-3.93 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
    </svg>
  )},
  { name: "Y Combinator", icon: (
    <svg className="w-[16px] h-[16px] fill-current" viewBox="0 0 24 24">
      <path d="M4 0h16c2.2 0 4 1.8 4 4v16c0 2.2-1.8 4-4 4H4c-2.2 0-4-1.8-4-4V4c0-2.2 1.8-4 4-4zm4 6.5h2.5l1.5 2.8 1.5-2.8H16l-3 5.3v3.7h-2V11.8L8 6.5z" />
    </svg>
  )},
  { name: "Flipkart", icon: null },
  { name: "Goldman Sachs", icon: null },
  { name: "AIIMS Delhi", icon: null },
  { name: "IIT Bombay", icon: null },
  { name: "Deloitte", icon: null },
];

function LogoItem({ name, icon }: { name: string; icon: React.ReactNode }) {
  return (
    <div className="logo-marquee-item">
      {icon && <span className="logo-marquee-icon">{icon}</span>}
      <span className="logo-marquee-name">{name}</span>
    </div>
  );
}

export function LogoMarquee() {
  // Duplicate the array for seamless infinite scrolling
  const doubled = [...LOGOS, ...LOGOS];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.1 }}
      className="logo-marquee-section"
    >
      {/* Label */}
      <p className="logo-marquee-label">
        Mentors from companies &amp; institutions you trust
      </p>

      {/* Marquee track */}
      <div className="logo-marquee-mask">
        <div className="logo-marquee-track">
          {doubled.map((logo, i) => (
            <LogoItem key={`${logo.name}-${i}`} name={logo.name} icon={logo.icon} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
