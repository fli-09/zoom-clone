"use client";

import React from "react";
import { ScreenShare, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ScreenShareBannerProps {
  isSharing: boolean;
  onStopSharing: () => void;
}

export function ScreenShareBanner({
  isSharing,
  onStopSharing,
}: ScreenShareBannerProps) {
  if (!isSharing) return null;

  return (
    <div className="bg-emerald-950/90 border-b border-emerald-800/80 px-4 py-2 flex items-center justify-between text-xs text-emerald-200 z-30 animate-fade-in shadow-md">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <ScreenShare className="w-4 h-4 text-emerald-400" />
        <span className="font-medium">
          You are currently sharing your screen with all participants.
        </span>
      </div>

      <Button
        variant="destructive"
        size="sm"
        onClick={onStopSharing}
        className="h-7 px-3 text-xs bg-rose-600 hover:bg-rose-700"
      >
        <StopCircle className="w-3.5 h-3.5 mr-1" />
        <span>Stop Share</span>
      </Button>
    </div>
  );
}
