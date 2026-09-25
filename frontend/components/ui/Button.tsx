import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 select-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-brand hover:bg-brand-hover text-white shadow-md shadow-brand/25 border border-brand/20",
      secondary:
        "bg-dark-card hover:bg-dark-hover text-slate-200 border border-dark-border shadow-xs",
      destructive:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25 border border-rose-500/20",
      ghost:
        "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white",
      outline:
        "bg-transparent border border-dark-border hover:bg-dark-card text-slate-300 hover:text-white",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5 font-semibold",
      icon: "h-10 w-10 p-0 text-sm",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
