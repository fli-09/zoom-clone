import {
  HealthCheckResponse,
  MeetingCreate,
  MeetingResponse,
} from "./types";

export type {
  HealthCheckResponse,
  MeetingCreate,
  MeetingResponse,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:8000";

/**
 * Fetch backend health status.
 *
 * Endpoint: GET /api/health
 * Return Shape: Promise<HealthCheckResponse> { status: string, message: string }
 */
export async function fetchHealthCheck(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_URL}/api/health`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch health check: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all scheduled upcoming meetings ordered chronologically.
 *
 * Endpoint: GET /api/meetings/upcoming
 * Return Shape: Promise<MeetingResponse[]>
 */
export async function getUpcomingMeetings(): Promise<MeetingResponse[]> {
  const response = await fetch(`${API_URL}/api/meetings/upcoming`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Failed to fetch upcoming meetings (${response.status}): ${errorText || response.statusText}`
    );
  }
  return response.json();
}

/**
 * Fetch past, ended, or concluded meetings ordered by most recent first.
 *
 * Endpoint: GET /api/meetings/recent
 * Return Shape: Promise<MeetingResponse[]>
 */
export async function getRecentMeetings(): Promise<MeetingResponse[]> {
  const response = await fetch(`${API_URL}/api/meetings/recent`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Failed to fetch recent meetings (${response.status}): ${errorText || response.statusText}`
    );
  }
  return response.json();
}

/**
 * Create a new instant meeting immediately.
 * Sets meeting status to 'in_progress', auto-generates a unique room_id.
 *
 * Endpoint: POST /api/meetings/instant
 * Return Shape: Promise<MeetingResponse>
 */
export async function createInstantMeeting(): Promise<MeetingResponse> {
  const response = await fetch(`${API_URL}/api/meetings/instant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Failed to create instant meeting (${response.status}): ${errorText || response.statusText}`
    );
  }
  return response.json();
}

/**
 * Create a new scheduled meeting.
 *
 * Endpoint: POST /api/meetings/
 * Return Shape: Promise<MeetingResponse>
 */
export async function createScheduledMeeting(
  meetingData: MeetingCreate
): Promise<MeetingResponse> {
  const response = await fetch(`${API_URL}/api/meetings/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(meetingData),
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Failed to schedule meeting (${response.status}): ${errorText || response.statusText}`
    );
  }
  return response.json();
}

