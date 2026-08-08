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
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#E50914" d="M15.385 0H20v24h-4.615z" />
      <path fill="#E50914" d="M4 0h4.615v24H4z" />
      <path fill="#B81D24" d="M4 0l11.385 24H20L8.615 0z" />
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
      <path d="M16.82 4.41C14.73 4.41 13.06 5.67 12 7.15C10.94 5.67 9.27 4.41 7.18 4.41C3.41 4.41 1 7.42 1 11.75C1 16.08 3.41 19.09 7.18 19.09C9.27 19.09 10.94 17.83 12 16.35C13.06 17.83 14.73 19.09 16.82 19.09C20.59 19.09 23 16.08 23 11.75C23 7.42 20.59 4.41 16.82 4.41ZM7.18 16.63C4.85 16.63 3.32 14.53 3.32 11.75C3.32 8.97 4.85 6.87 7.18 6.87C8.98 6.87 10.37 8.1 11.13 9.77C10.02 11.45 8.61 13.56 7.18 16.63ZM16.82 16.63C15.39 13.56 13.98 11.45 12.87 9.77C13.63 8.1 15.02 6.87 16.82 6.87C19.15 6.87 20.68 8.97 20.68 11.75C20.68 14.53 19.15 16.63 16.82 16.63Z" />
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
    <svg viewBox="0 0 32 32" className="w-5 h-5 fill-[#FF5A5F]">
      <path d="M16 1c-2.008 0-3.463.963-4.951 3.269-1.905 2.954-3.905 7.42-5.594 11.83-1.633 4.269-2.455 7.781-2.455 10.36 0 3.329 2.508 5.541 6.012 5.541 2.38 0 4.606-1.127 6.988-3.411 2.382 2.284 4.608 3.411 6.988 3.411 3.504 0 6.012-2.212 6.012-5.541 0-2.579-.822-6.091-2.455-10.36-1.689-4.41-3.689-8.876-5.594-11.83C23.463 1.963 22.008 1 20 1h-4zm0 4c1.19 0 2.051.584 3.284 2.496 1.633 2.534 3.486 6.643 5.086 10.817 1.488 3.887 2.13 6.919 2.13 8.687 0 1.666-1.144 2.541-3.012 2.541-1.696 0-3.336-.889-5.46-3.053l-2.028-2.067-2.028 2.067c-2.124 2.164-3.764 3.053-5.46 3.053-1.868 0-3.012-.875-3.012-2.541 0-1.768.642-4.8 2.13-8.687 1.6-4.174 3.453-8.283 5.086-10.817C13.949 5.584 14.81 5 16 5zm0 10c-1.657 0-3 1.343-3 3 0 2.5 3 6 3 6s3-3.5 3-6c0-1.657-1.343-3-3-3zm0 2c.552 0 1 .448 1 1 0 .762-.705 2.02-1 2.518-.295-.498-1-1.756-1-2.518 0-.552.448-1 1-1z" />
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
    <svg viewBox="0 0 38 24" className="w-6 h-5 fill-zinc-900 dark:fill-zinc-100">
      <path d="M11.666 16.657c-3.774 0-6.19-2.316-6.19-6.059V2h3.55v8.525c0 2.012 1.096 3.197 2.64 3.197 1.545 0 2.64-1.185 2.64-3.197V2h3.55v8.598c0 3.743-2.416 6.059-6.19 6.059zm12.385.293c-3.666 0-5.945-2.228-5.945-6.697 0-4.47 2.279-6.698 5.945-6.698 3.52 0 5.617 2.046 5.617 5.753v1.314h-8.012c.183 1.939 1.134 2.854 2.536 2.854 1.135 0 1.976-.512 2.378-1.464h3.415c-.659 2.964-3.085 4.938-5.934 4.938zm2.195-8.231c-.11-1.39-.988-2.268-2.195-2.268-1.244 0-2.122.878-2.342 2.268h4.537zM36.5 16.657h-3.415v-8.89c0-1.28-.695-1.903-1.793-1.903-.988 0-1.756.623-1.756 1.83v8.963h-3.415V3.556h3.232v1.5c.878-1.17 2.086-1.793 3.597-1.793 2.159 0 3.55 1.28 3.55 3.73v9.664z" />
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

// ── Top Universities & Colleges ──
function HarvardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#A51C30]">
      <path d="M4 3h16v14c0 2.5-3.5 5-8 5s-8-2.5-8-5V3zm3 3v3h3.5V6H7zm6.5 0V6H17v3h-3.5zm-6.5 4.5v3h3.5v-3H7zm6.5 0v3H17v-3h-3.5z" />
    </svg>
  );
}

function StanfordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#8C1515]">
      <path d="M12 2L8 8h3v4H8l-3 5h6v4h2v-4h6l-3-5h-3V8h3l-4-6z" />
    </svg>
  );
}

function MITIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#A31F34]">
      <path d="M2 4h3.5v16H2V4zm5 0H10.5v10H7V4zm5.5 0H16v16h-3.5V4zm5 0H21v16h-3.5V4zm-10 12H10.5v4H7v-4z" />
    </svg>
  );
}

function IITBombayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#003366]">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a7 7 0 110 14 7 7 0 010-14zm-1 3v4h-2v2h2v3h2v-3h2v-2h-2V8h-2z" />
    </svg>
  );
}

function IITDelhiIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1A365D]">
      <path d="M12 2L2 7v2h20V7L12 2zm-7 9v8h3v-8H5zm5 0v8h4v-8h-4zm6 0v8h3v-8h-3zm-11 9v2h14v-2H5z" />
    </svg>
  );
}

function IITMadrasIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#004080]">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 4v16M4 12h16M6.34 6.34l11.32 11.32M6.34 17.66l11.32-11.32" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function AIIMSIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1E3A8A]">
      <path d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z" />
    </svg>
  );
}

function PrincetonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#E77500]">
      <path d="M12 2L4 5v7c0 5 3.5 9 8 10 4.5-1 8-5 8-10V5l-8-3zm-1 6h2v3h-2V8zm-3 2h2v3H8v-3zm6 0h2v3h-2v-3z" />
    </svg>
  );
}

function YaleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#00356B]">
      <path d="M12 2L3 6v6c0 5.5 3.8 10.2 9 11.5 5.2-1.3 9-6 9-11.5V6l-9-4zm-4.5 7h9v2h-9V9zm0 3.5h9v2h-9v-2z" />
    </svg>
  );
}

function ColumbiaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1D4ED8]">
      <path d="M5 16L3 5l5 4 4-6 4 6 5-4-2 11H5zm14 3H5v2h14v-2z" />
    </svg>
  );
}

function UPennIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#990000]">
      <path d="M12 2L3 6v6c0 5.5 3.8 10.2 9 11.5 5.2-1.3 9-6 9-11.5V6l-9-4zm0 4.5l5 4h-3v5.5h-4V10.5H7l5-4z" />
    </svg>
  );
}

function CaltechIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#FF6C00]">
      <path d="M12 2c-1.5 2-2.5 4-1 6 1.5 2 3 3 1 6-1 1.5-2.5 1-3.5 0 1 2 3 3.5 5.5 3.5 3.5 0 6-2.5 6-6 0-4-4-6.5-8-9.5zM10 16h4v6h-4v-6z" />
    </svg>
  );
}

function UCBerkeleyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#003262]">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 3l2 4.5 5 .7-3.6 3.5.9 5-4.3-2.3L7.7 18.7l.9-5L5 10.2l5-.7L12 5z" />
    </svg>
  );
}

function UCLAIcon() {
  return (
    <svg viewBox="0 0 32 20" className="w-6 h-4 fill-[#2774AE]">
      <path d="M3 3v9a4 4 0 008 0V3H7v9a1 1 0 01-2 0V3H3zm10 0v12h9v-3h-5V3h-4zm11 0l-4 12h4l.8-2.5h3.4l.8 2.5h4L28 3h-4zm1.5 3.5h1l1 3.5h-3l1-3.5z" />
    </svg>
  );
}

function CornellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#B31B1B]">
      <path d="M12 2L4 6v6c0 5.5 3.8 10.2 9 11.5 5.2-1.3 9-6 9-11.5V6l-8-4zm-4 7h8v2H8V9zm0 3.5h8v2H8v-2z" />
    </svg>
  );
}

function NUSIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#003D7C]">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 14h-2v-4H9v4H7V8h2v3h2V8h2v8zm5 0h-4V8h4v2h-2v1h2v5z" />
    </svg>
  );
}

function UTorontoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#002A5C]">
      <path d="M12 2L3 7v6c0 5 3.5 9 9 10 5.5-1 9-5 9-10V7l-9-5zm-1 6h2v3h-2V8zm-3 2h2v3H8v-3zm6 0h2v3h-2v-3z" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────
   Row 1: All Top Global Tech Companies
   Row 2: All Top Global Universities & Colleges
   ────────────────────────────────────────────────── */

const marqueeLogoCardsRow1 = [
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
          Mentors from top global companies & universities
        </h2>
        <p className="text-sm sm:text-base text-[var(--muted)] max-w-lg leading-relaxed">
          Get 1-on-1 guidance, JEE/NEET strategy, code reviews, and career coaching from leaders at top tech brands and elite institutions.
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