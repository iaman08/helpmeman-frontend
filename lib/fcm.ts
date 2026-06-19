"use client";

import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage, type Messaging } from "firebase/messaging";
import api from "./api";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let messaging: Messaging | null = null;

export async function initMessaging() {
  if (typeof window === "undefined") return null;
  const supported = await isSupported().catch(() => false);
  if (!supported || !firebaseConfig.apiKey) return null;

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  messaging = getMessaging(app);
  return messaging;
}

export async function requestPushPermissionAndRegister() {
  const instance = await initMessaging();
  if (!instance) return { granted: false, reason: "unsupported" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { granted: false, reason: permission };

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) return { granted: false, reason: "missing_vapid_key" };

  const token = await getToken(instance, {
    vapidKey,
    serviceWorkerRegistration: await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" }),
  });

  if (!token) return { granted: false, reason: "no_token" };

  await api.post("/users/me/devices", {
    fcmToken: token,
    deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "web",
  });

  return { granted: true, token };
}

export async function unregisterPushToken(token: string) {
  await api.delete("/users/me/devices", { data: { fcmToken: token } });
}

export function listenForForegroundMessages(onNotify: (payload: { title?: string; body?: string }) => void) {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    onNotify({
      title: payload.notification?.title,
      body: payload.notification?.body,
    });
  });
}
