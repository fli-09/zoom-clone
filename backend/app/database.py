import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Database URL configuration:
# Read DATABASE_URL from an environment variable via os.getenv.
# Dev behavior: Falls back to a local SQLite database ('sqlite:///./sql_app.db') for seamless local development without external dependencies.
# Prod behavior: In production (e.g. Render, Railway, or Heroku), DATABASE_URL is injected via dashboard/environment with a managed PostgreSQL URI.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

# Normalize PostgreSQL URL scheme if provided by cloud platforms (e.g. Render / Railway / Heroku).
# SQLAlchemy 1.4+ and 2.0 require the 'postgresql://' scheme instead of legacy 'postgres://'.
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# connect_args={"check_same_thread": False} is required only for SQLite to allow multiple threads to interact with the database session
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
