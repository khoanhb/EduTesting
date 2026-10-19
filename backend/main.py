
from fastapi import FastAPI

from app.database.database import Base, engine
from app.models import User, Subject, Chapter
from app.routers import users, auth, permissions, subjects, chapters


app = FastAPI(
    title="Online Exam System API",
    description="Backend hệ thống khảo thí online",
    version="1.0.0"
)

# Tao cac bang database
Base.metadata.create_all(bind=engine)

# Dang ky Router
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(permissions.router)
app.include_router(subjects.router)
app.include_router(chapters.router)


@app.get("/")
def home():
    return {
        "message": "Exam System Backend is running!"
    }
