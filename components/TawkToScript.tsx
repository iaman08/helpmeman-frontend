"use client";

import Script from "next/script";

/**
 * Programmatically open and maximize the Tawk.to live chat widget.
 */
export function openTawkChat() {
  if (typeof window === "undefined") return;

  const tawk = (window as any).Tawk_API;
  if (tawk && typeof tawk.maximize === "function") {
    try {
      tawk.showWidget?.();
      tawk.maximize();
    } catch (e) {
      console.warn("[Tawk.to] Failed to maximize chat widget:", e);
    }
  } else {
    // If the widget script is still loading in background, queue the maximize action
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    const existingOnLoad = (window as any).Tawk_API.onLoad;
    (window as any).Tawk_API.onLoad = function () {
      if (typeof existingOnLoad === "function") existingOnLoad();
      try {
        (window as any).Tawk_API.showWidget?.();
        (window as any).Tawk_API.maximize?.();
      } catch (e) {}
    };
  }
}

export function TawkToScript() {
  return (
    <Script
      id="tawk-to-script"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
          var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='https://embed.tawk.to/6a929072c0efda343cbce218/1k1688glk';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
          })();
        `,
      }}
    />
  );
}
