"use client";

import React from "react";
import Link from "next/link";
import { Video, Settings, User } from "lucide-react";

/**
 * Navbar Component
 * Zoom-style header with logo, user profile avatar placeholder, and settings placeholder.
 */
export function Navbar() {
  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 rounded-xl bg-[#0E71EB] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
          <Video className="w-5 h-5 fill-white" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold tracking-tight text-[#0E71EB]">
            zoom
          </span>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-1">
            Workplace
          </span>
        </div>
      </Link>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        <div
          className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          title="Profile"
          aria-label="Profile"
        >
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
