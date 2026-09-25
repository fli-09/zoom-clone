"use client";

import React from "react";
import { Mic, MicOff, Hand, Pin } from "lucide-react";
import { MeetingParticipant } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

export interface VideoTileProps {
  participant: MeetingParticipant;
  isLocal?: boolean;
  isScreenSharing?: boolean;
  mediaStream?: MediaStream | null;
  className?: string;
}

export function VideoTile({
  participant,
  isLocal = false,
  isScreenSharing = false,
  mediaStream = null,
  className,
}: VideoTileProps) {
  const videoElementRef = React.useRef<HTMLVideoElement | null>(null);
  const audioElementRef = React.useRef<HTMLAudioElement | null>(null);

  // Check if video tracks exist and are enabled
  const hasVideoTrack = Boolean(
    isLocal
      ? !participant.isVideoOff && Boolean(mediaStream)
      : !participant.isVideoOff &&
        Boolean(
          mediaStream &&
          mediaStream.getVideoTracks().length > 0 &&
          mediaStream.getVideoTracks().some((t) => t.enabled)
        )
  );

  // Sync video stream dynamically
  React.useEffect(() => {
    if (videoElementRef.current) {
      if (mediaStream && (hasVideoTrack || isScreenSharing)) {
        if (videoElementRef.current.srcObject !== mediaStream) {
          videoElementRef.current.srcObject = mediaStream;
        }
        videoElementRef.current.play().catch((err) => {
          console.warn("Video playback note:", err);
        });
      } else {
        videoElementRef.current.srcObject = null;
      }
    }
  }, [mediaStream, isScreenSharing, hasVideoTrack, participant.isVideoOff]);

  // Sync audio stream for remote participants uninterruptedly
  React.useEffect(() => {
    if (!isLocal && audioElementRef.current && mediaStream) {
      if (audioElementRef.current.srcObject !== mediaStream) {
        audioElementRef.current.srcObject = mediaStream;
      }
      audioElementRef.current.play().catch((err) => {
        console.warn("Remote audio play waiting for user gesture:", err);
      });
    }
  }, [isLocal, mediaStream]);

  return (
    <div
      className={cn(
        "relative rounded-2xl bg-dark-surface border overflow-hidden flex items-center justify-center transition-all duration-200 select-none group aspect-video sm:aspect-auto",
        isScreenSharing && "ring-2 ring-emerald-500/80",
        participant.isSpeaking
          ? "border-emerald-400 ring-4 ring-emerald-500/40 shadow-xl shadow-emerald-500/25"
          : "border-dark-border",
        className
      )}
    >
      {/* Remote Audio Track Player - ALWAYS active and uninterrupted regardless of video toggles */}
      {!isLocal && (
        <audio
          ref={audioElementRef}
          autoPlay
          playsInline
        />
      )}

      {/* Participant Video / Screen Share / Avatar Display */}
      {isScreenSharing && mediaStream ? (
        <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoElementRef}
            autoPlay
            playsInline
            muted={true}
            className="w-full h-full object-contain bg-black"
          />
        </div>
      ) : hasVideoTrack ? (
        <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoElementRef}
            autoPlay
            playsInline
            muted={true}
            className={cn(
              "w-full h-full object-cover",
              isLocal && "scale-x-[-1]"
            )}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3">
          <Avatar
            name={participant.name}
            size="xl"
            className="ring-2 ring-white/10"
          />
          <span className="text-xs text-slate-400 font-medium">
            {participant.name}
          </span>
        </div>
      )}

      {/* Active speaker prominent glowing border (visible on both video and avatar) */}
      {participant.isSpeaking && (
        <div className="absolute inset-0 border-4 border-emerald-400 rounded-2xl pointer-events-none animate-pulse z-20" />
      )}

      {/* Top Indicators: Hand Raised & Pin */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          {isScreenSharing && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/90 text-slate-950 font-bold text-[11px] shadow-lg">
              <span>Screen Sharing</span>
            </div>
          )}
          {participant.isHandRaised && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/90 text-slate-950 font-bold text-[11px] shadow-lg animate-bounce">
              <Hand className="w-3.5 h-3.5 fill-current" />
              <span>Hand Raised</span>
            </div>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 pointer-events-auto">
          <button
            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
            title="Pin participant"
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Information Overlay: Name, Mic Status, Host Badge */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-xs font-medium text-white max-w-[80%] truncate">
          <span className="truncate">
            {participant.name} {isLocal && "(You)"}
          </span>
          {participant.role === "host" && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-brand/30 text-brand-hover border border-brand/40 uppercase font-semibold">
              Host
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
          {participant.isMuted ? (
            <MicOff className="w-3.5 h-3.5 text-rose-500" />
          ) : (
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </div>
      </div>
    </div>
  );
}
