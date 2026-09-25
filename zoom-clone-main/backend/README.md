# Zoom Clone Backend (FastAPI & SQLAlchemy)

FastAPI REST API backend for the Zoom Clone application, featuring SQLAlchemy ORM models (`User`, `Meeting`, `Participant`), SQLite local storage, and environment-driven production configuration for Render, Railway, or Heroku deployment.

---

## 🚀 Environment Variables

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

### Configurable Variables

| Variable | Description | Local Dev Default | Production Example |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Database connection URI | `sqlite:///./sql_app.db` | `postgresql://user:pass@host:5432/dbname` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:3000` | `https://your-zoom-clone.vercel.app` |
| `PORT` | HTTP server port (injected by host platform) | `8000` | Injected dynamically by Render / Railway |

---

## 🛠️ Running Locally

1. **Activate Virtual Environment & Install Dependencies**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Seed Initial Database**:
   ```bash
   python -m app.seed
   ```

3. **Start FastAPI Development Server**:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

4. **Access API Documentation**:
   - Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc UI: [http://localhost:8000/redoc](http://localhost:8000/redoc)
   - Health Check Endpoint: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 📦 Deployment Instructions (Render / Railway)

1. **Configure Service**:
   - Deploy as a **Web Service**.
   - Build Command: `pip install -r requirements.txt`
   - Start Command (handled automatically by `Procfile`):
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

2. **Environment Variables**:
   Set `DATABASE_URL` (e.g. Render PostgreSQL or Railway Postgres) and `CORS_ORIGINS` (e.g. `https://your-frontend.vercel.app`) in your deployment dashboard.

3. **Database Migration & Table Auto-Creation**:
   - Tables (`users`, `meetings`, `participants`) are created automatically on app startup via `Base.metadata.create_all`.

4. **🌱 Initial Database Seeding (Post-Deploy Reminder)**:
   - **IMPORTANT**: The database seed script (`app/seed.py`) does **NOT** run automatically on app startup to prevent accidental data wipes upon service redeploys or restarts.
   - Run the seed script **once** manually after your first deployment via the platform terminal or SSH console:
     ```bash
     python -m app.seed
     ```
