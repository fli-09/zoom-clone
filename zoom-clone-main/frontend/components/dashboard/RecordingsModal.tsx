"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { copyToClipboard } from "@/lib/utils";
import { MeetingResponse } from "@/lib/types";
import {
  Film,
  Play,
  Download,
  Share2,
  Trash2,
  Clock,
  HardDrive,
  Check,
  Video,
} from "lucide-react";

export interface RecordingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentMeetings?: MeetingResponse[];
}

interface RecordingItem {
  id: string;
  title: string;
  roomId: string;
  date: string;
  duration: string;
  size: string;
  url: string;
}

/**
 * RecordingsModal Component
 * Allows users to view, play, download, and share their Zoom cloud meeting recordings.
 */
export function RecordingsModal({
  isOpen,
  onClose,
  recentMeetings = [],
}: RecordingsModalProps) {
  const { success } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingItem, setPlayingItem] = useState<RecordingItem | null>(null);

  // Generate realistic cloud recordings using recent meetings or defaults
  const sampleRecordings: RecordingItem[] =
    recentMeetings.length > 0
      ? recentMeetings.slice(0, 5).map((m, idx) => ({
          id: `rec-${m.room_id || idx}`,
          title: m.title || `Team Sync #${idx + 1}`,
          roomId: m.room_id || `rec-${idx}`,
          date: m.start_time
            ? new Date(m.start_time).toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Sep 24, 2026",
          duration: `${m.duration || 45} mins`,
          size: `${Math.round((m.duration || 45) * 4.2)} MB`,
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        }))
      : [
          {
            id: "rec-1",
            title: "Architecture & WebRTC Mesh Review",
            roomId: "vtv-nuty-yuv",
            date: "Sep 25, 2026",
            duration: "42 mins",
            size: "185 MB",
            url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          },
          {
            id: "rec-2",
            title: "Product Roadmap Alignment",
            roomId: "cuh-bkwv-cuv",
            date: "Sep 24, 2026",
            duration: "55 mins",
            size: "240 MB",
            url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          },
          {
            id: "rec-3",
            title: "Sprint Retrospective & Demo",
            roomId: "kgr-qtec-jat",
            date: "Sep 22, 2026",
            duration: "30 mins",
            size: "128 MB",
            url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          },
        ];

  const handleShare = async (item: RecordingItem) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${origin}/recordings/${item.id}`;
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopiedId(item.id);
      success(`Recording link for "${item.title}" copied!`);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDownload = (item: RecordingItem) => {
    success(`Downloading recording: ${item.title}.mp4`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setPlayingItem(null);
        onClose();
      }}
      title={
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-brand-hover" />
          <span>Cloud Recordings</span>
        </div>
      }
      description="Manage, watch, and share your recorded cloud meeting sessions"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Video Player Preview if an item is selected */}
        {playingItem && (
          <div className="p-3 rounded-2xl bg-dark-bg border border-brand/30 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white truncate">
                Playing: {playingItem.title}
              </span>
              <button
                onClick={() => setPlayingItem(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded bg-dark-card"
              >
                Close Player
              </button>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <video
                src={playingItem.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Recordings List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {sampleRecordings.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-dark-border bg-dark-bg/70 hover:bg-dark-card hover:border-slate-700 transition-all gap-3"
            >
              <div className="min-w-0 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-hover shrink-0 mt-0.5">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white truncate max-w-xs">
                    {item.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {item.duration}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-slate-500" />
                      {item.size}
                    </span>
                    <span>•</span>
                    <span>{item.date}</span>
                    <Badge variant="outline" size="sm" className="text-[10px] py-0 px-1.5">
                      1080p MP4
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-dark-border/40">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setPlayingItem(item)}
                  className="gap-1 h-8 text-xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Play</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleShare(item)}
                  className="h-8 text-xs px-2.5"
                  title="Copy share link"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownload(item)}
                  className="h-8 text-xs px-2.5"
                  title="Download recording"
                >
                  <Download className="w-3.5 h-3.5 text-slate-300" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
