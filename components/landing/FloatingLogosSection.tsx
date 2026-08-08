"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

/* ──────────────────────────────────────────────────
   Official Vector Brand Logomarks
   ────────────────────────────────────────────────── */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 23 23" className="w-5 h-5">
      <path fill="#f25022" d="M1 1h10v10H1z"/>
      <path fill="#7fba00" d="M12 1h10v10H12z"/>
      <path fill="#00a4ef" d="M1 12h10v10H1z"/>
      <path fill="#ffb900" d="M12 12h10v10H12z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-zinc-900 dark:fill-zinc-100">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.6.7-1.13 1.83-.99 2.93 1.07.08 2.14-.53 2.8-1.33z" />
    </svg>
  );
}

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1DB954]">
      <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.48-3.3c-.3.48-.84.66-1.32.36-3.24-1.98-8.16-2.58-11.999-1.38-.54.18-1.14-.12-1.32-.66-.18-.54.12-1.14.66-1.32 4.38-1.38 9.78-.72 13.5 1.56.48.3.66.9.36 1.44zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.18-1.26-.18-1.44-.78-.18-.6.18-1.26.78-1.44 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.66-1.5 0z"/>
    </svg>
  );
}

function NetflixIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#E50914]">
      <path d="M5.398 0v24l6.577-17.656L18.602 24V0h-4.301v14.492L9.699 0H5.398z"/>
    </svg>
  );
}

function AmazonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#FF9900]">
      <path d="M13.915 10.228c-.144-.069-.328-.103-.55-.103-.323 0-.6.07-.828.21-.229.141-.4.331-.512.569l1.89 1.157c.105-.27.283-.497.534-.682.251-.185.545-.278.883-.278.435 0 .783.125 1.045.375.261.25.392.593.392 1.029v.219c-.394.02-.796.069-1.206.148-.41.079-.817.202-1.22.368-.404.167-.768.397-1.093.69-.325.294-.572.673-.74 1.137-.168.465-.252.998-.252 1.6 0 .685.127 1.257.382 1.716.255.459.625.807 1.11 1.044.485.237 1.066.356 1.743.356.57 0 1.074-.085 1.512-.255.438-.17.807-.406 1.107-.708l.192.834h2.127v-6.386c0-.987-.272-1.745-.816-2.274-.544-.529-1.32-.794-2.328-.794-.962 0-1.764.241-2.406.723zm3.178 4.469c0 .408-.075.765-.226 1.071-.15.306-.372.548-.666.725-.294.177-.643.266-1.047.266-.358 0-.649-.074-.873-.223-.224-.148-.387-.344-.489-.588-.102-.244-.153-.521-.153-.831 0-.398.077-.738.231-1.02.154-.282.378-.501.672-.657.294-.156.643-.27 1.047-.342.404-.072.825-.119 1.264-.141v1.74zm-8.868-4.321c-.495.231-.963.501-1.404.81-.441.309-.834.669-1.179 1.08-.345.411-.612.879-.801 1.404-.189.525-.284 1.107-.284 1.746 0 .735.123 1.353.369 1.854.246.501.6.885 1.062 1.152.462.267 1.017.4 1.665.4.525 0 1.002-.081 1.431-.243.429-.162.798-.384 1.107-.666v1.395l2.052-.081v-9.351h-2.127v.909zm-.081 5.346c-.285.225-.615.338-.99.338-.345 0-.609-.084-.792-.252-.183-.168-.275-.42-.275-.756 0-.315.081-.612.243-.891.162-.279.39-.519.684-.72.294-.201.636-.369 1.026-.504l.104 2.785zm-4.708 6.48c.189.156.402.264.639.324.237.06.489.09.756.09.345 0 .678-.051.999-.153.321-.102.609-.258.864-.468l.891 1.215c-.414.345-.885.609-1.413.792-.528.183-1.086.275-1.674.275-.546 0-1.047-.075-1.503-.225-.456-.15-.849-.369-1.179-.657-.33-.288-.585-.642-.765-1.062-.18-.42-.27-.894-.27-1.422 0-.585.105-1.116.315-1.593.21-.477.51-.882.9-1.215.39-.333.858-.588 1.404-.765.546-.177 1.14-.266 1.782-.266.609 0 1.173.084 1.692.252.519.168.966.408 1.341.72l-.945 1.188c-.285-.225-.597-.393-.936-.504-.339-.111-.702-.167-1.089-.167-.405 0-.777.066-1.116.198-.339.132-.624.321-.855.567-.231.246-.399.546-.504.9-.105.354-.158.741-.158 1.161 0 .465.066.864.198 1.197.132.333.321.603.567.81zm20.892-2.148c-.684-1.284-1.605-2.427-2.763-3.429-.111-.096-.246-.144-.396-.144-.159 0-.297.054-.414.162-.117.108-.177.24-.177.396 0 .126.042.246.126.36 1.053.918 1.887 1.956 2.502 3.114-1.602.855-3.324 1.47-5.166 1.845-.162.033-.294.108-.396.225-.102.117-.153.255-.153.414 0 .168.057.315.171.441.114.126.255.18.423.162 2.016-.405 3.906-1.08 5.67-2.025.132-.072.222-.174.27-.306.048-.132.042-.267-.018-.405z"/>
    </svg>
  );
}

function MetaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#0668E1]">
      <path d="M12 4.354c-2.316 0-4.484 1.118-6.19 3.008C4.193 9.155 3.12 11.604 3.12 14c0 3.325 2.046 5.646 4.908 5.646 2.062 0 3.65-1.233 4.902-3.177 1.252 1.944 2.84 3.177 4.902 3.177 2.862 0 4.908-2.321 4.908-5.646 0-2.396-1.073-4.845-2.69-6.638C18.484 5.472 16.316 4.354 14 4.354c-1.07 0-2.025.267-2.833.79-.808-.523-1.763-.79-2.833-.79h1.666zm-4.14 2.1c1.378 0 2.68.793 3.678 2.213-.67 1.168-1.47 2.378-2.31 3.51-1.09-1.503-2.046-2.91-2.046-4.277 0-1.127.678-1.446.678-1.446zm8.28 0s.678.319.678 1.446c0 1.367-.956 2.774-2.046 4.277-.84-1.132-1.64-2.342-2.31-3.51.998-1.42 2.3-2.213 3.678-2.213z" />
    </svg>
  );
}

function FigmaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#F24E1E" d="M12 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0z" />
      <path fill="#FF7262" d="M6 6a3 3 0 0 1 6 0v6H6a3 3 0 0 1 0-6z" />
      <path fill="#F24E1E" d="M6 0a3 3 0 0 0 0 6h6V0H6z" />
      <path fill="#A259FF" d="M6 12a3 3 0 0 0 0 6h6v-6H6z" />
      <path fill="#1ABCFE" d="M18 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path fill="#0ACF83" d="M6 18a3 3 0 1 0 3 3v-3H6z" />
    </svg>
  );
}

function AirbnbIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#FF5A5F]">
      <path d="M12 0C7.2 0 3.6 4.8 3.6 9.6c0 6.6 8.4 14.4 8.4 14.4s8.4-7.8 8.4-14.4C20.4 4.8 16.8 0 12 0zm0 14.4c-2.4 0-4.4-2-4.4-4.4S9.6 5.6 12 5.6s4.4 2 4.4 4.4-2 4.4-4.4 4.4z"/>
    </svg>
  );
}

function AdobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#FF0000]">
      <path d="M13.966 22H24V2h-10.034zM0 2v20h10.034zM12 9.426L16.945 22h-3.473l-1.472-3.863h-3.999z"/>
    </svg>
  );
}

function UberIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-zinc-900 dark:fill-zinc-100">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 17a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm-1.5-10.5h3v4.5a3 3 0 0 1-6 0v-4.5h3v4.5a.5.5 0 0 0 1 0v-4.5z"/>
    </svg>
  );
}

function SlackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#E01E5A" d="M6 15a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm0-2.5a2.5 2.5 0 0 0 2.5-2.5V5a2.5 2.5 0 1 0-5 0v5A2.5 2.5 0 0 0 6 12.5z"/>
      <path fill="#36C5F0" d="M15 6a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0zm-2.5 0A2.5 2.5 0 0 0 10 8.5V14a2.5 2.5 0 1 0 5 0V8.5A2.5 2.5 0 0 0 12.5 6z"/>
      <path fill="#2EB67D" d="M18 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm0 2.5a2.5 2.5 0 0 0-2.5 2.5V19a2.5 2.5 0 1 0 5 0v-5a2.5 2.5 0 0 0-2.5-2.5z"/>
      <path fill="#ECB22E" d="M9 18a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0zm2.5 0a2.5 2.5 0 0 0 2.5-2.5V10a2.5 2.5 0 1 0-5 0v5.5a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  );
}

function StripeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#635BFF]">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-4.716C17.653 1.442 15.076 1 12.52 1 7.217 1 3.59 3.657 3.59 8.016c0 5.433 6.942 6.136 6.942 9.07 0 1.054-.889 1.543-2.227 1.543-2.617 0-5.32-1.168-7.142-2.186l-.918 4.772c1.929.983 4.908 1.785 7.918 1.785 5.565 0 9.255-2.548 9.255-7.144 0-5.69-7.442-6.28-7.442-8.901z"/>
    </svg>
  );
}

const marqueeLogoCardsRow1 = [
  { name: "Google", category: "Engineering & AI", icon: <GoogleIcon /> },
  { name: "Spotify", category: "Product & Growth", icon: <SpotifyIcon /> },
  { name: "Microsoft", category: "Cloud & Dev", icon: <MicrosoftIcon /> },
  { name: "Netflix", category: "Scale Engineering", icon: <NetflixIcon /> },
  { name: "Amazon", category: "Systems & AWS", icon: <AmazonIcon /> },
  { name: "Apple", category: "iOS & Design", icon: <AppleIcon /> },
  { name: "Stripe", category: "Fintech & API", icon: <StripeIcon /> },
];

const marqueeLogoCardsRow2 = [
  { name: "Meta", category: "Frontend & AI", icon: <MetaIcon /> },
  { name: "Figma", category: "Design Systems", icon: <FigmaIcon /> },
  { name: "Airbnb", category: "Full-Stack Dev", icon: <AirbnbIcon /> },
  { name: "Adobe", category: "Creative Tech", icon: <AdobeIcon /> },
  { name: "Uber", category: "Mobility & Tech", icon: <UberIcon /> },
  { name: "Slack", category: "Collaboration", icon: <SlackIcon /> },
];

export function FloatingLogosSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative w-full py-20 md:py-28 px-6 bg-[var(--bg)] border-t border-[var(--hairline)] overflow-hidden min-h-[460px] flex flex-col items-center justify-center gap-10"
    >
      {/* Ambient Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Header Badge & Title */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3.5 z-20 relative px-4"
      >
        <span className="px-3.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          World-Class Mentorship
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--fg)]">
          Mentors from top global companies
        </h2>
        <p className="text-sm sm:text-base text-[var(--muted)] max-w-lg leading-relaxed">
          Get 1-on-1 guidance, code reviews, and career coaching from senior engineers and leaders at industry-defining tech brands.
        </p>
      </motion.div>

      {/* Infinite Marquee Loop (Double Row, Card-based) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full relative z-20 flex flex-col gap-4 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        {/* Row 1: Leftward Scroll */}
        <motion.div
          className="flex whitespace-nowrap gap-4 w-max items-center py-1"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 35,
              ease: "linear",
            },
          }}
        >
          {[...marqueeLogoCardsRow1, ...marqueeLogoCardsRow1, ...marqueeLogoCardsRow1, ...marqueeLogoCardsRow1].map((card, i) => (
            <div
              key={`row1-${card.name}-${i}`}
              className="inline-flex items-center gap-3.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl py-2.5 px-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5 transition-all duration-300 group cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/90 border border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                {card.icon}
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="font-bold text-[14px] text-zinc-900 dark:text-zinc-100 tracking-tight">{card.name}</span>
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">{card.category}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Row 2: Rightward Scroll */}
        <motion.div
          className="flex whitespace-nowrap gap-4 w-max items-center py-1"
          animate={{ x: ["-50%", "0%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 35,
              ease: "linear",
            },
          }}
        >
          {[...marqueeLogoCardsRow2, ...marqueeLogoCardsRow2, ...marqueeLogoCardsRow2, ...marqueeLogoCardsRow2].map((card, i) => (
            <div
              key={`row2-${card.name}-${i}`}
              className="inline-flex items-center gap-3.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl py-2.5 px-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5 transition-all duration-300 group cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/90 border border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                {card.icon}
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="font-bold text-[14px] text-zinc-900 dark:text-zinc-100 tracking-tight">{card.name}</span>
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">{card.category}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}