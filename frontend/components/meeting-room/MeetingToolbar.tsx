"use client";

import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Users,
  MessageSquare,
  Smile,
  Disc,
  PhoneOff,
  Hand,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MeetingToolbarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isSharing: boolean;
  isRecording: boolean;
  isHandRaised: boolean;
  isParticipantsOpen: boolean;
  isChatOpen: boolean;
  participantCount: number;
  unreadChatCount?: number;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleShare: () => void;
  onToggleRecording: () => void;
  onToggleHand: () => void;
  onToggleParticipants: () => void;
  onToggleChat: () => void;
  onLeaveMeeting: () => void;
  onReaction?: (emoji: string) => void;
}

export function MeetingToolbar({
  isMuted,
  isVideoOff,
  isSharing,
  isRecording,
  isHandRaised,
  isParticipantsOpen,
  isChatOpen,
  participantCount,
  unreadChatCount = 0,
  onToggleMic,
  onToggleVideo,
  onToggleShare,
  onToggleRecording,
  onToggleHand,
  onToggleParticipants,
  onToggleChat,
  onLeaveMeeting,
  onReaction,
}: MeetingToolbarProps) {
  const [showReactions, setShowReactions] = useState(false);

  const emojis = ["👍", "👏", "❤️", "🎉", "🔥", "😂"];

  return (
    <div className="relative">
      {/* Reactions Popup */}
      {showReactions && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-dark-surface/95 backdrop-blur-md border border-dark-border rounded-2xl p-2 shadow-2xl flex items-center gap-2 z-40 animate-slide-up">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReaction?.(emoji);
                setShowReactions(false);
              }}
              className="p-2 hover:bg-white/10 rounded-xl text-xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
          <div className="w-px h-6 bg-dark-border mx-1" />
          <button
            onClick={() => {
              onToggleHand();
              setShowReactions(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/10 text-xs font-medium text-slate-200"
          >
            <Hand className="w-4 h-4 text-amber-400" />
            <span>{isHandRaised ? "Lower Hand" : "Raise Hand"}</span>
          </button>
        </div>
      )}

      {/* Main Bar */}
      <footer className="h-20 bg-dark-surface/90 backdrop-blur-md border-t border-dark-border px-4 sm:px-6 flex items-center justify-between z-30">
        {/* Left: Audio & Video controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mic */}
          <button
            onClick={onToggleMic}
            className={cn(
              "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-150 group",
              isMuted
                ? "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            )}
            title={isMuted ? "Unmute (Cmd+D)" : "Mute (Cmd+D)"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="text-[10px] mt-1 font-medium">
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </button>

          {/* Camera */}
          <button
            onClick={onToggleVideo}
            className={cn(
              "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-150 group",
              isVideoOff
                ? "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            )}
            title={isVideoOff ? "Start Video (Cmd+E)" : "Stop Video (Cmd+E)"}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            <span className="text-[10px] mt-1 font-medium">
              {isVideoOff ? "Start Video" : "Stop Video"}
            </span>
          </button>
        </div>

        {/* Center: Collaboration controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Share Screen */}
          <button
            onClick={onToggleShare}
            className={cn(
              "flex flex-col items-center justify-center w-14 sm:w-16 h-14 rounded-xl transition-all duration-150",
              isSharing
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-emerald-400 hover:bg-emerald-500/10"
            )}
            title="Share Screen"
          >
            <ScreenShare className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Share</span>
          </button>

          {/* Participants */}
          <button
            onClick={onToggleParticipants}
            className={cn(
              "relative flex flex-col items-center justify-center w-14 sm:w-16 h-14 rounded-xl transition-all duration-150",
              isParticipantsOpen
                ? "bg-brand/20 text-brand-hover border border-brand/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            )}
            title="Participants"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Participants</span>
            {participantCount > 0 && (
              <span className="absolute top-2 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-dark-card border border-dark-border text-slate-300">
                {participantCount}
              </span>
            )}
          </button>

          {/* Chat */}
          <button
            onClick={onToggleChat}
            className={cn(
              "relative flex flex-col items-center justify-center w-14 sm:w-16 h-14 rounded-xl transition-all duration-150",
              isChatOpen
                ? "bg-brand/20 text-brand-hover border border-brand/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            )}
            title="Chat"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Chat</span>
            {unreadChatCount > 0 && (
              <span className="absolute top-2 right-3 w-2 h-2 rounded-full bg-brand animate-pulse" />
            )}
          </button>

          {/* Reactions */}
          <button
            onClick={() => setShowReactions(!showReactions)}
            className={cn(
              "flex flex-col items-center justify-center w-14 sm:w-16 h-14 rounded-xl transition-all duration-150",
              showReactions
                ? "bg-white/10 text-white"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            )}
            title="Reactions"
          >
            <Smile className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Reactions</span>
          </button>

          {/* Record */}
          <button
            onClick={onToggleRecording}
            className={cn(
              "hidden md:flex flex-col items-center justify-center w-14 sm:w-16 h-14 rounded-xl transition-all duration-150",
              isRecording
                ? "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            )}
            title={isRecording ? "Stop Recording" : "Record Meeting"}
          >
            <Disc className={cn("w-5 h-5", isRecording && "animate-spin text-rose-500")} />
            <span className="text-[10px] mt-1 font-medium">
              {isRecording ? "Recording" : "Record"}
            </span>
          </button>
        </div>

        {/* Right: End / Leave Button */}
        <div>
          <button
            onClick={onLeaveMeeting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/25 transition-all active:scale-[0.98]"
            title="Leave Meeting"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="hidden sm:inline">End Meeting</span>
            <span className="sm:hidden">Leave</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
