"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Clock, Calendar, Video, Copy, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { MeetingResponse } from "@/lib/types";
import { formatMeetingDate, formatDuration, copyToClipboard } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

export interface NextMeetingProps {
  meeting?: MeetingResponse | null;
  onScheduleClick?: () => void;
}

export function NextMeeting({ meeting, onScheduleClick }: NextMeetingProps) {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  if (!meeting) {
    return (
      <div className="rounded-2xl border border-dark-border bg-gradient-to-br from-dark-surface to-dark-card p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card min-h-[176px]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-hover shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              No meetings scheduled today
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enjoy your focus time or start an instant meeting with your team.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onScheduleClick}>
          Schedule a Meeting
        </Button>
      </div>
    );
  }

  const { date, time, relative } = formatMeetingDate(meeting.start_time);
  const durationText = formatDuration(meeting.duration);

  const handleCopyLink = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = `${origin}/meeting/${meeting.room_id}`;
    const ok = await copyToClipboard(inviteUrl);
    if (ok) {
      setCopied(true);
      success("Invite link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand/25 bg-gradient-to-br from-dark-surface via-dark-card to-dark-surface p-6 sm:p-8 shadow-glow min-h-[176px]">
      {/* Decorative ambient background glow */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Side: Meeting details */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand" dot size="md">
              Up Next • {relative}
            </Badge>
            <Badge variant="outline" size="md">
              <Clock className="w-3 h-3 text-slate-400 mr-1 inline" />
              {time} ({durationText})
            </Badge>
            {meeting.room_id && (
              <span className="font-mono text-[11px] text-slate-500 bg-dark-bg/60 px-2 py-0.5 rounded border border-dark-border">
                {meeting.room_id}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {meeting.title}
            </h2>
            {meeting.description && (
              <p className="mt-1 text-xs sm:text-sm text-slate-400 line-clamp-2">
                {meeting.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>End-to-end encrypted</span>
            </div>
            <span>•</span>
            <div>Date: {date}</div>
          </div>
        </div>

        {/* Right Side: Primary Join/Start + Copy Actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={handleCopyLink}
            className="flex-1 sm:flex-initial"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy Link</span>
              </>
            )}
          </Button>

          <Link
            href={`/meeting/${meeting.room_id}`}
            className="flex-1 sm:flex-initial"
          >
            <Button variant="primary" size="md" className="w-full">
              <Video className="w-4 h-4" />
              <span>Start Meeting</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
