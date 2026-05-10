import { clsx } from "clsx";

const styles: Record<string, string> = {
  PENDING: "bg-yellow-500/12 text-yellow-600",
  APPROVED: "bg-emerald-500/12 text-emerald-600",
  CONFIRMED: "bg-emerald-500/12 text-emerald-600",
  COMPLETED: "bg-indigo-500/12 text-indigo-600",
  REJECTED: "bg-red-500/12 text-red-600",
  CANCELLED: "bg-red-500/12 text-red-600",
  NO_SHOW: "bg-red-500/12 text-red-600",
  PAID: "bg-emerald-500/12 text-emerald-600",
  UNPAID: "bg-yellow-500/12 text-yellow-600",
  REFUNDED: "bg-indigo-500/12 text-indigo-600",
  OPEN: "bg-emerald-500/12 text-emerald-600",
  LOCKED: "bg-yellow-500/12 text-yellow-600",
  BOOKED: "bg-indigo-500/12 text-indigo-600",
  CLOSED: "bg-(--fg)/8 text-(--fg)/60",
};

type Props = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className }: Props) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider",
        styles[status] ?? "bg-(--fg)/8 text-(--fg)/60",
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
