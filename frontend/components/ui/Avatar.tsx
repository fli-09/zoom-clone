import React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string | null;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "busy" | "offline";
}

const BG_COLORS = [
  "bg-blue-600",
  "bg-purple-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-indigo-600",
  "bg-teal-600",
  "bg-cyan-600",
];

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColor(name?: string | null): string {
  if (!name) return BG_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BG_COLORS[Math.abs(hash) % BG_COLORS.length];
}

export function Avatar({
  name,
  src,
  size = "md",
  status,
  className,
  ...props
}: AvatarProps) {
  const sizeStyles = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };

  const statusSize = {
    xs: "w-1.5 h-1.5 bottom-0 right-0",
    sm: "w-2 h-2 bottom-0 right-0",
    md: "w-2.5 h-2.5 bottom-0 right-0",
    lg: "w-3.5 h-3.5 bottom-0.5 right-0.5",
    xl: "w-4 h-4 bottom-1 right-1",
  };

  const statusColor = {
    online: "bg-emerald-500",
    busy: "bg-rose-500",
    offline: "bg-slate-500",
  };

  const initials = getInitials(name);
  const bgColor = getColor(name);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full font-semibold select-none shrink-0 overflow-hidden",
        sizeStyles[size],
        !src && bgColor,
        !src && "text-white",
        className
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name || "User avatar"}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span>{initials}</span>
      )}

      {status && (
        <span
          className={cn(
            "absolute rounded-full ring-2 ring-dark-surface",
            statusSize[size],
            statusColor[status]
          )}
        />
      )}
    </div>
  );
}
