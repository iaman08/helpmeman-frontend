"use client";

import { useEffect, useState, useCallback } from "react";

export type PermissionState = "granted" | "denied" | "default" | "unsupported";

function mapPermissionState(state: string): PermissionState {
  if (state === "prompt") return "default";
  if (state === "granted" || state === "denied" || state === "default") {
    return state as PermissionState;
  }
  return "default";
}

export function useNotificationPermission(): {
  permission: PermissionState;
  isSupported: boolean;
  refreshPermission: () => void;
} {
  const [permission, setPermission] = useState<PermissionState>(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return mapPermissionState(Notification.permission);
  });

  const refreshPermission = useCallback(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(mapPermissionState(Notification.permission));
    } else {
      setPermission("unsupported");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    setPermission(mapPermissionState(Notification.permission));

    let permStatus: PermissionStatus | null = null;

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "notifications" as PermissionName })
        .then((status) => {
          permStatus = status;
          setPermission(mapPermissionState(status.state));

          const handleChange = () => {
            setPermission(mapPermissionState(status.state));
          };

          status.addEventListener("change", handleChange);
        })
        .catch(() => {
          // Fallback if permission query is not supported
        });
    }

    return () => {
      if (permStatus) {
        permStatus.onchange = null;
      }
    };
  }, []);

  return {
    permission,
    isSupported: permission !== "unsupported",
    refreshPermission,
  };
}
