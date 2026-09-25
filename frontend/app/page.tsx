"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  getUpcomingMeetings,
  getRecentMeetings,
} from "@/lib/api";
import { MeetingResponse } from "@/lib/types";
import { AppShell } from "@/components/layout/AppShell";
import { NextMeeting } from "@/components/dashboard/NextMeeting";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentMeetings } from "@/components/dashboard/RecentMeetings";
import { UpcomingMeetings } from "@/components/dashboard/UpcomingMeetings";
import { NewMeetingModal } from "@/components/dashboard/NewMeetingModal";
import { JoinMeetingModal } from "@/components/dashboard/JoinMeetingModal";
import { ScheduleMeetingModal } from "@/components/dashboard/ScheduleMeetingModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Calendar, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function DashboardPage() {
  const { error } = useToast();

  const [upcomingMeetings, setUpcomingMeetings] = useState<MeetingResponse[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<MeetingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [upcoming, recent] = await Promise.all([
        getUpcomingMeetings().catch((err) => {
          console.warn("Could not load upcoming meetings:", err);
          return [] as MeetingResponse[];
        }),
        getRecentMeetings().catch((err) => {
          console.warn("Could not load recent meetings:", err);
          return [] as MeetingResponse[];
        }),
      ]);
      setUpcomingMeetings(upcoming);
      setRecentMeetings(recent);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load meetings data";
      setFetchError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Instant meeting trigger
  const handleInstantMeeting = () => {
    setIsNewModalOpen(true);
  };

  // Filtered lists
  const query = searchQuery.toLowerCase().trim();
  const filteredUpcoming = upcomingMeetings.filter(
    (m) =>
      m.title.toLowerCase().includes(query) ||
      (m.description && m.description.toLowerCase().includes(query)) ||
      m.room_id.toLowerCase().includes(query)
  );

  const filteredRecent = recentMeetings.filter(
    (m) =>
      m.title.toLowerCase().includes(query) ||
      (m.description && m.description.toLowerCase().includes(query)) ||
      m.room_id.toLowerCase().includes(query)
  );

  const nextMeeting = upcomingMeetings.length > 0 ? upcomingMeetings[0] : null;

  return (
    <AppShell onSearch={(q) => setSearchQuery(q)}>
      <div className="space-y-8 sm:space-y-10">
        {/* Next Meeting Banner */}
        <section aria-label="Next Upcoming Meeting">
          {loading ? (
            <Skeleton className="h-44 w-full rounded-2xl" />
          ) : (
            <NextMeeting
              meeting={nextMeeting}
              onScheduleClick={() => setIsScheduleModalOpen(true)}
            />
          )}
        </section>

        {/* Quick Actions (Zoom 4-Tile Grid) */}
        <section aria-label="Quick Actions">
          <QuickActions
            onNewMeeting={handleInstantMeeting}
            onJoinMeeting={() => setIsJoinModalOpen(true)}
            onScheduleMeeting={() => setIsScheduleModalOpen(true)}
            onShareScreen={() => setIsJoinModalOpen(true)}
          />
        </section>

        {/* Error notification if backend fails */}
        {fetchError && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 flex items-center justify-between text-rose-300 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{fetchError}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="border-rose-500/30 text-rose-200 hover:bg-rose-500/20"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </div>
        )}

        {/* Upcoming Meetings Section */}
        <section id="upcoming" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-hover">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Upcoming Meetings
              </h2>
              {upcomingMeetings.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-dark-card border border-dark-border text-slate-400 font-mono">
                  {upcomingMeetings.length}
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsScheduleModalOpen(true)}
              className="text-brand-hover hover:text-white"
            >
              + Schedule
            </Button>
          </div>

          <UpcomingMeetings
            meetings={filteredUpcoming}
            isLoading={loading}
            onScheduleClick={() => setIsScheduleModalOpen(true)}
          />
        </section>

        {/* Recent Meetings Section */}
        <section id="recent" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Recent Meetings
              </h2>
              {recentMeetings.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-dark-card border border-dark-border text-slate-400 font-mono">
                  {recentMeetings.length}
                </span>
              )}
            </div>

            <button
              onClick={loadData}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              title="Refresh meetings"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <RecentMeetings
            meetings={filteredRecent}
            isLoading={loading}
          />
        </section>
      </div>

      {/* Modals */}
      <NewMeetingModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      <JoinMeetingModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />

      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSuccess={loadData}
      />
    </AppShell>
  );
}
