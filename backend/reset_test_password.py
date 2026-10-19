import sqlite3
from app.security import hash_password, verify_password

username = "student03"
new_password = "Test123456!"

# Tạo mật khẩu đã mã hóa
hashed_password = hash_password(new_password)

# Kiểm tra mã hóa
assert verify_password(new_password, hashed_password)

# Kết nối database
db = sqlite3.connect("exam.db")

try:
    cursor = db.execute(
        "UPDATE users SET password = ? WHERE username = ?",
        (hashed_password, username)
    )

    if cursor.rowcount == 0:
        print("Khong tim thay tai khoan student03")
    else:
        db.commit()
        print("Dat lai mat khau thanh cong!")
        print("Kiem tra Argon2:", verify_password(
            new_password,
            hashed_password
        ))

finally:
    db.close()