"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Calendar, Video, Copy, Check, ArrowRight, ShieldCheck, Radio } from "lucide-react";
import { MeetingResponse } from "@/lib/types";
import { formatMeetingDate, formatDuration, copyToClipboard } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

export interface NextMeetingProps {
  meeting?: MeetingResponse | null;
  onScheduleClick?: () => void;
}

/**
 * NextMeeting Component
 * Displays real-time live clock (desktop Zoom style) alongside the user's next upcoming or ongoing meeting.
 */
export function NextMeeting({ meeting, onScheduleClick }: NextMeetingProps) {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  // Live Digital Clock state
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeFormatted = currentTime
    ? currentTime.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "--:--:--";

  const dateFormatted = currentTime
    ? currentTime.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Loading date...";

  const timeZoneName = currentTime
    ? Intl.DateTimeFormat().resolvedOptions().timeZone.replace("_", " ")
    : "";

  const handleCopyLink = async (roomId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = `${origin}/meeting/${roomId}`;
    const ok = await copyToClipboard(inviteUrl);
    if (ok) {
      setCopied(true);
      success("Invite link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedMeeting = meeting
    ? formatMeetingDate(meeting.start_time, meeting.duration)
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Live Digital Clock Widget (Zoom desktop client hero) */}
      <div className="lg:col-span-4 rounded-2xl border border-dark-border bg-gradient-to-br from-dark-surface via-dark-card to-dark-surface p-6 flex flex-col justify-between shadow-card relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand/10 rounded-full blur-2xl pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-brand-hover mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live System Time</span>
          </div>
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {timeFormatted}
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1">
            {dateFormatted}
          </p>
        </div>

        <div className="pt-4 mt-4 border-t border-dark-border/60 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate">{timeZoneName}</span>
          <span className="px-1.5 py-0.5 rounded bg-dark-bg/80 border border-dark-border text-slate-400 font-mono text-[10px]">
            Synced
          </span>
        </div>
      </div>

      {/* Next Meeting Banner */}
      <div className="lg:col-span-8 rounded-2xl border border-brand/25 bg-gradient-to-br from-dark-surface via-dark-card to-dark-surface p-6 sm:p-7 shadow-glow relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

        {!meeting || !formattedMeeting ? (
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 my-auto">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-hover shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  No upcoming meetings scheduled
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Plan ahead by scheduling a call or start an instant meeting now.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onScheduleClick}>
              Schedule a Meeting
            </Button>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 my-auto">
            {/* Left Info */}
            <div className="space-y-2.5 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                {formattedMeeting.isLive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                    <Radio className="w-3 h-3 text-rose-400" />
                    LIVE NOW
                  </span>
                ) : (
                  <Badge variant="brand" dot size="md">
                    Up Next • {formattedMeeting.relative}
                  </Badge>
                )}

                <Badge variant="outline" size="md">
                  <Clock className="w-3 h-3 text-slate-400 mr-1 inline" />
                  {formattedMeeting.time} ({formatDuration(meeting.duration)})
                </Badge>

                {meeting.room_id && (
                  <span className="font-mono text-[11px] text-slate-400 bg-dark-bg/60 px-2 py-0.5 rounded border border-dark-border">
                    {meeting.room_id}
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {meeting.title}
                </h2>
                {meeting.description && (
                  <p className="mt-0.5 text-xs text-slate-400 line-clamp-2">
                    {meeting.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>End-to-end encrypted</span>
                </div>
                <span>•</span>
                <div>{formattedMeeting.date}</div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto shrink-0">
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleCopyLink(meeting.room_id)}
                className="flex-1 md:flex-initial"
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
                className="flex-1 md:flex-initial"
              >
                <Button
                  variant={formattedMeeting.isLive ? "destructive" : "primary"}
                  size="md"
                  className="w-full"
                >
                  <Video className="w-4 h-4" />
                  <span>{formattedMeeting.isLive ? "Join Live Room" : "Start Meeting"}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
