from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class MeetingBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: Optional[str] = "SCHEDULED"
    status: Optional[str] = "SCHEDULED"
    start_time: Optional[datetime] = None
    duration: Optional[int] = None


class MeetingCreate(MeetingBase):
    pass


class MeetingResponse(MeetingBase):
    id: int
    room_id: str
    host_id: Optional[int] = None
    end_time: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    email: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ParticipantBase(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = "participant"


class ParticipantCreate(ParticipantBase):
    meeting_id: int
    user_id: Optional[int] = None


class ParticipantResponse(ParticipantBase):
    id: int
    meeting_id: int
    user_id: Optional[int] = None
    joined_at: datetime
    left_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class HealthCheckResponse(BaseModel):
    status: str
    message: str


class RecordingCreate(BaseModel):
    file_name: str
    file_size_bytes: Optional[int] = None
    duration_seconds: Optional[int] = None
    recording_url: Optional[str] = None


class RecordingResponse(BaseModel):
    id: int
    meeting_id: int
    file_name: str
    file_size_bytes: Optional[int] = None
    duration_seconds: Optional[int] = None
    recording_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
