import sys
import logging
from datetime import datetime, timezone, timedelta
from app.database import engine, Base, SessionLocal
from app import models

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed")


def seed_database():
    """
    Initial database seed script.
    Creates default user and initial meetings/participants if they do not already exist.
    Idempotent: safe to run once post-deployment without duplicating data.
    """
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Create or retrieve default user
        user = db.query(models.User).filter_by(email="user@example.com").first()
        if not user:
            logger.info("Creating default host user...")
            user = models.User(
                email="user@example.com",
                name="Default User",
                avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=DefaultUser",
                created_at=datetime.now(timezone.utc)
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Default user created with ID {user.id}")
        else:
            logger.info(f"Default user already exists with ID {user.id}")

        # 2. Check if meetings already seeded
        existing_meetings_count = db.query(models.Meeting).count()
        if existing_meetings_count > 0:
            logger.info(f"Database already contains {existing_meetings_count} meetings. Skipping meeting seeding.")
            return

        logger.info("Seeding initial meetings and participants...")
        now = datetime.now(timezone.utc)

        seed_data = [
            {
                "title": "Sprint Planning & Backlog Refinement",
                "room_id": "kgr-qtec-jat",
                "description": "Weekly team sprint planning meeting to review user stories and allocate tasks.",
                "type": "SCHEDULED",
                "status": "SCHEDULED",
                "start_time": now + timedelta(days=1),
                "duration": 60,
            },
            {
                "title": "Product Design Review",
                "room_id": "cuh-bkwv-cuv",
                "description": "Review new UI mockups and user flow diagrams with the product design team.",
                "type": "SCHEDULED",
                "status": "SCHEDULED",
                "start_time": now + timedelta(days=2),
                "duration": 45,
            },
            {
                "title": "All-Hands Quarterly Alignment",
                "room_id": "hcg-zpua-vvw",
                "description": "Quarterly company-wide update and Q&A session.",
                "type": "SCHEDULED",
                "status": "SCHEDULED",
                "start_time": now + timedelta(days=3),
                "duration": 90,
            },
            {
                "title": "Architecture & API Schema Sync",
                "room_id": "vtv-nuty-yuv",
                "description": "Discussing database models, SQLAlchemy schemas, and REST endpoints.",
                "type": "SCHEDULED",
                "status": "ENDED",
                "start_time": now - timedelta(days=3),
                "end_time": now - timedelta(days=3) + timedelta(minutes=60),
                "duration": 60,
            },
            {
                "title": "Frontend-Backend Integration Check",
                "room_id": "jhp-aubi-zus",
                "description": "Testing FastAPI health endpoints and CORS configuration with Next.js frontend.",
                "type": "INSTANT",
                "status": "ENDED",
                "start_time": now - timedelta(days=2),
                "end_time": now - timedelta(days=2) + timedelta(minutes=30),
                "duration": 30,
            },
            {
                "title": "1-on-1 Weekly Catchup",
                "room_id": "zix-arjf-nak",
                "description": "Engineering lead and developer weekly status update.",
                "type": "SCHEDULED",
                "status": "ENDED",
                "start_time": now - timedelta(days=1),
                "end_time": now - timedelta(days=1) + timedelta(minutes=45),
                "duration": 45,
            },
        ]

        for item in seed_data:
            meeting = models.Meeting(
                title=item["title"],
                room_id=item["room_id"],
                description=item.get("description"),
                type=item.get("type", "SCHEDULED"),
                status=item.get("status", "SCHEDULED"),
                host_id=user.id,
                start_time=item.get("start_time"),
                end_time=item.get("end_time"),
                duration=item.get("duration"),
                created_at=now,
            )
            db.add(meeting)
            db.flush()

            # Add host participant
            participant = models.Participant(
                meeting_id=meeting.id,
                user_id=user.id,
                name=user.name,
                role="host",
                joined_at=meeting.start_time or now,
                left_at=meeting.end_time
            )
            db.add(participant)

        db.commit()
        logger.info("Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}", exc_info=True)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
