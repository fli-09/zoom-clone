from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
from app.utils import generate_room_id

router = APIRouter(
    prefix="/api/meetings",
    tags=["meetings"],
)


@router.get("/", response_model=List[schemas.MeetingResponse])
def get_meetings(db: Session = Depends(get_db)):
    meetings = db.query(models.Meeting).order_by(models.Meeting.created_at.desc()).all()
    return meetings


@router.post("/", response_model=schemas.MeetingResponse)
def create_meeting(meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    room_id = generate_room_id(db)
    db_meeting = models.Meeting(
        title=meeting.title,
        room_id=room_id,
        description=meeting.description,
        type=meeting.type or "SCHEDULED",
        status=meeting.status or "SCHEDULED",
        start_time=meeting.start_time,
        duration=meeting.duration,
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting
