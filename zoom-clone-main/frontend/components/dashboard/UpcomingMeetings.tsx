"use client";

import React from "react";
import { MeetingResponse } from "@/lib/types";
import { MeetingCard } from "@/components/MeetingCard";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export interface UpcomingMeetingsProps {
  meetings: MeetingResponse[];
  isLoading?: boolean;
  onScheduleClick?: () => void;
}

/**
 * UpcomingMeetings Component
 * Displays a responsive grid of upcoming scheduled meetings with empty states and skeletons.
 */
export function UpcomingMeetings({
  meetings,
  isLoading = false,
  onScheduleClick,
}: UpcomingMeetingsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <EmptyState
        title="No upcoming meetings scheduled"
        description="Schedule a meeting in advance or create an instant meeting to get started."
        actionLabel="Schedule Meeting"
        onAction={onScheduleClick}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {meetings.map((meeting) => (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
          variant="upcoming"
        />
      ))}
    </div>
  );
}

export default UpcomingMeetings;
