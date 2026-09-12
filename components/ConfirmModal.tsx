"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, AlertTriangle, Info, X, Loader2 } from "lucide-react";

export type ConfirmVariant = "danger" | "warning" | "info" | "primary";

export interface ConfirmOptions {
  title?: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: ReactNode;
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
  icon?: ReactNode;
}

// ── Standalone Declarative Component ──────────────────────────────────────────
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmText,
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  icon,
}: ConfirmModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus the confirm button when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  const defaultConfirmText =
    confirmText || (variant === "danger" ? "Delete" : "Confirm");

  const renderIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case "danger":
        return <Trash2 className="w-6 h-6 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      case "info":
      case "primary":
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getIconContainerStyle = () => {
    switch (variant) {
      case "danger":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "info":
      case "primary":
      default:
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
    }
  };

  const getConfirmButtonStyle = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-500 shadow-red-500/25";
      case "warning":
        return "bg-amber-600 hover:bg-amber-500 shadow-amber-500/25";
      case "info":
      case "primary":
      default:
        return "bg-blue-600 hover:bg-blue-500 shadow-blue-500/25";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !isLoading && onClose()}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.05 }}
            className="relative w-full max-w-md bg-[color:var(--bg)] text-[color:var(--fg)] border border-[color:var(--hairline)] rounded-3xl p-6 sm:p-7 shadow-2xl z-10 overflow-hidden"
          >
            {/* Close (X) button */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-5 right-5 p-1.5 rounded-full text-[color:var(--muted)] hover:text-[color:var(--fg)] hover:bg-[color:var(--fg)]/5 transition-colors cursor-pointer disabled:opacity-40"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon & Title */}
            <div className="flex flex-col items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getIconContainerStyle()}`}
              >
                {renderIcon()}
              </div>

              <div className="space-y-1.5 pr-6">
                <h3
                  id="confirm-modal-title"
                  className="text-lg sm:text-xl font-bold tracking-tight text-[color:var(--fg)]"
                >
                  {title}
                </h3>
                {message && (
                  <div className="text-xs sm:text-sm text-[color:var(--muted)] leading-relaxed">
                    {message}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-[color:var(--hairline)] text-[color:var(--fg)] bg-transparent hover:bg-[color:var(--fg)]/5 transition-all cursor-pointer text-center disabled:opacity-40"
              >
                {cancelText}
              </button>
              <button
                ref={confirmButtonRef}
                type="button"
                disabled={isLoading}
                onClick={onConfirm}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-center disabled:opacity-60 ${getConfirmButtonStyle()}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  defaultConfirmText
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Context & Hook Provider ───────────────────────────────────────────────────
interface ConfirmContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant: ConfirmVariant;
    icon?: ReactNode;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "danger",
  });

  const [isLoading, setIsLoading] = useState(false);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;

      if (typeof options === "string") {
        const isDelete =
          /delete|remove|destroy|trash|clear|cancel/i.test(options);
        setModalState({
          isOpen: true,
          title: isDelete ? "Confirm Deletion" : "Confirm Action",
          message: options,
          confirmText: isDelete ? "Delete" : "Confirm",
          cancelText: "Cancel",
          variant: isDelete ? "danger" : "warning",
        });
      } else {
        const isDelete =
          options.variant === "danger" ||
          (options.title && /delete|remove/i.test(options.title)) ||
          (typeof options.message === "string" &&
            /delete|remove/i.test(options.message));

        setModalState({
          isOpen: true,
          title: options.title || (isDelete ? "Confirm Deletion" : "Are you sure?"),
          message: options.message,
          confirmText:
            options.confirmText || (isDelete ? "Delete" : "Confirm"),
          cancelText: options.cancelText || "Cancel",
          variant: options.variant || (isDelete ? "danger" : "warning"),
          icon: options.icon,
        });
      }
    });
  }, []);

  const handleClose = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    setIsLoading(false);
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    setIsLoading(false);
    if (resolveRef.current) {
      resolveRef.current(true);
      resolveRef.current = null;
    }
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        variant={modalState.variant}
        isLoading={isLoading}
        icon={modalState.icon}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    // Fallback gracefully to window.confirm if used outside provider
    return async (options: ConfirmOptions | string) => {
      const msg =
        typeof options === "string"
          ? options
          : typeof options.message === "string"
          ? options.message
          : "Are you sure?";
      return typeof window !== "undefined" ? window.confirm(msg) : true;
    };
  }
  return context.confirm;
}
