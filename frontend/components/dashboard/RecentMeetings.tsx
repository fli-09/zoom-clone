"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Clock, History, Copy, Check, ArrowUpRight } from "lucide-react";
import { MeetingResponse } from "@/lib/types";
import { formatMeetingDate, formatDuration, copyToClipboard } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

export interface RecentMeetingsProps {
  meetings: MeetingResponse[];
  isLoading?: boolean;
}

export function RecentMeetings({ meetings, isLoading = false }: RecentMeetingsProps) {
  const { success } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = async (e: React.MouseEvent, roomId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = `${origin}/meeting/${roomId}`;
    const ok = await copyToClipboard(inviteUrl);
    if (ok) {
      setCopiedId(roomId);
      success("Invite link copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="divide-y divide-dark-border/60 rounded-2xl border border-dark-border bg-dark-surface overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[68px] p-4 flex items-center justify-between animate-pulse"
          >
            <div className="flex items-center gap-3.5 w-1/2">
              <div className="w-9 h-9 rounded-xl bg-white/5 shrink-0" />
              <div className="space-y-1.5 w-full">
                <div className="h-3 w-3/4 bg-white/5 rounded" />
                <div className="h-2.5 w-1/2 bg-white/5 rounded" />
              </div>
            </div>
            <div className="h-7 w-20 bg-white/5 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="rounded-2xl border border-dark-border bg-dark-surface/40 p-8 text-center">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-500">
          <History className="w-5 h-5" />
        </div>
        <p className="text-xs font-medium text-slate-300">No past meetings recorded</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Concluded and ended meetings will automatically be archived here.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-dark-border/60 rounded-2xl border border-dark-border bg-dark-surface overflow-hidden">
      {meetings.map((m) => {
        const { date, time } = formatMeetingDate(m.start_time);
        const durationText = formatDuration(m.duration);
        const isCopied = copiedId === m.room_id;

        return (
          <div
            key={m.id}
            className="flex items-center justify-between p-4 hover:bg-dark-card/60 transition-colors group gap-4"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-slate-200 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                    {m.title}
                  </h4>
                  <Badge variant="default" size="sm">
                    {durationText}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span>{date} at {time}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-500">{m.room_id}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => handleCopyLink(e, m.room_id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                title="Copy Invite Link"
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              <Link
                href={`/meeting/${m.room_id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-brand/20 hover:text-brand-hover text-slate-300 text-xs font-medium border border-white/5 transition-colors"
              >
                <span>Reopen</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
