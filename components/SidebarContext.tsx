"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
}

const STORAGE_KEY = "helpmeman.sidebarCollapsed";

let globalCollapsed = false;
if (typeof window !== "undefined") {
  try {
    globalCollapsed = localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    // Ignore localStorage errors
  }
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return globalCollapsed;
}

function getServerSnapshot() {
  return false;
}

export function setSidebarCollapsed(value: boolean | ((prev: boolean) => boolean)) {
  const next = typeof value === "function" ? value(globalCollapsed) : value;
  globalCollapsed = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Ignore localStorage errors
    }
  }
  listeners.forEach((listener) => listener());
}

export function toggleSidebar() {
  setSidebarCollapsed(!globalCollapsed);
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isCollapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value: SidebarContextType = {
    isCollapsed,
    setIsCollapsed: setSidebarCollapsed,
    toggleSidebar,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextType {
  const isCollapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    isCollapsed,
    setIsCollapsed: setSidebarCollapsed,
    toggleSidebar,
  };
}
