import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      {icon && (
        <div className="flex items-center justify-center text-[var(--fg)]">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-xl" style={{ color: "var(--fg)" }}>{title}</h3>
        {description && (
          <p className="text-sm max-w-sm" style={{ color: "var(--muted)" }}>{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
