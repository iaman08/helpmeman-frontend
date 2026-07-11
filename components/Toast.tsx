"use client";

import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastCtx | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-[90vw] sm:max-w-sm">
        {toasts.map((t) => (
          <ToastItem key={t.id} data={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ data, onDismiss }: { data: ToastData; onDismiss: (id: number) => void }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance
    requestAnimationFrame(() => setVisible(true));

    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(data.id), 300);
    }, 3500);

    return () => clearTimeout(timer);
  }, [data.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />,
    error: <XCircle className="h-5 w-5 shrink-0 text-red-500" />,
    info: <Info className="h-5 w-5 shrink-0 text-blue-500" />,
  };

  const borderColor = {
    success: "border-emerald-500/30",
    error: "border-red-500/30",
    info: "border-blue-500/30",
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-xl transition-all duration-300 ${borderColor[data.type]} ${
        visible && !exiting
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
      style={{ background: "var(--bg)", color: "var(--fg)" }}
    >
      {icons[data.type]}
      <span className="text-sm font-medium flex-1">{data.message}</span>
      <button
        type="button"
        onClick={() => {
          setExiting(true);
          setTimeout(() => onDismiss(data.id), 300);
        }}
        className="p-1 rounded-full hover:bg-(--fg)/10 transition-colors cursor-pointer shrink-0"
      >
        <X className="h-3.5 w-3.5 text-(--muted)" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
