"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Clock,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import { VideoTile } from "@/components/meeting-room/VideoTile";
import { MeetingToolbar } from "@/components/meeting-room/MeetingToolbar";
import { ParticipantsPanel } from "@/components/meeting-room/ParticipantsPanel";
import { ChatPanel } from "@/components/meeting-room/ChatPanel";
import { ScreenShareBanner } from "@/components/meeting-room/ScreenShareBanner";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { MeetingParticipant, ChatMessage } from "@/lib/types";
import { copyToClipboard } from "@/lib/utils";

function MeetingRoomContent() {
  const params = useParams();
  const router = useRouter();
  const { success } = useToast();

  const rawRoomId = params?.room_id as string;
  const roomId = rawRoomId || "zoom-meeting";

  // Meeting states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Panels
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reactions animation state
  const [floatingReaction, setFloatingReaction] = useState<string | null>(null);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
        2,
        "0"
      )}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Simulated participants
  const [participants, setParticipants] = useState<MeetingParticipant[]>([
    {
      id: "local-user",
      name: "Alex Johnson",
      role: "host",
      isMuted: false,
      isVideoOff: false,
      isSpeaking: false,
    },
    {
      id: "user-2",
      name: "Sarah Chen",
      role: "participant",
      isMuted: false,
      isVideoOff: false,
      isSpeaking: true,
    },
    {
      id: "user-3",
      name: "Marcus Miller",
      role: "participant",
      isMuted: true,
      isVideoOff: true,
      isSpeaking: false,
    },
  ]);

  // Sync local participant state
  useEffect(() => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === "local-user"
          ? {
              ...p,
              isMuted,
              isVideoOff,
              isHandRaised,
            }
          : p
      )
    );
  }, [isMuted, isVideoOff, isHandRaised]);

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "Sarah Chen",
      timestamp: "10:02 AM",
      text: "Hey everyone! Glad we could sync up on this.",
    },
    {
      id: "m-2",
      sender: "Marcus Miller",
      timestamp: "10:03 AM",
      text: "Audio is coming through crystal clear 👍",
    },
  ]);

  const handleSendMessage = (text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        sender: "Alex Johnson",
        timestamp: timeStr,
        text,
        isMe: true,
      },
    ]);
  };

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

  const handleReaction = (emoji: string) => {
    setFloatingReaction(emoji);
    setTimeout(() => {
      setFloatingReaction(null);
    }, 2500);
  };

  const handleLeave = () => {
    router.push("/");
  };

  return (
    <div className="h-screen w-screen bg-[#07090C] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Top Meeting Header */}
      <header className="h-14 px-4 sm:px-6 bg-dark-surface/80 border-b border-dark-border/80 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-xs sm:text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Room: {roomId}</span>
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-dark-card border border-dark-border text-[11px] font-mono text-slate-400">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 px-2.5 py-1 rounded-full bg-dark-card border border-dark-border">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted</span>
          </div>

          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/5 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">Copy Link</span>
          </button>
        </div>
      </header>

      {/* Screen Share Alert Banner */}
      <ScreenShareBanner
        isSharing={isSharing}
        onStopSharing={() => setIsSharing(false)}
      />

      {/* Main Video Stage & Side Panels */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Floating Reaction Animation */}
        {floatingReaction && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce text-6xl">
            {floatingReaction}
          </div>
        )}

        {/* Video Grid Canvas */}
        <main className="flex-1 p-3 sm:p-5 flex items-center justify-center overflow-hidden">
          <div
            className={`w-full h-full max-w-6xl grid gap-3 sm:gap-4 items-center justify-center ${
              participants.length === 1
                ? "grid-cols-1 max-w-4xl max-h-[80vh]"
                : participants.length === 2
                ? "grid-cols-1 sm:grid-cols-2 max-h-[80vh]"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-h-[85vh]"
            }`}
          >
            {participants.map((p) => (
              <VideoTile
                key={p.id}
                participant={p}
                isLocal={p.id === "local-user"}
                isScreenSharing={isSharing && p.id === "local-user"}
                className="w-full h-full max-h-[420px]"
              />
            ))}
          </div>
        </main>

        {/* Participants Panel */}
        <ParticipantsPanel
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          participants={participants}
          roomId={roomId}
        />

        {/* Chat Panel */}
        <ChatPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Bottom Meeting Toolbar */}
      <MeetingToolbar
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isSharing={isSharing}
        isRecording={isRecording}
        isHandRaised={isHandRaised}
        isParticipantsOpen={isParticipantsOpen}
        isChatOpen={isChatOpen}
        participantCount={participants.length}
        onToggleMic={() => setIsMuted(!isMuted)}
        onToggleVideo={() => setIsVideoOff(!isVideoOff)}
        onToggleShare={() => setIsSharing(!isSharing)}
        onToggleRecording={() => {
          setIsRecording(!isRecording);
          success(
            isRecording
              ? "Recording stopped and saved"
              : "Meeting recording started"
          );
        }}
        onToggleHand={() => {
          setIsHandRaised(!isHandRaised);
          success(isHandRaised ? "Lowered hand" : "Raised hand");
        }}
        onToggleParticipants={() => {
          setIsParticipantsOpen(!isParticipantsOpen);
          if (isChatOpen) setIsChatOpen(false);
        }}
        onToggleChat={() => {
          setIsChatOpen(!isChatOpen);
          if (isParticipantsOpen) setIsParticipantsOpen(false);
        }}
        onLeaveMeeting={handleLeave}
        onReaction={handleReaction}
      />
    </div>
  );
}

export default function MeetingRoomPage() {
  return (
    <ToastProvider>
      <MeetingRoomContent />
    </ToastProvider>
  );
}
