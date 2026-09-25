from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app import models, schemas
from app.utils import generate_room_id

router = APIRouter(
    prefix="/api/meetings",
    tags=["meetings"],
)


@router.get("/", response_model=List[schemas.MeetingResponse])
def get_meetings(db: Session = Depends(get_db)):
    """
    Retrieve all meetings ordered by creation date descending.
    """
    meetings = db.query(models.Meeting).order_by(models.Meeting.created_at.desc()).all()
    return meetings


@router.get("/upcoming", response_model=List[schemas.MeetingResponse])
def get_upcoming_meetings(db: Session = Depends(get_db)):
    """
    Retrieve active and scheduled upcoming meetings.
    Ordered by start time ascending so the next upcoming or live meeting appears first.
    """
    meetings = (
        db.query(models.Meeting)
        .filter(models.Meeting.status.in_(["SCHEDULED", "scheduled", "in_progress", "IN_PROGRESS"]))
        .order_by(models.Meeting.start_time.asc().nullslast(), models.Meeting.created_at.desc())
        .all()
    )
    return meetings


@router.get("/recent", response_model=List[schemas.MeetingResponse])
def get_recent_meetings(db: Session = Depends(get_db)):
    """
    Retrieve past or concluded meetings (ended or cancelled).
    Ordered by conclusion time or creation time descending.
    """
    meetings = (
        db.query(models.Meeting)
        .filter(models.Meeting.status.in_(["ENDED", "ended", "CANCELLED", "cancelled"]))
        .order_by(models.Meeting.end_time.desc().nullslast(), models.Meeting.created_at.desc())
        .all()
    )
    return meetings


@router.post("/", response_model=schemas.MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    """
    Create a scheduled meeting with customized title and time.
    """
    room_id = generate_room_id(db)
    now = datetime.now(timezone.utc)
    db_meeting = models.Meeting(
        title=meeting.title,
        room_id=room_id,
        description=meeting.description,
        type=meeting.type or "SCHEDULED",
        status=meeting.status or "SCHEDULED",
        start_time=meeting.start_time,
        duration=meeting.duration,
        created_at=now,
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting


@router.post("/instant", response_model=schemas.MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_instant_meeting(db: Session = Depends(get_db)):
    """
    Create an instant meeting immediately and return its room_id for fast redirection.
    Sets status to 'in_progress' and auto-assigns the default host user if present.
    """
    room_id = generate_room_id(db)
    now = datetime.now(timezone.utc)
    default_user = db.query(models.User).filter_by(email="user@example.com").first()
    host_id = default_user.id if default_user else None

    db_meeting = models.Meeting(
        title="Instant Meeting",
        room_id=room_id,
        type="INSTANT",
        status="in_progress",
        host_id=host_id,
        start_time=now,
        created_at=now,
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)

    if default_user:
        participant = models.Participant(
            meeting_id=db_meeting.id,
            user_id=default_user.id,
            name=default_user.name or "Host",
            role="host",
            joined_at=now,
        )
        db.add(participant)
        db.commit()

    return db_meeting


@router.get("/{room_id}", response_model=schemas.MeetingResponse)
def get_meeting_by_room_id(room_id: str, db: Session = Depends(get_db)):
    """
    Retrieve and validate a meeting by its unique room_id.
    Returns 404 if the meeting room does not exist.
    """
    meeting = db.query(models.Meeting).filter(models.Meeting.room_id == room_id).first()
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting room '{room_id}' not found."
        )
    return meeting


@router.post("/{room_id}/recordings", response_model=schemas.RecordingResponse, status_code=status.HTTP_201_CREATED)
def create_meeting_recording(room_id: str, recording_in: schemas.RecordingCreate, db: Session = Depends(get_db)):
    """
    Save meeting recording metadata to the database.
    """
    meeting = db.query(models.Meeting).filter(models.Meeting.room_id == room_id).first()
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting room '{room_id}' not found."
        )

    db_rec = models.Recording(
        meeting_id=meeting.id,
        file_name=recording_in.file_name,
        file_size_bytes=recording_in.file_size_bytes,
        duration_seconds=recording_in.duration_seconds,
        recording_url=recording_in.recording_url or f"/recordings/{recording_in.file_name}",
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_rec)
    db.commit()
    db.refresh(db_rec)
    return db_rec


@router.get("/{room_id}/recordings", response_model=List[schemas.RecordingResponse])
def get_meeting_recordings(room_id: str, db: Session = Depends(get_db)):
    """
    Retrieve all recordings saved for a specific meeting room.
    """
    meeting = db.query(models.Meeting).filter(models.Meeting.room_id == room_id).first()
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting room '{room_id}' not found."
        )
    return meeting.recordings

