from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# Đường dẫn đến database SQLite
DATABASE_URL = "sqlite:///./exam.db"


# Tạo engine kết nối database
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)


# Tạo Session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Base dùng để tạo các Model
Base = declarative_base()


# Hàm lấy database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()