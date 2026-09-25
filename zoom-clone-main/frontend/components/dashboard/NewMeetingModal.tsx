"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Video, VideoOff, Shield } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { createInstantMeeting } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

export interface NewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewMeetingModal({ isOpen, onClose }: NewMeetingModalProps) {
  const router = useRouter();
  const { error, success } = useToast();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = async () => {
    setIsSubmitting(true);
    try {
      const meeting = await createInstantMeeting();
      success("Instant meeting room created!");
      onClose();
      // Pass initial preferences if desired or navigate
      router.push(`/meeting/${meeting.room_id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create meeting room";
      error(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start New Meeting"
      description="Preview your camera & audio settings before joining the room"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Green Room Video Preview Container */}
        <div className="relative aspect-video rounded-xl bg-dark-bg border border-dark-border overflow-hidden flex items-center justify-center">
          {isVideoOn ? (
            <div className="relative w-full h-full flex items-center justify-center bg-slate-900/80">
              <Avatar name="Default User" size="xl" />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Camera Ready</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
              <Avatar name="Default User" size="lg" />
              <span className="text-xs">Camera is turned off</span>
            </div>
          )}

          {/* Quick AV overlay toggles */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-dark-surface/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-dark-border shadow-lg">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-2 rounded-full transition-colors ${
                isMicOn
                  ? "bg-white/10 hover:bg-white/15 text-slate-200"
                  : "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
              }`}
              title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
            >
              {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-2 rounded-full transition-colors ${
                isVideoOn
                  ? "bg-white/10 hover:bg-white/15 text-slate-200"
                  : "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
              }`}
              title={isVideoOn ? "Turn Off Video" : "Turn On Video"}
            >
              {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="rounded-xl border border-dark-border bg-dark-card/50 p-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>End-to-end encrypted room</span>
          </div>
          <span className="text-slate-500">Auto-assigned Host</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleStart}
            isLoading={isSubmitting}
            className="px-6"
          >
            Start Meeting
          </Button>
        </div>
      </div>
    </Modal>
  );
}
