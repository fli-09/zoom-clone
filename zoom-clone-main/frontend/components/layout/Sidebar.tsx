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

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Meetings", href: "/#upcoming", icon: Clock },
  { label: "Calendar", href: "/#calendar", icon: CalendarDays },
  { label: "Recordings", href: "/#recordings", icon: Film },
  { label: "Contacts", href: "/#contacts", icon: Users },
];

const SECONDARY_ITEMS = [
  { label: "Settings", href: "/#settings", icon: Settings },
  {
    label: "Help & Docs",
    href: "https://zoom-clone-backend-uot2.onrender.com/docs",
    icon: HelpCircle,
    external: true,
  },
];

/**
 * Sidebar Component (Desktop App Shell)
 * Provides 240px wide SaaS navigation with logo, navigation links, and user profile drawer.
 */
export function Sidebar() {
  const pathname = usePathname();

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

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href === "/" && pathname === "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group",
                isActive
                  ? "bg-brand/12 text-white border border-brand/20 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive
                    ? "text-brand-hover"
                    : "text-slate-400 group-hover:text-slate-200"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Support & Tools
        </div>

        {SECONDARY_ITEMS.map((item) => {
          const Icon = item.icon;
          return item.external ? (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-150 group"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
                <span>{item.label}</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100" />
            </a>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-150 group"
            >
              <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-dark-border bg-dark-bg/40">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
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
        </div>
      </div>
    </aside>
  );
}
