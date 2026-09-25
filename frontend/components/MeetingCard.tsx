"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Clock, Copy, Check, Video } from "lucide-react";
import { MeetingResponse } from "@/lib/types";
import { formatMeetingDate, formatDuration, copyToClipboard } from "@/lib/utils";

export interface MeetingCardProps {
  meeting: MeetingResponse;
  variant?: "upcoming" | "recent";
}

/**
 * MeetingCard Component
 * Displays meeting title, formatted start time, duration, copy-invite-link button, and Start/Rejoin CTA.
 */
export function MeetingCard({
  meeting,
  variant = "upcoming",
}: MeetingCardProps) {
  const [copied, setCopied] = useState(false);

  const { date, time, relative } = formatMeetingDate(meeting.start_time);
  const durationText = formatDuration(meeting.duration);

  // Copy meeting invite link to clipboard
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = `${origin}/meeting/${meeting.room_id}`;
    const ok = await copyToClipboard(inviteUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {/* Top Header: Badge & Copy Button */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              variant === "upcoming"
                ? "bg-blue-50 text-[#0E71EB] border border-blue-100"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {variant === "upcoming" ? relative : "Ended"}
          </span>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#0E71EB] p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            title="Copy invite link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* Meeting Title */}
        <h3 className="text-base font-bold text-slate-900 line-clamp-1">
          {meeting.title}
        </h3>

        {/* Start Time & Duration */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {date} at {time} ({durationText})
          </span>
        </div>

        {meeting.description && (
          <p className="text-xs text-slate-600 mt-2 line-clamp-2">
            {meeting.description}
          </p>
        )}
      </div>

      {/* Footer: Room ID & Start Action */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-xs font-mono text-slate-400 truncate">
          ID: {meeting.room_id}
        </span>

        <Link href={`/meeting/${meeting.room_id}`}>
          <button
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors ${
              variant === "upcoming"
                ? "bg-[#0E71EB] hover:bg-blue-600 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-800"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>{variant === "upcoming" ? "Start" : "Rejoin"}</span>
          </button>
        </Link>
      </div>
    </div>
  );
}

export default MeetingCard;
