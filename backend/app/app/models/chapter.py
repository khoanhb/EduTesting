
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)

    subject_id = Column(
        Integer,
        ForeignKey("subjects.id"),
        nullable=False
    )

    name = Column(String(200), nullable=False)

    description = Column(String(500), nullable=True)

    order_number = Column(Integer, nullable=False, default=1)

    subject = relationship("Subject")
from app.models.chapter import Chapter