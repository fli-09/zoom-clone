import random
import string
from typing import Optional
from sqlalchemy.orm import Session
from app.models import Meeting


def generate_room_id(db: Optional[Session] = None) -> str:
    """
    Generate a 3-part unique room identifier (e.g. 'abc-defg-hij').
    Checks uniqueness in the database if db session is provided.
    """
    letters = string.ascii_lowercase
    while True:
        part1 = "".join(random.choices(letters, k=3))
        part2 = "".join(random.choices(letters, k=4))
        part3 = "".join(random.choices(letters, k=3))
        candidate_room_id = f"{part1}-{part2}-{part3}"
        if db is None:
            return candidate_room_id
        existing = db.query(Meeting).filter(Meeting.room_id == candidate_room_id).first()
        if not existing:
            return candidate_room_id
