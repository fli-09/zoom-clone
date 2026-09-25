"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinMeetingModal({ isOpen, onClose }: JoinMeetingModalProps) {
  const router = useRouter();
  const { error } = useToast();

  const [inputVal, setInputVal] = useState("");
  const [userName, setUserName] = useState("Guest User");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const cleanRoomId = (raw: string): string => {
    let cleaned = raw.trim();
    if (cleaned.includes("/meeting/")) {
      cleaned = cleaned.split("/meeting/")[1].split("?")[0].split("#")[0];
    }
    return cleaned.replace(/[^a-zA-Z0-9_-]/g, "");
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const roomId = cleanRoomId(inputVal);

    if (!roomId) {
      error("Please enter a valid Meeting ID or URL");
      return;
    }

    onClose();
    router.push(`/meeting/${roomId}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Join a Meeting"
      description="Enter the meeting ID or personal link name provided by the host"
      maxWidth="md"
    >
      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Meeting ID or Personal Link URL
          </label>
          <input
            type="text"
            required
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="e.g. 123-456-789 or https://.../meeting/abc-def"
            className="w-full h-10 px-3.5 rounded-xl bg-dark-bg border border-dark-border text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Your Display Name
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your Name"
            className="w-full h-10 px-3.5 rounded-xl bg-dark-bg border border-dark-border text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </div>

        {/* Join Preferences */}
        <div className="pt-2 space-y-2.5 border-t border-dark-border/60">
          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isMuted}
              onChange={(e) => setIsMuted(e.target.checked)}
              className="rounded border-dark-border bg-dark-bg text-brand focus:ring-brand/40"
            />
            <span>Do not connect to audio</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isVideoOff}
              onChange={(e) => setIsVideoOff(e.target.checked)}
              className="rounded border-dark-border bg-dark-bg text-brand focus:ring-brand/40"
            />
            <span>Turn off my video</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" className="px-6">
            Join
          </Button>
        </div>
      </form>
    </Modal>
  );
}
