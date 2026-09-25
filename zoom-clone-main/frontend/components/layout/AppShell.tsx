"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import { ToastProvider } from "@/components/ui/Toast";
import { CalendarModal } from "@/components/dashboard/CalendarModal";
import { RecordingsModal } from "@/components/dashboard/RecordingsModal";
import { ContactsModal } from "@/components/dashboard/ContactsModal";
import { SettingsModal } from "@/components/dashboard/SettingsModal";
import { MeetingResponse } from "@/lib/types";

export interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  onSearch?: (query: string) => void;
  meetings?: MeetingResponse[];
  recentMeetings?: MeetingResponse[];
  onScheduleClick?: () => void;
}

/**
 * AppShell Component
 * Master SaaS layout providing desktop Sidebar, sticky TopBar, bottom MobileNav,
 * plus interactive system modals (Calendar, Recordings, Contacts, and Settings).
 */
export function AppShell({
  children,
  title,
  onSearch,
  meetings = [],
  recentMeetings = [],
  onScheduleClick,
}: AppShellProps) {
  // Master modal states for all interactive icons
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isRecordingsOpen, setIsRecordingsOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col md:flex-row antialiased selection:bg-brand selection:text-white">
        {/* Desktop Sidebar with active icon handlers */}
        <Sidebar
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onOpenRecordings={() => setIsRecordingsOpen(true)}
          onOpenContacts={() => setIsContactsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 md:pb-0">
          <TopBar
            title={title}
            onSearch={onSearch}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenRecordings={() => setIsRecordingsOpen(true)}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Mobile Navigation */}
        <MobileNav
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Global Interactive Modals triggered by TopBar & Sidebar icons */}
        <CalendarModal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          meetings={meetings}
          onScheduleClick={() => {
            setIsCalendarOpen(false);
            onScheduleClick?.();
          }}
        />

        <RecordingsModal
          isOpen={isRecordingsOpen}
          onClose={() => setIsRecordingsOpen(false)}
          recentMeetings={recentMeetings}
        />

        <ContactsModal
          isOpen={isContactsOpen}
          onClose={() => setIsContactsOpen(false)}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </ToastProvider>
  );
}
