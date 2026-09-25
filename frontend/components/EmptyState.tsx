"use client";

import React from "react";
import { LucideIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

/**
 * EmptyState Component
 * Displays helpful empty placeholders with an optional action button.
 */
export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Calendar,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border border-dashed border-dark-border bg-dark-surface/40 text-center">
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
