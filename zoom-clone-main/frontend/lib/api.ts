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
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "https://zoom-clone-backend-uot2.onrender.com";

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

/**
 * Fetch and validate a meeting room by room_id.
 *
 * Endpoint: GET /api/meetings/{room_id}
 * Return Shape: Promise<MeetingResponse>
 */
export async function getMeetingByRoomId(roomId: string): Promise<MeetingResponse> {
  const response = await fetch(`${API_URL}/api/meetings/${encodeURIComponent(roomId)}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Meeting room '${roomId}' does not exist.`);
    }
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Failed to validate meeting (${response.status}): ${errorText || response.statusText}`
    );
  }
  return response.json();
}

/**
 * Save meeting recording metadata to the database.
 *
 * Endpoint: POST /api/meetings/{room_id}/recordings
 */
export async function saveMeetingRecording(
  roomId: string,
  recording: { file_name: string; duration_seconds?: number; file_size_bytes?: number }
): Promise<unknown> {
  const response = await fetch(`${API_URL}/api/meetings/${encodeURIComponent(roomId)}/recordings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recording),
  });
  if (!response.ok) {
    throw new Error(`Failed to save recording (${response.status})`);
  }
  return response.json();
}

/**
 * Helper to construct the WebSocket URL for live meeting room sync.
 */
export function getWebSocketUrl(roomId: string, participantId: string, name: string): string {
  const base = API_URL.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
  const params = new URLSearchParams({
    participant_id: participantId,
    name: name,
  });
  return `${base}/ws/meeting/${encodeURIComponent(roomId)}?${params.toString()}`;
}

