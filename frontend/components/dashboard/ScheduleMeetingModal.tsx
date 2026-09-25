"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createScheduledMeeting } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

export interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ScheduleMeetingModal({
  isOpen,
  onClose,
  onSuccess,
}: ScheduleMeetingModalProps) {
  const { error, success } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize with tomorrow's date by default
  React.useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
      const dd = String(tomorrow.getDate()).padStart(2, "0");
      setDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error("Meeting title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      let isoStartTime: string | undefined = undefined;
      if (date && time) {
        const fullDateTime = new Date(`${date}T${time}:00`);
        if (!isNaN(fullDateTime.getTime())) {
          isoStartTime = fullDateTime.toISOString();
        }
      }

      await createScheduledMeeting({
        title: title.trim(),
        description: description.trim() || undefined,
        start_time: isoStartTime,
        duration: parseInt(duration, 10) || 30,
        type: "SCHEDULED",
        status: "SCHEDULED",
      });

      success("Meeting successfully scheduled!");
      setTitle("");
      setDescription("");
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to schedule meeting";
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule a Meeting"
      description="Set date, time, and agenda for your upcoming session"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Topic / Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design Architecture Review"
            className="w-full h-10 px-3.5 rounded-xl bg-dark-bg border border-dark-border text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Description / Agenda (Optional)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Discuss sprint backlog, roadmap milestones, and technical trade-offs..."
            className="w-full p-3 rounded-xl bg-dark-bg border border-dark-border text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-dark-bg border border-dark-border text-xs text-slate-100 focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand transition-all [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Time
            </label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-dark-bg border border-dark-border text-xs text-slate-100 focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand transition-all [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-dark-bg border border-dark-border text-xs text-slate-100 focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand transition-all"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            className="px-6"
          >
            Save Meeting
          </Button>
        </div>
      </form>
    </Modal>
  );
}
