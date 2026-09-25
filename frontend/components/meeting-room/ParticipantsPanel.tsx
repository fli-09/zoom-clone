"use client";

import React, { useState } from "react";
import { Mic, MicOff, Video, VideoOff, Hand, Search, Check, Copy } from "lucide-react";
import { MeetingParticipant } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { copyToClipboard } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export interface ParticipantsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  participants: MeetingParticipant[];
  roomId: string;
}

export function ParticipantsPanel({
  isOpen,
  onClose,
  participants,
  roomId,
}: ParticipantsPanelProps) {
  const { success } = useToast();
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyInvite = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = `${origin}/meeting/${roomId}`;
    const ok = await copyToClipboard(inviteUrl);
    if (ok) {
      setCopied(true);
      success("Invite link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <aside className="w-80 h-full bg-dark-surface border-l border-dark-border flex flex-col z-20 animate-slide-up">
      {/* Header */}
      <div className="p-4 border-b border-dark-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Participants ({participants.length})
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/5"
        >
          Close
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-dark-border/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search participants..."
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-dark-bg border border-dark-border text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-brand"
          />
        </div>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto divide-y divide-dark-border/40 p-2">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={p.name} size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-200 truncate">
                    {p.name}
                  </span>
                  {p.role === "host" && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-brand/20 text-brand-hover border border-brand/30 uppercase font-semibold">
                      Host
                    </span>
                  )}
                </div>
                {p.isHandRaised && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                    <Hand className="w-2.5 h-2.5" /> Hand raised
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
              {p.isMuted ? (
                <MicOff className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
              )}
              {p.isVideoOff ? (
                <VideoOff className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Video className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-dark-border bg-dark-bg/60 flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopyInvite}
          className="flex-1 text-xs"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" />
          ) : (
            <Copy className="w-3.5 h-3.5 mr-1" />
          )}
          <span>Invite Link</span>
        </Button>
      </div>
    </aside>
  );
}
