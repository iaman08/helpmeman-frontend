"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

let isTawkAllowedGlobal = false;

/**
 * Set whether the floating Tawk.to widget is allowed to be visible.
 * When false, the widget bubble is hidden.
 */
export function setTawkVisibility(allowed: boolean) {
  isTawkAllowedGlobal = allowed;
  if (typeof window === "undefined") return;

  (window as any).__TAWK_ALLOWED = allowed;

  const apply = () => {
    const api = (window as any).Tawk_API;
    if (api) {
      try {
        if ((window as any).__TAWK_ALLOWED) {
          api.showWidget?.();
        } else {
          api.hideWidget?.();
        }
      } catch (e) {
        // Tawk might not be ready yet
      }
    }
  };

  apply();
  // Safe retry ticks while script initializes
  setTimeout(apply, 300);
  setTimeout(apply, 1000);
}

/**
 * Programmatically open and maximize the Tawk.to live chat widget.
 */
export function openTawkChat() {
  if (typeof window === "undefined") return;

  setTawkVisibility(true);
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
  const pathname = usePathname();

  // If navigating away from settings pages, ensure the floating widget is hidden
  useEffect(() => {
    if (pathname !== "/dashboard/settings" && pathname !== "/mentor/settings") {
      setTawkVisibility(false);
    }
  }, [pathname]);

  return (
    <Script
      id="tawk-to-script"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          Tawk_API.onLoad = function(){
            if (window.__TAWK_ALLOWED) {
              try { Tawk_API.showWidget(); } catch(e){}
            } else {
              try { Tawk_API.hideWidget(); } catch(e){}
            }
          };
          Tawk_API.onChatMinimized = function(){
            if (!window.__TAWK_ALLOWED) {
              try { Tawk_API.hideWidget(); } catch(e){}
            }
          };
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
