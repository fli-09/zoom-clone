/**
 * TypeScript types matching backend FastAPI schemas.
 */

export type MeetingStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "ENDED"
  | "CANCELLED"
  | "scheduled"
  | "in_progress"
  | "ended"
  | "cancelled";

export interface MeetingBase {
  title: string;
  description?: string | null;
  type?: string | null;
  status?: MeetingStatus | string | null;
  start_time?: string | null;
  duration?: number | null;
}

export type MeetingCreate = MeetingBase;

export interface MeetingResponse extends MeetingBase {
  id: number;
  room_id: string;
  host_id?: number | null;
  end_time?: string | null;
  created_at: string;
}

export interface UserBase {
  email: string;
  name?: string | null;
  avatar_url?: string | null;
}

export interface UserResponse extends UserBase {
  id: number;
  created_at: string;
}

export interface ParticipantBase {
  name?: string | null;
  role?: string | null;
}

export interface ParticipantResponse extends ParticipantBase {
  id: number;
  meeting_id: number;
  user_id?: number | null;
  joined_at: string;
  left_at?: string | null;
}

export interface HealthCheckResponse {
  status: string;
  message: string;
}

/**
 * UI Specific Types for Meeting Room & Interactions
 */
export interface MeetingParticipant {
  id: string | number;
  name: string;
  role?: "host" | "participant";
  isMuted?: boolean;
  isVideoOff?: boolean;
  isHandRaised?: boolean;
  isSpeaking?: boolean;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  timestamp: string;
  text: string;
  isMe?: boolean;
}
