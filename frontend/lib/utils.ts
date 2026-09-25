import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes safely with clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats an ISO date string into readable date and time.
 * e.g., "Today at 3:30 PM", "Tomorrow at 10:00 AM", or "Oct 24, 2026 at 2:00 PM"
 */
export function formatMeetingDate(dateString?: string | null): {
  date: string;
  time: string;
  relative: string;
} {
  if (!dateString) {
    return { date: "TBD", time: "TBD", relative: "Scheduled" };
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { date: "TBD", time: "TBD", relative: "Scheduled" };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (targetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  let relative = "";
  if (diffDays === 0) {
    relative = "Today";
  } else if (diffDays === 1) {
    relative = "Tomorrow";
  } else if (diffDays === -1) {
    relative = "Yesterday";
  } else if (diffDays > 1 && diffDays < 7) {
    relative = date.toLocaleDateString("en-US", { weekday: "short" });
  } else {
    relative = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const fullDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });

  return { date: fullDate, time, relative };
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
