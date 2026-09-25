"use client";

import React, { useState } from "react";
import { QuickActions } from "./dashboard/QuickActions";
import { NewMeetingModal } from "./dashboard/NewMeetingModal";
import { JoinMeetingModal } from "./dashboard/JoinMeetingModal";
import { ScheduleMeetingModal } from "./dashboard/ScheduleMeetingModal";

export interface HeroActionsProps {
  onMeetingScheduled?: () => void;
}

/**
 * HeroActions Component
 * Renders the top dashboard action cards and orchestrates the New/Join/Schedule modals.
 */
export function HeroActions({ onMeetingScheduled }: HeroActionsProps) {
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  return (
    <>
      <QuickActions
        onNewMeeting={() => setIsNewOpen(true)}
        onJoinMeeting={() => setIsJoinOpen(true)}
        onScheduleMeeting={() => setIsScheduleOpen(true)}
      />

      <NewMeetingModal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
      />

      <JoinMeetingModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
      />

      <ScheduleMeetingModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSuccess={onMeetingScheduled}
      />
    </>
  );
}

export default HeroActions;
