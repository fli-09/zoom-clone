"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Bell, Settings, Film, ExternalLink, Check, LogOut, CheckCircle2, UserCheck } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { fetchHealthCheck } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

export interface TopBarProps {
  onSearch?: (query: string) => void;
  title?: string;
  onOpenSettings?: () => void;
  onOpenRecordings?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

export function TopBar({
  onSearch,
  title = "Meetings Dashboard",
  onOpenSettings,
  onOpenRecordings,
}: TopBarProps) {
  const { success, info } = useToast();
  const [searchVal, setSearchVal] = useState("");
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  // Dropdown states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userStatus, setUserStatus] = useState<"online" | "busy" | "away">("online");

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Notifications list
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n1",
      title: "Team Sync Ready",
      desc: "Cloud recording for 'Architecture & API Schema Sync' is processed and ready.",
      time: "10m ago",
      read: false,
    },
    {
      id: "n2",
      title: "WebRTC Mesh Active",
      desc: "Ultra-low latency peer connections connected with host video feed.",
      time: "1h ago",
      read: false,
    },
    {
      id: "n3",
      title: "Calendar Reminder",
      desc: "Review your upcoming meetings for the week in the Calendar view.",
      time: "3h ago",
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    info("All notifications marked as read");
  };

  const handleNotificationClick = (n: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
    );
    if (n.id === "n1" && onOpenRecordings) {
      setIsNotifOpen(false);
      onOpenRecordings();
    }
  };

  return (
    <header className="h-16 px-4 md:px-8 border-b border-dark-border bg-dark-bg/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 gap-4">
      {/* Page Title & Status */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-white tracking-tight hidden sm:block">
          {title}
        </h1>
        <div
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-dark-card border border-dark-border text-[11px] font-medium text-slate-400 min-w-[105px] h-6 transition-all duration-200"
          title={
            isBackendHealthy === null
              ? "Connecting to backend..."
              : isBackendHealthy
              ? "Backend connected and healthy"
              : "Backend connecting or unreachable"
          }
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isBackendHealthy === null
                ? "bg-amber-400 animate-pulse"
                : isBackendHealthy
                ? "bg-emerald-500 shadow-xs shadow-emerald-500/50"
                : "bg-rose-500"
            }`}
          />
          <span className="hidden md:inline truncate">
            {isBackendHealthy === null
              ? "Connecting..."
              : isBackendHealthy
              ? "Live Cloud Sync"
              : "Offline"}
          </span>
        </div>
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
        {/* Notifications Icon Button & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className={`p-2 rounded-xl transition-colors relative ${
              isNotifOpen
                ? "bg-brand/15 text-brand-hover"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-dark-surface border border-dark-border shadow-2xl p-3 z-50 animate-slide-up">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-dark-border px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-brand/20 text-brand-hover text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-brand-hover hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                      item.read
                        ? "bg-dark-bg/40 hover:bg-dark-bg/80 opacity-75"
                        : "bg-dark-bg border border-brand/20 hover:border-brand/40"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span>{item.title}</span>
                      <span className="text-[10px] text-slate-500">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-dark-border mx-1" />

        {/* User Profile Avatar & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 pl-1 cursor-pointer focus:outline-hidden group"
            title="User Profile & Settings"
          >
            <Avatar
              name="Default User"
              size="sm"
              status={userStatus}
              className="ring-1 ring-white/10 group-hover:ring-brand transition-all"
            />
          </button>

          {/* User Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-dark-surface border border-dark-border shadow-2xl p-2 z-50 animate-slide-up">
              {/* Profile Card Header */}
              <div className="p-3 rounded-xl bg-dark-bg/60 border border-dark-border mb-2">
                <div className="flex items-center gap-2.5">
                  <Avatar name="Default User" size="md" status={userStatus} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">Default User</p>
                    <p className="text-[11px] text-slate-400 truncate">user@example.com</p>
                    <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded bg-brand/20 text-brand-hover">
                      Zoom Pro
                    </span>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="mt-3 pt-2.5 border-t border-dark-border/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Status:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setUserStatus("online");
                        success("Status set to Available");
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        userStatus === "online" ? "bg-emerald-500/20 text-emerald-400 font-bold" : "text-slate-400"
                      }`}
                    >
                      Online
                    </button>
                    <button
                      onClick={() => {
                        setUserStatus("busy");
                        success("Status set to Busy");
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        userStatus === "busy" ? "bg-rose-500/20 text-rose-400 font-bold" : "text-slate-400"
                      }`}
                    >
                      Busy
                    </button>
                    <button
                      onClick={() => {
                        setUserStatus("away");
                        success("Status set to Away");
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        userStatus === "away" ? "bg-amber-500/20 text-amber-400 font-bold" : "text-slate-400"
                      }`}
                    >
                      Away
                    </button>
                  </div>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="space-y-0.5 text-xs">
                {onOpenSettings && (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings & Preferences</span>
                  </button>
                )}

                {onOpenRecordings && (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onOpenRecordings();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    <Film className="w-4 h-4 text-slate-400" />
                    <span>My Cloud Recordings</span>
                  </button>
                )}

                <a
                  href="https://zoom-clone-backend-uot2.onrender.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>API Swagger Docs</span>
                  </div>
                </a>

                <div className="my-1 border-t border-dark-border" />

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    success("Session refreshed");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
