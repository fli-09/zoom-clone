"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Clock, Copy, Check, Video, ArrowRight, Radio } from "lucide-react";
import { MeetingResponse } from "@/lib/types";
import { formatMeetingDate, formatDuration, copyToClipboard, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

export interface MeetingCardProps {
  meeting: MeetingResponse;
  variant?: "upcoming" | "recent";
  className?: string;
}

/**
 * MeetingCard Component
 * Displays meeting metadata, duration, start time, copy invite link, and instant start/join action.
 */
export function MeetingCard({
  meeting,
  variant = "upcoming",
  className,
}: MeetingCardProps) {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  const { date, time, relative, isLive: calculatedIsLive, statusBadgeText } = formatMeetingDate(
    meeting.start_time,
    meeting.duration
  );
  const durationText = formatDuration(meeting.duration);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = `${origin}/meeting/${meeting.room_id}`;
    const ok = await copyToClipboard(inviteUrl);
    if (ok) {
      setCopied(true);
      success("Invite link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isLive =
    calculatedIsLive ||
    meeting.status === "in_progress" ||
    meeting.status === "IN_PROGRESS";

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between p-5 rounded-2xl border border-dark-border bg-dark-surface hover:bg-dark-card hover:border-slate-700 transition-all duration-200 shadow-card min-h-[192px]",
        isLive && "border-brand/40 shadow-glow",
        className
      )}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                <Radio className="w-3 h-3 text-rose-400" />
                LIVE
              </span>
            ) : variant === "upcoming" ? (
              <Badge variant="brand" dot size="sm">
                {statusBadgeText || relative}
              </Badge>
            ) : (
              <Badge variant="default" size="sm">
                Concluded
              </Badge>
            )}
            <Badge variant="outline" size="sm">
              {durationText}
            </Badge>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
            title="Copy Invite Link"
            aria-label="Copy Invite Link"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Meeting Title */}
        <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white line-clamp-1">
          {meeting.title}
        </h3>

        {/* Description if present */}
        {meeting.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {meeting.description}
          </p>
        )}

        {/* Date and Room ID */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-3 pt-3 border-t border-dark-border/60">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {time} • {date}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] text-slate-500 truncate">
          ID: {meeting.room_id}
        </span>

        <Link href={`/meeting/${meeting.room_id}`}>
          <Button
            variant={isLive ? "destructive" : variant === "upcoming" ? "primary" : "secondary"}
            size="sm"
            className="gap-1.5"
          >
            <Video className="w-3.5 h-3.5" />
            <span>{isLive ? "Join Now" : variant === "upcoming" ? "Start" : "Rejoin"}</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default MeetingCard;
