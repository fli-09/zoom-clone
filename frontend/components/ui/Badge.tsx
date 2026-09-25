import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brand" | "success" | "warning" | "danger" | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-800 text-slate-300 border-slate-700/60",
    brand: "bg-brand/15 text-blue-400 border-brand/25",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    danger: "bg-rose-500/15 text-rose-400 border-rose-500/25",
    outline: "bg-transparent text-slate-300 border-dark-border",
  };

  const dotStyles = {
    default: "bg-slate-400",
    brand: "bg-blue-400 animate-pulse",
    success: "bg-emerald-400 animate-pulse",
    warning: "bg-amber-400",
    danger: "bg-rose-400 animate-pulse",
    outline: "bg-slate-400",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] gap-1 font-medium",
    md: "px-2.5 py-1 text-xs gap-1.5 font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border leading-none select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotStyles[variant])}
        />
      )}
      {children}
    </span>
  );
}
