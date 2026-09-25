"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MobileNavProps {
  onOpenCalendar?: () => void;
  onOpenSettings?: () => void;
}

export function MobileNav({ onOpenCalendar, onOpenSettings }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-dark-surface/95 backdrop-blur-md border-t border-dark-border z-40 px-6 flex items-center justify-around">
      {/* Home */}
      <Link
        href="/"
        className={cn(
          "flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors",
          pathname === "/" ? "text-brand-hover" : "text-slate-400 hover:text-slate-200"
        )}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </Link>

      {/* Meetings */}
      <Link
        href="/#upcoming"
        className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Clock className="w-5 h-5" />
        <span>Meetings</span>
      </Link>

      {/* Calendar */}
      <button
        onClick={onOpenCalendar}
        className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Calendar className="w-5 h-5" />
        <span>Calendar</span>
      </button>

      {/* Settings */}
      <button
        onClick={onOpenSettings}
        className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </button>
    </nav>
  );
}
