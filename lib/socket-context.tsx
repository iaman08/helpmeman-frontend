"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth-context";
import { mutate } from "swr";
import { useToast } from "@/components/Toast";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();

  // Keep toast in a stable ref so it never triggers a socket reconnect
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; });

  // Only depend on user?.id — the user object reference changes on every setUser()
  // call (e.g. after hydrate or Google sync), which was tearing down and recreating
  // the socket on every tab return. Using the stable primitive ID prevents this.
  const userId = user?.id ?? null;

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("helpmeman.accessToken") : null;

    if (!userId || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // Already connected for this user — don't reconnect
    if (socketRef.current?.connected) return;

    const getSocketUrl = () => {
      if (typeof window === "undefined") return "http://localhost:8080";
      if (
        window.location.hostname.includes("vercel.app") ||
        window.location.hostname.includes("helpmeman.com")
      ) {
        return "https://helpmeman-backend-7r53z.ondigitalocean.app";
      }
      return process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";
    };

    const socket = io(getSocketUrl(), {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.3,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log("[GLOBAL SOCKET] Connected:", socket.id);

      // Request notification permission if not asked yet
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission();
        }
      }
    });

    socket.on("disconnect", (reason) => {
      setConnected(false);
      console.log("[GLOBAL SOCKET] Disconnected:", reason);
    });

    // Global listener for new messages (to show notifications and update badges)
    socket.on("new_message_notification", (data: { threadId: string; message: any }) => {
      // Trigger SWR mutate to update unread counts
      mutate(["/chat/unread-count", userId]);

      // Mutate threads list
      mutate(["/chat/threads", userId]);

      // Only alert if the message is NOT sent by us
      if (data.message.senderId !== userId) {
        const isChatOpen = window.location.pathname.includes("/chat");
        const isTabInactive = document.hidden;

        if (isTabInactive || !isChatOpen) {
          // Trigger browser notification
          if (Notification.permission === "granted") {
            const title = data.message.senderRole === "MENTOR" ? "New message from Mentor" : "New message from Student";
            new Notification(title, {
              body: data.message.body || "📎 Attachment",
              icon: "/favicon.ico",
            });
          } else {
            // Fallback toast inside the app if browser permission not granted
            toastRef.current(`New message: ${data.message.body || "📎 Attachment"}`, "info");
          }
        }
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [userId]); // Only reconnect when the actual user ID changes, not on user object ref changes

  // Stabilize context value — avoid creating a new object on every render.
  // useMemo here ensures consumers only re-render when connected state actually changes.
  const value = useMemo<SocketContextType>(
    () => ({ socket: socketRef.current, connected }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connected, userId]
  );

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
