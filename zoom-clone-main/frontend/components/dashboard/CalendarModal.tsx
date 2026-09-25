"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { MeetingResponse } from "@/lib/types";
import { formatMeetingDate, formatDuration } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  Plus,
} from "lucide-react";

export interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetings: MeetingResponse[];
  onScheduleClick: () => void;
}

/**
 * CalendarModal Component
 * Interactive SaaS calendar view showing meetings mapped across days with day selection and direct booking.
 */
export function CalendarModal({
  isOpen,
  onClose,
  meetings,
  onScheduleClick,
}: CalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number>(() => new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total days in current month
  const totalDays = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  // Group meetings by day in current month & year
  const meetingsByDay = meetings.reduce((acc, m) => {
    if (!m.start_time) return acc;
    const d = new Date(m.start_time);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayNum = d.getDate();
      if (!acc[dayNum]) acc[dayNum] = [];
      acc[dayNum].push(m);
    }
    return acc;
  }, {} as Record<number, MeetingResponse[]>);

  // Selected date meetings
  const selectedDateMeetings = meetingsByDay[selectedDay] || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-brand-hover" />
          <span>Calendar & Schedule</span>
        </div>
      }
      description="View upcoming scheduled meetings and timeline across the calendar"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white">
            {monthName} {year}
          </h4>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-dark-border bg-dark-bg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-dark-border bg-dark-bg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border border-dark-border rounded-xl p-3 bg-dark-bg/60">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 pb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank leading days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9 sm:h-10 rounded-lg opacity-20" />
            ))}

            {/* Month Days */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const hasMeetings = Boolean(meetingsByDay[day]?.length);
              const isSelected = selectedDay === day;
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-9 sm:h-10 rounded-lg flex flex-col items-center justify-center relative transition-all text-xs font-medium ${
                    isSelected
                      ? "bg-brand text-white shadow-md shadow-brand/40 font-bold"
                      : isToday
                      ? "border border-brand/60 text-brand-hover bg-brand/10"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span>{day}</span>
                  {hasMeetings && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                        isSelected ? "bg-white" : "bg-brand-hover"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Agenda for {monthName} {selectedDay}, {year}
            </h5>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onScheduleClick();
              }}
              className="gap-1.5 text-xs py-1 h-7"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </Button>
          </div>

          {selectedDateMeetings.length === 0 ? (
            <div className="text-center py-6 px-4 border border-dashed border-dark-border rounded-xl text-xs text-slate-500 bg-dark-bg/30">
              No meetings scheduled for this day. Click &quot;Schedule&quot; to plan one.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {selectedDateMeetings.map((m) => {
                const { time } = formatMeetingDate(m.start_time, m.duration);
                return (
                  <div
                    key={m.room_id}
                    className="flex items-center justify-between p-3 rounded-xl border border-dark-border bg-dark-bg/80 hover:bg-dark-card transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-xs font-semibold text-white truncate">{m.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>
                          {time} ({formatDuration(m.duration)})
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-500">{m.room_id}</span>
                      </div>
                    </div>
                    <Link href={`/meeting/${m.room_id}`} onClick={onClose}>
                      <Button variant="primary" size="sm" className="gap-1.5 h-7 text-xs">
                        <Video className="w-3 h-3" />
                        <span>Join</span>
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
