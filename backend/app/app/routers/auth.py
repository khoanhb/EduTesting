from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.database import get_db
from app.models import User
from app.security import verify_password, create_access_token


# Khởi tạo Authentication Router
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# Dữ liệu đăng nhập
class LoginRequest(BaseModel):
    username: str
    password: str


# API đăng nhập
@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    # Tìm tài khoản
    user = db.query(User).filter(
        User.username == data.username
    ).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Tên đăng nhập hoặc mật khẩu không đúng"
        )

    # Kiểm tra mật khẩu
    if not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Tên đăng nhập hoặc mật khẩu không đúng"
        )

    # Tạo JWT
    access_token = create_access_token(
        user_id=user.id,
        role=user.role
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }