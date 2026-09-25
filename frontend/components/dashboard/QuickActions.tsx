"use client";

import React from "react";
import { Video, Plus, Calendar, ScreenShare } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickActionsProps {
  onNewMeeting: () => void;
  onJoinMeeting: () => void;
  onScheduleMeeting: () => void;
  onShareScreen?: () => void;
  isStartingInstant?: boolean;
}

export function QuickActions({
  onNewMeeting,
  onJoinMeeting,
  onScheduleMeeting,
  onShareScreen,
  isStartingInstant = false,
}: QuickActionsProps) {
  const actions = [
    {
      id: "new",
      title: "New Meeting",
      description: "Start instant meeting room",
      icon: Video,
      color: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
      iconBg: "bg-amber-500/15 text-amber-400 group-hover:bg-amber-500 group-hover:text-white",
      onClick: onNewMeeting,
      loading: isStartingInstant,
    },
    {
      id: "join",
      title: "Join Meeting",
      description: "Via invite link or Room ID",
      icon: Plus,
      color: "bg-brand hover:bg-brand-hover shadow-brand/20",
      iconBg: "bg-brand/15 text-brand-hover group-hover:bg-brand group-hover:text-white",
      onClick: onJoinMeeting,
    },
    {
      id: "schedule",
      title: "Schedule",
      description: "Plan for future calendar date",
      icon: Calendar,
      color: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20",
      iconBg: "bg-indigo-500/15 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white",
      onClick: onScheduleMeeting,
    },
    {
      id: "share",
      title: "Share Screen",
      description: "Show presentation or screen",
      icon: ScreenShare,
      color: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
      iconBg: "bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white",
      onClick: onShareScreen || onJoinMeeting,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.id}
            onClick={act.onClick}
            disabled={act.loading}
            className={cn(
              "group relative flex flex-col items-center sm:items-start p-4 sm:p-5 rounded-2xl border border-dark-border bg-dark-surface hover:bg-dark-card hover:border-slate-700 transition-all duration-200 text-left shadow-card active:scale-[0.98] disabled:opacity-50"
            )}
          >
            {/* Top Icon Box */}
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 mb-3",
                act.iconBg
              )}
            >
              <Icon className="w-6 h-6 transition-transform group-hover:scale-110" />
            </div>

            {/* Label & Description */}
            <div className="w-full text-center sm:text-left">
              <span className="block text-sm font-semibold text-slate-100 group-hover:text-white">
                {act.title}
              </span>
              <span className="hidden sm:block text-[11px] text-slate-400 mt-0.5 truncate">
                {act.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
