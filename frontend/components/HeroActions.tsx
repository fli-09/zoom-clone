"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Plus, Calendar, Loader2, X } from "lucide-react";
import { createInstantMeeting, createScheduledMeeting } from "@/lib/api";

export interface HeroActionsProps {
  onMeetingScheduled?: () => void;
}

/**
 * HeroActions Component
 * Renders Zoom-style action buttons: "New Meeting", "Join Meeting", "Schedule Meeting"
 */
export function HeroActions({ onMeetingScheduled }: HeroActionsProps) {
  const router = useRouter();

  // Instant meeting loading state
  const [isCreatingInstant, setIsCreatingInstant] = useState(false);

  // Modals state
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Join form state
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinError, setJoinError] = useState("");

  // Schedule form state
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("10:00");
  const [scheduleDuration, setScheduleDuration] = useState("30");
  const [isScheduling, setIsScheduling] = useState(false);

  // Set default schedule date to tomorrow
  React.useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    setScheduleDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Handle Instant Meeting: calls POST /api/meetings/instant and redirects to /meeting/[room_id]
  const handleNewMeeting = async () => {
    setIsCreatingInstant(true);
    try {
      const meeting = await createInstantMeeting();
      router.push(`/meeting/${meeting.room_id}`);
    } catch (err: unknown) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to create instant meeting. Please check backend connection."
      );
      setIsCreatingInstant(false);
    }
  };

  // Handle Join Meeting
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    let cleaned = joinRoomId.trim();
    if (cleaned.includes("/meeting/")) {
      cleaned = cleaned.split("/meeting/")[1].split("?")[0].split("#")[0];
    }
    cleaned = cleaned.replace(/[^a-zA-Z0-9_-]/g, "");

    if (!cleaned) {
      setJoinError("Please enter a valid meeting ID or invite link");
      return;
    }

    setIsJoinOpen(false);
    router.push(`/meeting/${cleaned}`);
  };

  // Handle Schedule Meeting
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTitle.trim()) return;

    setIsScheduling(true);
    try {
      let isoStartTime: string | undefined = undefined;
      if (scheduleDate && scheduleTime) {
        const fullDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
        if (!isNaN(fullDateTime.getTime())) {
          isoStartTime = fullDateTime.toISOString();
        }
      }

      await createScheduledMeeting({
        title: scheduleTitle.trim(),
        start_time: isoStartTime,
        duration: parseInt(scheduleDuration, 10) || 30,
        type: "SCHEDULED",
        status: "SCHEDULED",
      });

      setScheduleTitle("");
      setIsScheduleOpen(false);
      onMeetingScheduled?.();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to schedule meeting");
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {/* New Meeting Button (Instant) */}
        <button
          onClick={handleNewMeeting}
          disabled={isCreatingInstant}
          className="flex items-center gap-4 p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition-all text-left group disabled:opacity-60"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
            {isCreatingInstant ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <Video className="w-7 h-7 fill-white" />
            )}
          </div>
          <div>
            <span className="block text-base font-bold text-slate-900 group-hover:text-[#0E71EB] transition-colors">
              New Meeting
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">
              Start an instant video sync
            </span>
          </div>
        </button>

        {/* Join Meeting Button */}
        <button
          onClick={() => setIsJoinOpen(true)}
          className="flex items-center gap-4 p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition-all text-left group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#0E71EB] text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Plus className="w-7 h-7" />
          </div>
          <div>
            <span className="block text-base font-bold text-slate-900 group-hover:text-[#0E71EB] transition-colors">
              Join Meeting
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">
              Enter room ID or invite link
            </span>
          </div>
        </button>

        {/* Schedule Meeting Button */}
        <button
          onClick={() => setIsScheduleOpen(true)}
          className="flex items-center gap-4 p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition-all text-left group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#0E71EB]/10 text-[#0E71EB] border border-[#0E71EB]/20 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <span className="block text-base font-bold text-slate-900 group-hover:text-[#0E71EB] transition-colors">
              Schedule Meeting
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">
              Plan for a future date
            </span>
          </div>
        </button>
      </div>

      {/* Join Meeting Modal */}
      {isJoinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Join a Meeting</h3>
              <button
                onClick={() => setIsJoinOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleJoin} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meeting ID or Personal Link
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. abc-defg-hij or https://.../meeting/..."
                  value={joinRoomId}
                  onChange={(e) => {
                    setJoinRoomId(e.target.value);
                    setJoinError("");
                  }}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#0E71EB] focus:ring-2 focus:ring-[#0E71EB]/20"
                />
                {joinError && (
                  <p className="text-xs text-rose-500 mt-1">{joinError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsJoinOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#0E71EB] hover:bg-blue-600 rounded-xl shadow-xs"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Schedule a Meeting
              </h3>
              <button
                onClick={() => setIsScheduleOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic / Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Product Sync"
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#0E71EB] focus:ring-2 focus:ring-[#0E71EB]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#0E71EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#0E71EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration
                  </label>
                  <select
                    value={scheduleDuration}
                    onChange={(e) => setScheduleDuration(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#0E71EB]"
                  >
                    <option value="15">15 mins</option>
                    <option value="30">30 mins</option>
                    <option value="45">45 mins</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  disabled={isScheduling}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#0E71EB] hover:bg-blue-600 rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isScheduling && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Meeting</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default HeroActions;
