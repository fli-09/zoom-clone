"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { fetchHealthCheck } from "@/lib/api";

export interface TopBarProps {
  onSearch?: (query: string) => void;
  title?: string;
}

export function TopBar({ onSearch, title = "Meetings Dashboard" }: TopBarProps) {
  const [searchVal, setSearchVal] = useState("");
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchHealthCheck()
      .then((res) => {
        if (mounted) setIsBackendHealthy(res.status === "ok");
      })
      .catch(() => {
        if (mounted) setIsBackendHealthy(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="h-16 px-4 md:px-8 border-b border-dark-border bg-dark-bg/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 gap-4">
      {/* Page Title & Status */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-white tracking-tight hidden sm:block">
          {title}
        </h1>
        {isBackendHealthy !== null && (
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-dark-card border border-dark-border text-[11px] font-medium text-slate-400"
            title={
              isBackendHealthy
                ? "Backend connected and healthy"
                : "Backend connecting or unreachable"
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendHealthy ? "bg-emerald-500 shadow-xs shadow-emerald-500/50" : "bg-rose-500"
              }`}
            />
            <span className="hidden md:inline">
              {isBackendHealthy ? "Live Cloud Sync" : "Connecting..."}
            </span>
          </div>
        )}
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={handleChange}
            placeholder="Search meetings, recordings, participants..."
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-dark-surface/90 border border-dark-border text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-brand/60 focus:ring-1 focus:ring-brand/40 transition-all"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-dark-card border border-dark-border rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand" />
        </button>

        <div className="h-4 w-px bg-dark-border mx-1" />

        <div className="flex items-center gap-2 pl-1 cursor-pointer">
          <Avatar
            name="Default User"
            size="sm"
            status="online"
            className="ring-1 ring-white/10"
          />
        </div>
      </div>
    </header>
  );
}
