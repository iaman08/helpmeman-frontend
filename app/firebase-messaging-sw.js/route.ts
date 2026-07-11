/**
 * This route previously served a Firebase Cloud Messaging service worker script.
 * Firebase has been completely removed from HelpMeMan.
 *
 * The new push notification service worker is at /push-sw.js (public/push-sw.js).
 * This route returns an empty, no-op script for backward compatibility in case
 * any cached browsers still request this URL.
 */
export async function GET() {
  const script = `
// Firebase Cloud Messaging has been removed.
// Push notifications are now handled by /push-sw.js
// This file is kept for backward compatibility only.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
`.trim();

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Service-Worker-Allowed": "/",
      "Cache-Control": "no-cache",
    },
  });
}
