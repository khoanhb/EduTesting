
from sqlalchemy import Column, Integer, String
from app.database.database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False, unique=True)

    code = Column(String(20), nullable=False, unique=True)

    description = Column(String(255), nullable=True)
