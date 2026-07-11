"use client";

import { useEffect, useState } from "react";

interface AvatarProps {
  name: string;
  url?: string | null;
  size?: "sm" | "md" | "lg" | "xl" | "xs" | "custom";
  className?: string;
  style?: React.CSSProperties;
}

export function Avatar({ name, url, size = "md", className = "", style }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  // When the avatar URL changes (e.g. user updates their profile photo),
  // reset the error state to allow retrying the load.
  useEffect(() => {
    setImgError(false);
  }, [url]);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  const sizeClasses = {
    xs: "h-6 w-6 text-[9px] font-semibold",
    sm: "h-8 w-8 text-[11px] font-semibold",
    md: "h-9 w-9 text-xs font-semibold",
    lg: "h-10 w-10 text-sm font-semibold",
    xl: "h-11 w-11 text-sm font-semibold",
    custom: "",
  };

  const selectedSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden flex items-center justify-center border border-(--hairline) select-none transition-all duration-200 ${selectedSizeClass} ${
        !url || imgError
          ? "bg-gradient-to-br from-(--fg)/10 to-(--fg)/20 text-(--fg)/80"
          : "bg-transparent"
      } ${className}`}
      style={style}
    >
      {url && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={name}
          className="h-full w-full object-cover rounded-full"
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
