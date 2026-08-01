"use client";

/**
 * push.ts — Web Push notifications (replaces fcm.ts)
 *
 * Uses the native browser Push API with VAPID keys.
 * No Firebase dependency. Works with all modern browsers.
 *
 * Service worker: /push-sw.js (served from /public/push-sw.js)
 */
import { mutate } from "swr";
import api from "./api";

export { useNotificationPermission } from "./useNotificationPermission";
export type { PermissionState } from "./useNotificationPermission";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

/**
 * Convert a base64 VAPID public key to a Uint8Array
 * as required by PushManager.subscribe()
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if Web Push is supported by the browser.
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Request push permission and register the device with the backend.
 * Returns { granted: boolean, reason?: string }
 */
export async function requestPushPermissionAndRegister(): Promise<{
  granted: boolean;
  reason?: string;
}> {
  if (!isPushSupported()) {
    return { granted: false, reason: "unsupported" };
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn("[WebPush] NEXT_PUBLIC_VAPID_PUBLIC_KEY not configured.");
    return { granted: false, reason: "missing_vapid_key" };
  }

  // Request notification permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { granted: false, reason: permission };
  }

  try {
    // Register (or retrieve existing) service worker
    const registration = await navigator.serviceWorker.register("/push-sw.js", {
      scope: "/",
    });
    await navigator.serviceWorker.ready;

    // Retrieve existing subscription if browser is already subscribed
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Send subscription to backend
    await api.post("/users/me/devices", {
      pushSubscription: subscription.toJSON(),
      deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "web",
    });

    // Sync user preferences on backend
    try {
      await api.put("/users/me/notification-preferences", { pushNotifications: true });
      mutate((key: any) => Array.isArray(key) && key[0] === "/users/me/notification-preferences");
      mutate("/users/me/notification-preferences");
    } catch {
      // Ignored non-critical failure
    }

    return { granted: true };
  } catch (err: any) {
    console.warn("[WebPush] Subscription unavailable in current environment:", err?.message || err);
    return { granted: false, reason: err?.message || "subscription_failed" };
  }
}

/**
 * Unregister push notifications for this device.
 */
export async function unregisterPushSubscription(): Promise<void> {
  if (!isPushSupported()) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration("/push-sw.js");
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const subJson = subscription.toJSON();

        // Notify backend to remove the subscription
        await api.delete("/users/me/devices", {
          data: { pushSubscription: subJson },
        });

        // Unsubscribe from the push manager
        await subscription.unsubscribe();
      }
    }

    // Sync user preferences on backend
    try {
      await api.put("/users/me/notification-preferences", { pushNotifications: false });
      mutate((key: any) => Array.isArray(key) && key[0] === "/users/me/notification-preferences");
      mutate("/users/me/notification-preferences");
    } catch {
      // Ignored non-critical failure
    }
  } catch (err: any) {
    console.warn("[WebPush] Unregister failed:", err?.message);
  }
}

/**
 * Listen for foreground push messages via the service worker message channel.
 * Returns an unsubscribe function.
 */
export function listenForForegroundMessages(
  onNotify: (payload: { title?: string; body?: string }) => void
): () => void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return () => {};
  }

  const handler = (event: MessageEvent) => {
    if (event.data?.type === "PUSH_MESSAGE") {
      onNotify({
        title: event.data.title,
        body: event.data.body,
      });
    }
  };

  navigator.serviceWorker.addEventListener("message", handler);
  return () => navigator.serviceWorker.removeEventListener("message", handler);
}

