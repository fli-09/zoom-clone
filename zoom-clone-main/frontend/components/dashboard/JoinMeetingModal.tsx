"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getMeetingByRoomId } from "@/lib/api";
import { ScreenShare } from "lucide-react";

export interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultScreenShare?: boolean;
}

export function JoinMeetingModal({
  isOpen,
  onClose,
  defaultScreenShare = false,
}: JoinMeetingModalProps) {
  const router = useRouter();
  const { error } = useToast();

  const [inputVal, setInputVal] = useState("");
  const [userName, setUserName] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isShareScreen, setIsShareScreen] = useState(defaultScreenShare);
  const [isChecking, setIsChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsShareScreen(defaultScreenShare);
  }, [defaultScreenShare, isOpen]);

  const cleanRoomId = (raw: string): string => {
    let cleaned = raw.trim();
    if (cleaned.includes("/meeting/")) {
      cleaned = cleaned.split("/meeting/")[1].split("?")[0].split("#")[0];
    }
    return cleaned.replace(/[^a-zA-Z0-9_-]/g, "");
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const roomId = cleanRoomId(inputVal);

    if (!roomId) {
      setErrorMsg("Please enter a valid Meeting ID or URL");
      error("Please enter a valid Meeting ID or URL");
      return;
    }

    setIsChecking(true);
    try {
      await getMeetingByRoomId(roomId);
      onClose();
      const params = new URLSearchParams();
      if (userName.trim()) params.set("name", userName.trim());
      if (isMuted) params.set("muted", "1");
      if (isVideoOff) params.set("videoOff", "1");
      if (isShareScreen) params.set("screenShare", "1");
      const qs = params.toString() ? `?${params.toString()}` : "";
      router.push(`/meeting/${roomId}${qs}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Meeting '${roomId}' not found`;
      setErrorMsg(msg);
      error(msg);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        defaultScreenShare ? (
          <div className="flex items-center gap-2">
            <ScreenShare className="w-5 h-5 text-emerald-400" />
            <span>Share Screen in Meeting</span>
          </div>
        ) : (
          "Join a Meeting"
        )
      }
      description={
        defaultScreenShare
          ? "Enter the meeting ID or invite link to join and broadcast your screen immediately"
          : "Enter the meeting ID or personal link name provided by the host"
      }
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

          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isShareScreen}
              onChange={(e) => setIsShareScreen(e.target.checked)}
              className="rounded border-dark-border bg-dark-bg text-brand focus:ring-brand/40"
            />
            <span className="font-semibold text-slate-200">
              Start with screen sharing enabled
            </span>
          </label>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={isChecking}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="px-6"
            isLoading={isChecking}
            disabled={isChecking}
          >
            {isChecking ? "Validating..." : defaultScreenShare ? "Share Screen" : "Join"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
