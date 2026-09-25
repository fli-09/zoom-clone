"use client";

import React from "react";
import Link from "next/link";
import { Video, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

/**
 * Navbar Component
 * Minimalist top navbar with logo, settings placeholder, and user profile avatar.
 */
export function Navbar() {
  return (
    <header className="h-16 px-6 border-b border-dark-border bg-dark-surface/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center text-white shadow-md shadow-brand/30 transition-transform group-hover:scale-105">
          <Video className="w-4 h-4 fill-white" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold tracking-tight text-white">
            zoom
          </span>
          <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand/15 text-brand-hover border border-brand/20">
            Pro
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer">
          <Avatar name="Default User" size="sm" status="online" />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
