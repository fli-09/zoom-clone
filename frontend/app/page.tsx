"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroActions } from "@/components/HeroActions";
import { MeetingCard } from "@/components/MeetingCard";
import { EmptyState } from "@/components/EmptyState";
import { getUpcomingMeetings, getRecentMeetings } from "@/lib/api";
import { MeetingResponse } from "@/lib/types";
import { Calendar, Clock, RefreshCw, AlertCircle } from "lucide-react";

/**
 * Dashboard Page (/)
 * Zoom-style web app dashboard displaying Navbar, Hero Action Cards,
 * Upcoming Meetings, and Recent Meetings fetched from FastAPI backend.
 */
export default function DashboardPage() {
  const [upcomingMeetings, setUpcomingMeetings] = useState<MeetingResponse[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<MeetingResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch upcoming and recent meetings from backend via lib/api.ts
  const loadMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
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
      setError(
        err instanceof Error ? err.message : "Failed to load meetings data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Hero Section: New, Join, and Schedule buttons */}
        <section aria-label="Meeting Quick Actions">
          <HeroActions onMeetingScheduled={loadMeetings} />
        </section>

        {/* Backend Error Alert if any */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-700 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadMeetings}
              className="px-3 py-1 bg-white border border-rose-200 rounded-lg font-medium hover:bg-rose-50"
            >
              Retry
            </button>
          </div>
        )}

        {/* Upcoming Meetings Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0E71EB] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Upcoming Meetings
              </h2>
              {upcomingMeetings.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold font-mono">
                  {upcomingMeetings.length}
                </span>
              )}
            </div>

            <button
              onClick={loadMeetings}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse"
                />
              ))}
            </div>
          ) : upcomingMeetings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  variant="upcoming"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No upcoming meetings"
              description="You have no meetings scheduled yet. Create an instant meeting or schedule one for later."
            />
          )}
        </section>

        {/* Recent Meetings Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent Meetings
              </h2>
              {recentMeetings.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold font-mono">
                  {recentMeetings.length}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse"
                />
              ))}
            </div>
          ) : recentMeetings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  variant="recent"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No recent meetings"
              description="Concluded meetings and previous video sessions will appear here."
            />
          )}
        </section>
      </main>
    </div>
  );
}
