import os
import uvicorn

if __name__ == "__main__":
    # Render, Railway, and Heroku inject the port via the PORT environment variable.
    # Reading it directly via Python avoids shell variable expansion issues ($PORT literal string errors).
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
