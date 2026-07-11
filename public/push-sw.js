/**
 * push-sw.js — Web Push Service Worker
 *
 * Replaces firebase-messaging-sw.js entirely.
 * No Firebase CDN imports. Uses native Push API.
 */

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "HelpMeMan", body: event.data.text() };
  }

  const title = payload.title || "HelpMeMan";
  const options = {
    body: payload.body || "You have a new notification",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: payload.data || {},
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));

  // Notify any open pages (foreground listener in push.ts)
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "PUSH_MESSAGE",
          title,
          body: options.body,
          data: options.data,
        });
      });
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification.data?.link || "/dashboard/notifications";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(link);
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(link);
      }
    })
  );
});

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
