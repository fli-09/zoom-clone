"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Copy,
  Check,
  ArrowLeft,
  Users,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

/**
 * Meeting Room Page (/meeting/[room_id])
 * Clean Zoom meeting interface with live camera/mic toggles, timer, participant tile, and leave action.
 */
export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();

  const rawRoomId = params?.room_id as string;
  const roomId = rawRoomId || "zoom-meeting";

  // Controls state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [copied, setCopied] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleCopy = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = `${origin}/meeting/${roomId}`;
    const ok = await copyToClipboard(inviteUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#1C1F24] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Top Bar */}
      <header className="h-14 px-6 bg-[#16181D] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">
              Meeting ID: {roomId}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 text-[11px] font-mono text-slate-400">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{formatTimer(seconds)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-slate-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Invite Link</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Video Grid */}
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="w-full max-w-4xl aspect-video rounded-3xl bg-[#0D0F12] border border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden">
          {isVideoOff ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-[#0E71EB] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                U
              </div>
              <span className="text-sm font-medium text-slate-400">
                Camera is off
              </span>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
              <div className="w-24 h-24 rounded-full bg-[#0E71EB] flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                U
              </div>
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Video Connected</span>
              </div>
            </div>
          )}

          {/* Bottom Video Label Overlay */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold">
            <span>You (Host)</span>
            {isMuted ? (
              <MicOff className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
        </div>
      </main>

      {/* Bottom Meeting Controls */}
      <footer className="h-20 bg-[#16181D] border-t border-white/10 px-6 flex items-center justify-between">
        {/* Left: Audio & Video */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors ${
              isMuted
                ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="text-[10px] mt-1 font-medium">
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors ${
              isVideoOff
                ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            {isVideoOff ? (
              <VideoOff className="w-5 h-5" />
            ) : (
              <Video className="w-5 h-5" />
            )}
            <span className="text-[10px] mt-1 font-medium">
              {isVideoOff ? "Start Video" : "Stop Video"}
            </span>
          </button>
        </div>

        {/* Center: Participants */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl text-slate-300">
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">1 Person</span>
          </div>
        </div>

        {/* Right: End Call */}
        <div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave Meeting</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
