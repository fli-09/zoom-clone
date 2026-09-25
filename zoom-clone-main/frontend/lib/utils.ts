import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes safely with clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats an ISO date string into readable date, time, and human-friendly relative status.
 *
 * @param dateString - ISO 8601 string or valid Date string
 * @param durationMinutes - Scheduled meeting duration in minutes (defaults to 30)
 * @returns Object with date, time, relative text, live status, and upcoming/past flags
 */
export function formatMeetingDate(
  dateString?: string | null,
  durationMinutes?: number | null
): {
  date: string;
  time: string;
  relative: string;
  isLive: boolean;
  isUpcoming: boolean;
  isPast: boolean;
  statusBadgeText: string;
} {
  if (!dateString) {
    return {
      date: "TBD",
      time: "TBD",
      relative: "Scheduled",
      isLive: false,
      isUpcoming: false,
      isPast: false,
      statusBadgeText: "Scheduled",
    };
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return {
      date: "TBD",
      time: "TBD",
      relative: "Scheduled",
      isLive: false,
      isUpcoming: false,
      isPast: false,
      statusBadgeText: "Scheduled",
    };
  }

  const now = new Date();
  const startTime = date.getTime();
  const durationMs = (durationMinutes || 30) * 60 * 1000;
  const endTime = startTime + durationMs;
  const nowMs = now.getTime();

  // Determine temporal relationship
  const isLive = nowMs >= startTime && nowMs <= endTime;
  const isUpcoming = startTime > nowMs;
  const isPast = nowMs > endTime;

  // Formatting strings
  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const fullDate = date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });

  const diffMs = startTime - nowMs;
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  let relative = "";
  let statusBadgeText = "";

  if (isLive) {
    relative = "Happening Now";
    statusBadgeText = "LIVE NOW";
  } else if (isUpcoming && diffMinutes <= 60 && diffMinutes > 0) {
    relative = `Starts in ${diffMinutes} min${diffMinutes === 1 ? "" : "s"}`;
    statusBadgeText = `In ${diffMinutes}m`;
  } else {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round(
      (targetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      relative = `Today at ${time}`;
      statusBadgeText = isUpcoming ? "Today" : "Completed Today";
    } else if (diffDays === 1) {
      relative = `Tomorrow at ${time}`;
      statusBadgeText = "Tomorrow";
    } else if (diffDays === -1) {
      relative = `Yesterday at ${time}`;
      statusBadgeText = "Past Due";
    } else if (diffDays > 1 && diffDays < 7) {
      const weekday = date.toLocaleDateString([], { weekday: "short" });
      relative = `${weekday} at ${time}`;
      statusBadgeText = weekday;
    } else if (diffDays < -1) {
      relative = `${fullDate} at ${time}`;
      statusBadgeText = "Past Due";
    } else {
      relative = `${fullDate} at ${time}`;
      statusBadgeText = date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  }

  return {
    date: fullDate,
    time,
    relative,
    isLive,
    isUpcoming,
    isPast,
    statusBadgeText,
  };
}

/**
 * Formats duration in minutes to human readable string (e.g., "45m", "1h 30m").
 */
export function formatDuration(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return "30m";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

/**
 * Robust clipboard copy helper with fallback for environments without navigator.clipboard.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
