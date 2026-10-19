
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.models.chapter import Chapter

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    password = Column(String(255), nullable=False)

    full_name = Column(String(100), nullable=False)

    email = Column(String(100), unique=True, nullable=False)

    role = Column(
        String(20),
        nullable=False,
        default="STUDENT"
    )

    created_at = Column(DateTime, default=datetime.utcnow)


# Import model Subject
from app.models.subject import Subject
