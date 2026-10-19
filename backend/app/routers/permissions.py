
from fastapi import APIRouter, Depends

from app.models import User
from app.security import get_current_user, require_roles

router = APIRouter(
    prefix="/permissions",
    tags=["Permissions"]
)


@router.get("/me")
def my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role
    }


@router.get("/admin")
def admin_only(
    current_user: User = Depends(require_roles("ADMIN"))
):
    return {
        "message": "Chào ADMIN",
        "username": current_user.username
    }


@router.get("/teacher")
def teacher_only(
    current_user: User = Depends(require_roles("TEACHER"))
):
    return {
        "message": "Chào TEACHER",
        "username": current_user.username
    }


@router.get("/student")
def student_only(
    current_user: User = Depends(require_roles("STUDENT"))
):
    return {
        "message": "Chào STUDENT",
        "username": current_user.username
    }
