"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

/* ──────────────────────────────────────────────────
   Official Vector Brand & University Logomarks
   ────────────────────────────────────────────────── */

// ── Companies ──
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
    <svg viewBox="0 0 814 1000" className="w-5 h-5 fill-zinc-900 dark:fill-zinc-100">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
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
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#E50914" d="M15.385 0H20v24h-4.615z" />
      <path fill="#E50914" d="M4 0h4.615v24H4z" />
      <path fill="#B81D24" d="M4 0l11.385 24H20L8.615 0z" />
    </svg>
  );
}

function AmazonIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-5 h-5 fill-[#FF9900]">
      <path d="M10.813 11.968c.157.083.36.074.5-.05l.005.005a90 90 0 0 1 1.623-1.405c.173-.143.143-.372.006-.563l-.125-.17c-.345-.465-.673-.906-.673-1.791v-3.3l.001-.335c.008-1.265.014-2.421-.933-3.305C10.404.274 9.06 0 8.03 0 6.017 0 3.77.75 3.296 3.24c-.047.264.143.404.316.443l2.054.22c.19-.009.33-.196.366-.387.176-.857.896-1.271 1.703-1.271.435 0 .929.16 1.188.55.264.39.26.91.257 1.376v.432q-.3.033-.621.065c-1.113.114-2.397.246-3.36.67C3.873 5.91 2.94 7.08 2.94 8.798c0 2.2 1.387 3.298 3.168 3.298 1.506 0 2.328-.354 3.489-1.54l.167.246c.274.405.456.675 1.047 1.166ZM6.03 8.431C6.03 6.627 7.647 6.3 9.177 6.3v.57c.001.776.002 1.434-.396 2.133-.336.595-.87.961-1.465.961-.812 0-1.286-.619-1.286-1.533M.435 12.174c2.629 1.603 6.698 4.084 13.183.997.28-.116.475.078.199.431C13.538 13.96 11.312 16 7.57 16 3.832 16 .968 13.446.094 12.386c-.24-.275.036-.4.199-.299z"/>
      <path d="M13.828 11.943c.567-.07 1.468-.027 1.645.204.135.176-.004.966-.233 1.533-.23.563-.572.961-.762 1.115s-.333.094-.23-.137c.105-.23.684-1.663.455-1.963-.213-.278-1.177-.177-1.625-.13l-.09.009q-.142.013-.233.024c-.193.021-.245.027-.274-.032-.074-.209.779-.556 1.347-.623"/>
    </svg>
  );
}

function MetaIcon() {
  return (
    <svg viewBox="0 0 256 171" className="w-5 h-5">
      <defs>
        <linearGradient id="meta__a" x1="13.878%" x2="89.144%" y1="55.934%" y2="58.694%">
          <stop offset="0%" stopColor="#0064E1" />
          <stop offset="40%" stopColor="#0064E1" />
          <stop offset="83%" stopColor="#0073EE" />
          <stop offset="100%" stopColor="#0082FB" />
        </linearGradient>
        <linearGradient id="meta__b" x1="54.315%" x2="54.315%" y1="82.782%" y2="39.307%">
          <stop offset="0%" stopColor="#0082FB" />
          <stop offset="100%" stopColor="#0064E0" />
        </linearGradient>
      </defs>
      <path fill="#0081FB" d="M27.651 112.136c0 9.775 2.146 17.28 4.95 21.82 3.677 5.947 9.16 8.466 14.751 8.466 7.211 0 13.808-1.79 26.52-19.372 10.185-14.092 22.186-33.874 30.26-46.275l13.675-21.01c9.499-14.591 20.493-30.811 33.1-41.806C161.196 4.985 172.298 0 183.47 0c18.758 0 36.625 10.87 50.3 31.257C248.735 53.584 256 81.707 256 110.729c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363v-27.616c15.695 0 19.612-14.422 19.612-30.927 0-23.52-5.484-49.623-17.564-68.273-8.574-13.23-19.684-21.313-31.907-21.313-13.22 0-23.859 9.97-35.815 27.75-6.356 9.445-12.882 20.956-20.208 33.944l-8.066 14.289c-16.203 28.728-20.307 35.271-28.408 46.07-14.2 18.91-26.324 26.076-42.287 26.076-18.935 0-30.91-8.2-38.325-20.556C2.973 139.413 0 126.202 0 111.148l27.651.988Z" />
      <path fill="url(#meta__a)" d="M21.802 33.206C34.48 13.666 52.774 0 73.757 0 85.91 0 97.99 3.597 110.605 13.897c13.798 11.261 28.505 29.805 46.853 60.368l6.58 10.967c15.881 26.459 24.917 40.07 30.205 46.49 6.802 8.243 11.565 10.7 17.752 10.7 15.695 0 19.612-14.422 19.612-30.927l24.393-.766c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363-11.395 0-21.49-2.475-32.654-13.007-8.582-8.083-18.615-22.443-26.334-35.352l-22.96-38.352C118.528 64.08 107.96 49.73 101.845 43.23c-6.578-6.988-15.036-15.428-28.532-15.428-10.923 0-20.2 7.666-27.963 19.39L21.802 33.206Z" />
      <path fill="url(#meta__b)" d="M73.312 27.802c-10.923 0-20.2 7.666-27.963 19.39-10.976 16.568-17.698 41.245-17.698 64.944 0 9.775 2.146 17.28 4.95 21.82L9.027 149.482C2.973 139.413 0 126.202 0 111.148 0 83.772 7.514 55.24 21.802 33.206 34.48 13.666 52.774 0 73.757 0l-.445 27.802Z" />
    </svg>
  );
}

function FigmaIcon() {
  return (
    <svg viewBox="0 0 54 80" className="w-5 h-5">
      <path d="M0 13.3333C0 5.97333 5.97333 0 13.3333 0H26.6667V26.6667H13.3333C5.97333 26.6667 0 20.6933 0 13.3333Z" fill="#F24E1E"/>
      <path d="M26.6667 0H40.0001C47.3601 0 53.3334 5.97333 53.3334 13.3333C53.3334 20.6933 47.3601 26.6667 40.0001 26.6667H26.6667V0Z" fill="#FF7262"/>
      <path d="M0 39.9998C0 32.6398 5.97333 26.6665 13.3333 26.6665H26.6667V53.3332H13.3333C5.97333 47.3598 0 47.3598 0 39.9998Z" fill="#A259FF"/>
      <path d="M53.3334 39.9998C53.3334 47.3598 47.3601 53.3332 40.0001 53.3332C32.6401 53.3332 26.6667 47.3598 26.6667 39.9998C26.6667 32.6398 32.6401 26.6665 40.0001 26.6665C47.3601 26.6665 53.3334 32.6398 53.3334 39.9998Z" fill="#1ABCFE"/>
      <path d="M13.3333 80.0002C20.6933 80.0002 26.6667 74.0268 26.6667 66.6668V53.3335H13.3333C5.97333 53.3335 0 59.3068 0 66.6668C0 74.0268 5.97333 80.0002 13.3333 80.0002Z" fill="#0ACF83"/>
    </svg>
  );
}

function AirbnbIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#FF5A5F]">
      <path d="M12.001 18.275c-1.353-1.697-2.148-3.184-2.413-4.457-.263-1.027-.16-1.848.291-2.465.477-.71 1.188-1.056 2.121-1.056s1.643.345 2.12 1.063c.446.61.558 1.432.286 2.465-.291 1.298-1.085 2.785-2.412 4.458zm9.601 1.14c-.185 1.246-1.034 2.28-2.2 2.783-2.253.98-4.483-.583-6.392-2.704 3.157-3.951 3.74-7.028 2.385-9.018-.795-1.14-1.933-1.695-3.394-1.695-2.944 0-4.563 2.49-3.927 5.382.37 1.565 1.352 3.343 2.917 5.332-.98 1.085-1.91 1.856-2.732 2.333-.636.344-1.245.558-1.828.609-2.679.399-4.778-2.2-3.825-4.88.132-.345.395-.98.845-1.961l.025-.053c1.464-3.178 3.242-6.79 5.285-10.795l.053-.132.58-1.116c.45-.822.635-1.19 1.351-1.643.346-.21.77-.315 1.246-.315.954 0 1.698.558 2.016 1.007.158.239.345.557.582.953l.558 1.089.08.159c2.041 4.004 3.821 7.608 5.279 10.794l.026.025.533 1.22.318.764c.243.613.294 1.222.213 1.858z" />
    </svg>
  );
}

