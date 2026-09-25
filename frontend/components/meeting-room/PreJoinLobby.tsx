"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, ArrowLeft, ShieldCheck, Video as VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";

export interface PreJoinLobbyProps {
  roomId: string;
  initialName?: string;
  initialMuted?: boolean;
  initialVideoOff?: boolean;
  onJoin: (name: string, isMuted: boolean, isVideoOff: boolean, stream: MediaStream | null) => void;
}

export function PreJoinLobby({
  roomId,
  initialName = "",
  initialMuted = false,
  initialVideoOff = false,
  onJoin,
}: PreJoinLobbyProps) {
  const [name, setName] = useState(initialName);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [isVideoOff, setIsVideoOff] = useState(initialVideoOff);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let mounted = true;

    async function startPreview() {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          if (!mounted) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          stream.getAudioTracks().forEach((t) => (t.enabled = !initialMuted));
          stream.getVideoTracks().forEach((t) => (t.enabled = !initialVideoOff));
          setLocalStream(stream);
        }
      } catch (err) {
        console.warn("Camera preview not available or permission denied:", err);
      }
    }

    startPreview();

    return () => {
      mounted = false;
      // Note: we don't kill tracks here if passing to live room on join
    };
  }, [initialMuted, initialVideoOff]);

  // Update track enabled states when buttons toggled
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => (t.enabled = !isMuted));
    }
  }, [isMuted, localStream]);

  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => (t.enabled = !isVideoOff));
    }
  }, [isVideoOff, localStream]);

  // Attach video stream to preview
  const setVideoNode = React.useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (node && localStream) {
        node.srcObject = localStream;
        node.play().catch(() => {});
      }
    },
    [localStream]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg("Please enter your name before joining");
      return;
    }
    onJoin(trimmed, isMuted, isVideoOff, localStream);
  };

  return (
    <div className="min-h-screen w-screen bg-[#07090C] text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Header */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-dark-surface border border-dark-border text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Room: <strong className="text-white font-mono">{roomId}</strong></span>
        </div>
      </header>

      {/* Main Center Content */}
      <main className="max-w-4xl mx-auto w-full my-auto flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-12">
        {/* Video Preview Card */}
        <div className="w-full max-w-md aspect-video sm:aspect-4/3 rounded-2xl bg-dark-surface border border-dark-border overflow-hidden relative flex flex-col items-center justify-center shadow-2xl">
          {isVideoOff || !localStream ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <Avatar name={name || "Guest"} size="xl" className="ring-2 ring-white/10" />
              <span className="text-xs text-slate-400">Camera is off</span>
            </div>
          ) : (
            <video
              ref={setVideoNode}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          )}

          {/* Quick controls over video preview */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-10">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2.5 rounded-full transition-colors ${
                isMuted
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-2.5 rounded-full transition-colors ${
                isVideoOff
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              title={isVideoOff ? "Start Video" : "Stop Video"}
            >
              {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Join Form Details */}
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-brand/10 border border-brand/20 text-brand text-xs font-semibold">
              <VideoIcon className="w-3.5 h-3.5" />
              <span>Zoom Meeting Ready</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Ready to join?</h1>
            <p className="text-xs text-slate-400">
              Set your display name and check your audio and video before entering the room.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Enter your name..."
                className="w-full h-11 px-3.5 rounded-xl bg-dark-surface border border-dark-border text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand transition-all shadow-inner"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                {errorMsg}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-12 text-sm font-semibold shadow-lg shadow-brand/30"
            >
              Join Meeting
            </Button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-2">
        Protected by end-to-end encrypted Zoom Clone WebRTC service.
      </footer>
    </div>
  );
}
