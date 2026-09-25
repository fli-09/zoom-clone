"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Video,
  Home,
  CalendarDays,
  Clock,
  Film,
  Users,
  Settings,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

export interface SidebarProps {
  onOpenCalendar?: () => void;
  onOpenRecordings?: () => void;
  onOpenContacts?: () => void;
  onOpenSettings?: () => void;
}

/**
 * Sidebar Component (Desktop App Shell)
 * Provides 240px wide SaaS navigation with interactive Calendar, Recordings, Contacts, and Settings drawers.
 */
export function Sidebar({
  onOpenCalendar,
  onOpenRecordings,
  onOpenContacts,
  onOpenSettings,
}: SidebarProps) {
  const pathname = usePathname();

  const handleNavClick = (e: React.MouseEvent, action?: () => void) => {
    if (action) {
      e.preventDefault();
      action();
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 h-screen bg-dark-surface border-r border-dark-border select-none shrink-0 sticky top-0 z-30">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center border-b border-dark-border">
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
        >
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
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Navigation
        </div>

        {/* Home */}
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group",
            pathname === "/"
              ? "bg-brand/12 text-white border border-brand/20 shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          )}
        >
          <Home
            className={cn(
              "w-4 h-4 transition-colors",
              pathname === "/"
                ? "text-brand-hover"
                : "text-slate-400 group-hover:text-slate-200"
            )}
          />
          <span>Home</span>
        </Link>

        {/* Meetings */}
        <Link
          href="/#upcoming"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-150 group"
        >
          <Clock className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
          <span>Meetings</span>
        </Link>

        {/* Calendar (Interactive Modal) */}
        <button
          onClick={(e) => handleNavClick(e, onOpenCalendar)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-150 group text-left"
        >
          <div className="flex items-center gap-3">
            <CalendarDays className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
            <span>Calendar</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-dark-bg border border-dark-border text-slate-400">
            View
          </span>
        </button>

        {/* Recordings (Interactive Modal) */}
        <button
          onClick={(e) => handleNavClick(e, onOpenRecordings)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-150 group text-left"
        >
          <div className="flex items-center gap-3">
            <Film className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
            <span>Recordings</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-dark-bg border border-dark-border text-slate-400">
            Cloud
          </span>
        </button>

        {/* Contacts (Interactive Modal) */}
        <button
          onClick={(e) => handleNavClick(e, onOpenContacts)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-150 group text-left"
        >
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
            <span>Contacts</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </button>

        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Support & Tools
        </div>

        {/* Settings (Interactive Modal) */}
        <button
          onClick={(e) => handleNavClick(e, onOpenSettings)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-150 group text-left"
        >
          <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
          <span>Settings</span>
        </button>

        {/* Help & Swagger Documentation */}
        <a
          href="https://zoom-clone-backend-uot2.onrender.com/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-150 group"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
            <span>API Docs</span>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100" />
        </a>
      </nav>

      {/* User Profile Footer (Clickable to open Settings) */}
      <div className="p-3 border-t border-dark-border bg-dark-bg/40">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group text-left"
          title="Open Settings"
        >
          <Avatar
            name="Default User"
            size="sm"
            status="online"
            className="ring-1 ring-white/10"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
              Default User
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              user@example.com
            </p>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
        </button>
      </div>
    </aside>
  );
}
