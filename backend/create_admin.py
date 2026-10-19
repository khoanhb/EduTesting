
from app.database.database import SessionLocal
from app.models import User
from app.security import hash_password


def create_admin():
    db = SessionLocal()

    try:
        # Kiem tra tai khoan ADMIN da ton tai chua
        existing_user = db.query(User).filter(
            User.username == "admin01"
        ).first()

        if existing_user:
            print("Tai khoan admin01 da ton tai!")
            return

        # Nhap mat khau tu Terminal
        print("=== TAO TAI KHOAN ADMIN ===")
        password = input("Nhap mat khau ADMIN: ")

        # Kiem tra do dai mat khau
        if len(password) < 12:
            print("Mat khau phai co it nhat 12 ky tu!")
            return

        # Tao tai khoan ADMIN
        admin = User(
            username="admin01",
            password=hash_password(password),
            full_name="System Administrator",
            email="admin01@example.com",
            role="ADMIN"
        )

        db.add(admin)
        db.commit()

        print("Tao tai khoan ADMIN thanh cong!")
        print("Username: admin01")
        print("Role: ADMIN")

    except Exception as e:
        db.rollback()
        print("Co loi xay ra:", e)

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