function AdobeIcon() {
  return (
    <svg viewBox="0 0 91 80" className="w-5 h-5">
      <path d="M56.9686 0H90.4318V80L56.9686 0Z" fill="#FF0000"/>
      <path d="M33.4632 0H0V80L33.4632 0Z" fill="#FF0000"/>
      <path d="M45.1821 29.4668L66.5199 80.0002H52.5657L46.1982 63.9461H30.6182L45.1821 29.4668Z" fill="#FF0000"/>
    </svg>
  );
}

function UberIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-zinc-900 dark:fill-zinc-100">
      <path d="M0 7.97v4.958c0 1.867 1.302 3.101 3 3.101.826 0 1.562-.316 2.094-.87v.736H6.27V7.97H5.082v4.888c0 1.257-.85 2.106-1.947 2.106-1.11 0-1.946-.827-1.946-2.106V7.971H0zm7.44 0v7.925h1.13v-.725c.521.532 1.257.86 2.06.86a3.006 3.006 0 0 0 3.034-3.01 3.01 3.01 0 0 0-3.033-3.024 2.86 2.86 0 0 0-2.049.861V7.971H7.439zm9.869 2.038c-1.687 0-2.965 1.37-2.965 3 0 1.72 1.334 3.01 3.066 3.01 1.053 0 1.913-.463 2.49-1.233l-.826-.611c-.43.577-.996.847-1.664.847-.973 0-1.753-.7-1.912-1.64h4.697v-.373c0-1.72-1.222-3-2.886-3zm6.295.068c-.634 0-1.098.294-1.381.758v-.713h-1.131v5.774h1.142V12.61c0-.894.544-1.47 1.291-1.47H24v-1.065h-.396zm-6.319.928c.85 0 1.564.588 1.756 1.47H15.52c.203-.882.916-1.47 1.765-1.47zm-6.732.012c1.086 0 1.98.883 1.98 2.004a1.993 1.993 0 0 1-1.98 2.001A1.989 1.989 0 0 1 8.56 13.02a1.99 1.99 0 0 1 1.992-2.004z"/>
    </svg>
  );
}

function SlackIcon() {
  return (
    <svg viewBox="0 0 2447.6 2452.5" className="w-5 h-5">
      <g clipRule="evenodd" fillRule="evenodd">
        <path d="m897.4 0c-135.3.1-244.8 109.9-244.7 245.2-.1 135.3 109.5 245.1 244.8 245.2h244.8v-245.1c.1-135.3-109.5-245.1-244.9-245.3.1 0 .1 0 0 0m0 654h-652.6c-135.3.1-244.9 109.9-244.8 245.2-.2 135.3 109.4 245.1 244.7 245.3h652.7c135.3-.1 244.9-109.9 244.8-245.2.1-135.4-109.5-245.2-244.8-245.3z" fill="#36c5f0"/>
        <path d="m2447.6 899.2c.1-135.3-109.5-245.1-244.8-245.2-135.3.1-244.9 109.9-244.8 245.2v245.3h244.8c135.3-.1 244.9-109.9 244.8-245.3zm-652.7 0v-654c.1-135.2-109.4-245-244.7-245.2-135.3.1-244.9 109.9-244.8 245.2v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.3z" fill="#2eb67d"/>
        <path d="m1550.1 2452.5c135.3-.1 244.9-109.9 244.8-245.2.1-135.3-109.5-245.1-244.8-245.2h-244.8v245.2c-.1 135.2 109.5 245 244.8 245.2zm0-654.1h652.7c135.3-.1 244.9-109.9 244.8-245.2.2-135.3-109.4-245.1-244.7-245.3h-652.7c-135.3.1-244.9 109.9-244.8 245.2-.1 135.4 109.4 245.2 244.7 245.3z" fill="#ecb22e"/>
        <path d="m0 1553.2c-.1 135.3 109.5 245.1 244.8 245.2 135.3-.1 244.9-109.9 244.8-245.2v-245.2h-244.8c-135.3.1-244.9 109.9-244.8 245.2zm652.7 0v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.2v-653.9c.2-135.3-109.4-245.1-244.7-245.3-135.4 0-244.9 109.8-244.8 245.1 0 0 0 .1 0 0" fill="#e01e5a"/>
      </g>
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

// ── Top Universities & Colleges ──
function HarvardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#A51C30]">
      <path d="M12 2L4 5v7c0 5 3.5 9 8 10 4.5-1 8-5 8-10V5l-8-3z" />
      <rect x="7" y="7" width="4" height="3" rx="0.5" fill="white" />
      <rect x="13" y="7" width="4" height="3" rx="0.5" fill="white" />
      <rect x="10" y="12" width="4" height="3" rx="0.5" fill="white" />
    </svg>
  );
}

function StanfordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path d="M6 3h12v4H10v2h8v8H6v-4h8v-2H6V3z" fill="#8C1515" />
      <path d="M12 2l-4 6h3v11h2V8h3l-4-6z" fill="#005A31" />
    </svg>
  );
}

function MITIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#A31F34]">
      {/* M */}
      <rect x="1" y="4" width="3" height="16" />
      <rect x="5.5" y="4" width="3" height="10" />
      <rect x="5.5" y="16" width="3" height="4" />
      <rect x="10" y="4" width="3" height="16" />
      {/* I */}
      <rect x="14.5" y="4" width="3" height="4" fill="#898D8D" />
      <rect x="14.5" y="10" width="3" height="10" />
      {/* T */}
      <rect x="19" y="4" width="4" height="3" />
      <rect x="19.5" y="8" width="3" height="12" />
    </svg>
  );
}

function IITBombayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-[#003366] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      {/* Outer Gear / Cogwheel */}
      <circle cx="12" cy="12" r="9" className="stroke-[#003366] stroke-[1.5]" />
      {/* Radial teeth around the cogwheel */}
      {[...Array(12)].map((_, index) => {
        const angle = (index * 30 * Math.PI) / 180;
        const x1 = 12 + 9 * Math.cos(angle);
        const y1 = 12 + 9 * Math.sin(angle);
        const x2 = 12 + 10.5 * Math.cos(angle);
        const y2 = 12 + 10.5 * Math.sin(angle);
        return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-[#003366] stroke-[1.5]" />;
      })}
      {/* Stylized Lotus Petals in the center */}
      <path d="M12 7c0 0 1.5 2 1.5 3.5S12.83 12 12 12s-1.5-1-1.5-1.5S12 7 12 7z" fill="#003366" className="stroke-none" />
      <path d="M12 9c-1-0.5-2.5 0-2.5 1.5s1 2 2.5 1.5" className="stroke-[#003366] stroke-[1.5]" />
      <path d="M12 9c1-0.5 2.5 0 2.5 1.5s-1 2-2.5 1.5" className="stroke-[#003366] stroke-[1.5]" />
      {/* Open book at the bottom */}
      <path d="M9 15c1-.5 2 0 3 .5 1-.5 2-.5 3-.5" className="stroke-[#003366] stroke-[1.5]" />
      <path d="M9 17.5c1-.5 2 0 3 .5 1-.5 2-.5 3-.5" className="stroke-[#003366] stroke-[1.5]" />
      <line x1="12" y1="15.5" x2="12" y2="18" className="stroke-[#003366] stroke-[1.5]" />
    </svg>
  );
}

function IITDelhiIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-[#1A365D] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      {/* Outer Gear */}
      <circle cx="12" cy="12" r="9" className="stroke-[#1A365D] stroke-[1.5]" />
      {/* 8 Gear Teeth */}
      {[...Array(8)].map((_, index) => {
        const angle = (index * 45 * Math.PI) / 180;
        const x1 = 12 + 9 * Math.cos(angle);
        const y1 = 12 + 9 * Math.sin(angle);
        const x2 = 12 + 10.5 * Math.cos(angle);
        const y2 = 12 + 10.5 * Math.sin(angle);
        return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-[#1A365D] stroke-[1.5]" />;
      })}
      {/* Inner circular outline */}
      <circle cx="12" cy="12" r="6" className="stroke-[#1A365D] stroke-[1]" />
      {/* Central Lamp / Flame */}
      <path d="M12 7c.5 1 .8 1.5.8 2.3 0 1-.8 1.7-.8 1.7s-.8-.7-.8-1.7c0-.8.3-1.3.8-2.3z" fill="#1A365D" className="stroke-none" />
      {/* Pedestal for the lamp */}
      <path d="M10 13.5h4l-.5-2.5h-3z" fill="#1A365D" className="stroke-none" />
      {/* Leaf Wings on the left and right */}
      <path d="M8.5 12c-1.5-.5-2.5.5-2.5 1.5s1.5 1 2.5 0" className="stroke-[#1A365D] stroke-[1.2]" />
      <path d="M15.5 12c1.5-.5 2.5.5 2.5 1.5s-1.5 1-2.5 0" className="stroke-[#1A365D] stroke-[1.2]" />
    </svg>
  );
}

function IITMadrasIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-[#004080] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" className="stroke-[#004080] stroke-[1.5]" />
      <path d="M12 16v-4M12 12c-1.5-1-2.5-1-3-2M12 12c1.5-1 2.5-1 3-2M9 10c0-1.5 1-2.5 3-2.5s3 1 3 2.5" className="stroke-[#004080] stroke-[1.5]" />
      <circle cx="9" cy="8" r="1.5" fill="#004080" className="stroke-none" />
      <circle cx="12" cy="6" r="1.5" fill="#004080" className="stroke-none" />
      <circle cx="15" cy="8" r="1.5" fill="#004080" className="stroke-none" />
      <path d="M9 14.5c1-.3 2 0 3 .5 1-.5 2-.8 3-.5" className="stroke-[#004080] stroke-[1.5]" />
    </svg>
  );
}

function AIIMSIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-[#1E3A8A] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 5v7c0 5 3.5 9 8 10 4.5-1 8-5 8-10V5l-8-3z" fill="#1E3A8A" className="stroke-none" />
      <line x1="12" y1="6" x2="12" y2="17" className="stroke-white stroke-[2]" />
      <path d="M9.5 8c0-1 1-1.5 2.5-1.5s2.5.5 2.5 1.5-1 1.5-2.5 1.5S9.5 11 9.5 12s1 1.5 2.5 1.5 2.5-.5 2.5-1.5" className="stroke-white stroke-[1.2]" />
      <path d="M12 4c.3.5.5.8.5 1.2 0 .5-.5.8-.5.8s-.5-.3-.5-.8c0-.4.2-.7.5-1.2z" fill="white" className="stroke-none" />
    </svg>
  );
}

function PrincetonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-[#E77500] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 5v7c0 5 3.5 9 8 10 4.5-1 8-5 8-10V5l-8-3z" fill="#E77500" className="stroke-none" />
      <path d="M8 8c1-.3 2 0 3 .5 1-.5 2-.8 3-.5v4c-1-.3-2 0-3 .5-1-.5-2-.8-3-.5V8z" fill="white" className="stroke-none" />
      <line x1="11" y1="8.5" x2="11" y2="12.5" className="stroke-[#E77500] stroke-[1]" />
      <path d="M6 16l6 3 6-3" className="stroke-white stroke-[1.5]" />
    </svg>
  );
}

function YaleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-[#00356B] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 5v7c0 5 3.5 9 8 10 4.5-1 8-5 8-10V5l-8-3z" fill="#00356B" className="stroke-none" />
      <path d="M7 8c1.2-.4 2.5 0 3.5.6 1-.6 2.3-1 3.5-.6v5.5c-1.2-.4-2.5 0-3.5.6-1-.6-2.3-1-3.5-.6V8z" fill="white" className="stroke-none" />
      <line x1="10.5" y1="8.5" x2="10.5" y2="14.5" className="stroke-[#00356B] stroke-[1]" />
    </svg>
  );
}

function ColumbiaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-[#1D4ED8] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16h16v2H4z" fill="#1D4ED8" className="stroke-none" />
      <path d="M4 16L6 8l4 4 2-6 2 6 4-4 2 8" className="stroke-[#1D4ED8] stroke-[1.8]" />
      <circle cx="6" cy="7" r="1" fill="#1D4ED8" className="stroke-none" />
      <circle cx="12" cy="5" r="1" fill="#1D4ED8" className="stroke-none" />
      <circle cx="18" cy="7" r="1" fill="#1D4ED8" className="stroke-none" />
    </svg>
  );
}

function UPennIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-[#990000] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 5v7c0 5 3.5 9 8 10 4.5-1 8-5 8-10V5l-8-3z" fill="#990000" className="stroke-none" />
      <path d="M8 6c1-.3 2 0 3 .5 1-.5 2-.8 3-.5v3c-1-.3-2 0-3 .5-1-.5-2-.8-3-.5v-3z" fill="white" className="stroke-none" />
      <path d="M6 14l6 3 6-3" className="stroke-white stroke-[1.5]" />
      <circle cx="9" cy="13" r="1" fill="white" className="stroke-none" />
      <circle cx="12" cy="15" r="1" fill="white" className="stroke-none" />
      <circle cx="15" cy="13" r="1" fill="white" className="stroke-none" />
    </svg>
  );
}

function CaltechIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-[#FF6C00] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C9.5 5 9 8 10.5 12c1.5 4 3 5 1 8" className="stroke-[#FF6C00] stroke-[1.8]" />
      <path d="M12 2c2.5 3 3 6 1.5 10-1.5 4-3 5-1 8" className="stroke-[#FF6C00] stroke-[1.8]" />
      <path d="M10 8c1.5 2 2 4 1 7" className="stroke-[#FF6C00] stroke-[1.2]" />
      <path d="M14 8c-1.5 2-2 4-1 7" className="stroke-[#FF6C00] stroke-[1.2]" />
    </svg>
  );
}

function UCBerkeleyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-[#003262] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 5v7c0 5 3.5 9 8 10 4.5-1 8-5 8-10V5l-8-3z" fill="#003262" className="stroke-none" />
      <path d="M12 6l1 2 2 .2-1.5 1.5.4 2-1.9-1-1.9 1 .4-2-1.5-1.5 2-.2z" fill="white" className="stroke-none" />
      <path d="M8 14c1-.3 2 0 3 .5 1-.5 2-.8 3-.5v2c-1-.3-2 0-3 .5-1-.5-2-.8-3-.5v-2z" fill="white" className="stroke-none" />
    </svg>
  );
}

function UCLAIcon() {
  return (
    <svg viewBox="0 0 32 20" className="w-6 h-5 fill-[#2774AE]">
      <text x="50%" y="15" textAnchor="middle" fontSize="11" fontWeight="900" fontStyle="italic" fontFamily="sans-serif" fill="#2774AE">UCLA</text>
    </svg>
  );
}

function CornellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-[#B31B1B] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 5v7c0 5 3.5 9 8 10 4.5-1 8-5 8-10V5l-8-3z" fill="#B31B1B" className="stroke-none" />
      <path d="M8 7c1-.3 2 0 3 .5 1-.5 2-.8 3-.5v3.5c-1-.3-2 0-3 .5-1-.5-2-.8-3-.5V7z" fill="white" className="stroke-none" />
      <circle cx="12" cy="15" r="2.5" className="stroke-white stroke-[1.2]" />
      <line x1="12" y1="12.5" x2="12" y2="17.5" className="stroke-white stroke-[0.8]" />
      <line x1="9.5" y1="15" x2="14.5" y2="15" className="stroke-white stroke-[0.8]" />
    </svg>
  );
}

function NUSIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" fill="#003D7C" />
      <text x="50%" y="16" textAnchor="middle" fontSize="9" fontWeight="900" fontFamily="sans-serif" fill="#EF7C00">NUS</text>
    </svg>
  );
}

function UTorontoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-[#002A5C] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L3 7v6c0 5 3.5 9 9 10 5.5-1 9-5 9-10V7l-9-5z" fill="#002A5C" className="stroke-none" />
      <rect x="7" y="6" width="4" height="3" rx="0.5" fill="white" className="stroke-none" />
      <rect x="13" y="6" width="4" height="3" rx="0.5" fill="white" className="stroke-none" />
      <path d="M12 17v-4M12 13a2 2 0 100-4 2 2 0 000 4z" className="stroke-white stroke-[1.2]" />
    </svg>
  );
}

function GymFitnessIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-[#059669] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5h11M6.5 17.5h11M6 4v16M18 4v16M3 7v10M21 7v10M9.5 12h5" />
    </svg>
  );
}

function ClinicalNutritionIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-[#65A30D] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.91 4.91 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
      <path d="M10 2c1 .5 2 2 2 5" />
    </svg>
  );
}

function MedicalDoctorIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-[#2563EB] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .2.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" fill="#2563EB" />
    </svg>
  );
}

function LegalAdvocateIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-[#D97706] stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c-.87.65-2.07 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-2.07 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10M12 3v18M3 7h18" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────
   Row 1: All Top Global Tech Companies & Multi-Domain Leaders
   Row 2: All Top Global Universities, Medical & Legal Institutions
   ────────────────────────────────────────────────── */

const marqueeLogoCardsRow1 = [
  { name: "Gym & Fitness Coaches", category: "Fat Loss & Hypertrophy", icon: <GymFitnessIcon /> },
  { name: "Clinical Nutritionists", category: "Diet & Macro Guidance", icon: <ClinicalNutritionIcon /> },
  { name: "Google", category: "Engineering & AI", icon: <GoogleIcon /> },
  { name: "Microsoft", category: "Cloud & Dev", icon: <MicrosoftIcon /> },
  { name: "Apple", category: "iOS & Systems", icon: <AppleIcon /> },
  { name: "Meta", category: "Frontend & AI", icon: <MetaIcon /> },
  { name: "Amazon", category: "Systems & AWS", icon: <AmazonIcon /> },
  { name: "Netflix", category: "Scale Engineering", icon: <NetflixIcon /> },
  { name: "Spotify", category: "Product & Growth", icon: <SpotifyIcon /> },
  { name: "Figma", category: "Design Systems", icon: <FigmaIcon /> },
  { name: "Airbnb", category: "Full-Stack Dev", icon: <AirbnbIcon /> },
  { name: "Uber", category: "Mobility & Tech", icon: <UberIcon /> },
  { name: "Adobe", category: "Creative Tech", icon: <AdobeIcon /> },
  { name: "Slack", category: "Collaboration", icon: <SlackIcon /> },
  { name: "Stripe", category: "Fintech & API", icon: <StripeIcon /> },
];

const marqueeLogoCardsRow2 = [
  { name: "AIIMS Medical Doctors", category: "NEET UG & Medical Prep", icon: <MedicalDoctorIcon /> },
  { name: "Legal & Advocate Counsel", category: "CLAT & Legal Advisory", icon: <LegalAdvocateIcon /> },
  { name: "Harvard University", category: "Ivy League · Cambridge, MA", icon: <HarvardIcon /> },
  { name: "Stanford University", category: "Stanford, CA · Tech & AI", icon: <StanfordIcon /> },
  { name: "MIT", category: "Cambridge, MA · Tech", icon: <MITIcon /> },
  { name: "IIT Bombay", category: "IIT · CSE & Engineering", icon: <IITBombayIcon /> },
  { name: "IIT Delhi", category: "IIT · Tech & Research", icon: <IITDelhiIcon /> },
  { name: "IIT Madras", category: "IIT · Tech & AI", icon: <IITMadrasIcon /> },
  { name: "AIIMS New Delhi", category: "AIIMS · Medical", icon: <AIIMSIcon /> },
  { name: "Princeton University", category: "Princeton, NJ · Research", icon: <PrincetonIcon /> },
  { name: "Yale University", category: "Ivy League · New Haven, CT", icon: <YaleIcon /> },
  { name: "Columbia University", category: "Ivy League · New York, NY", icon: <ColumbiaIcon /> },
  { name: "UPenn", category: "Ivy League · Philadelphia, PA", icon: <UPennIcon /> },
  { name: "Caltech", category: "Pasadena, CA · Science", icon: <CaltechIcon /> },
  { name: "UC Berkeley", category: "Berkeley, CA · Engineering", icon: <UCBerkeleyIcon /> },
  { name: "UCLA", category: "Los Angeles, CA · Tech", icon: <UCLAIcon /> },
  { name: "Cornell University", category: "Ivy League · Ithaca, NY", icon: <CornellIcon /> },
  { name: "NUS", category: "Singapore · Top Global Univ", icon: <NUSIcon /> },
  { name: "University of Toronto", category: "Canada · Tech & CS", icon: <UTorontoIcon /> },
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
          Mentors across Fitness, Healthcare, Law, Tech & Elite Universities
        </h2>
        <p className="text-sm sm:text-base text-[var(--muted)] max-w-lg leading-relaxed">
          Get 1-on-1 guidance from Gym & Fitness Coaches, Clinical Nutritionists, Doctors, Advocates, Tech Leaders, and Founders.
        </p>
      </motion.div>

      {/* Infinite Marquee Loop (Row 1: Companies, Row 2: Universities) */}
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
        {/* Row 1: All Tech Companies (Leftward Slow Scroll) */}
        <motion.div
          className="flex whitespace-nowrap gap-4 w-max items-center py-1"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 120,
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

        {/* Row 2: All Top Universities & Colleges (Rightward Slow Scroll) */}
        <motion.div
          className="flex whitespace-nowrap gap-4 w-max items-center py-1"
          animate={{ x: ["-50%", "0%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 125,
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