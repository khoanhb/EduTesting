import sqlite3
from app.security import verify_password

db = sqlite3.connect("exam.db")

row = db.execute(
    "SELECT password FROM users WHERE username = ?",
    ("student03",)
).fetchone()

if row is None:
    print("Khong tim thay tai khoan")
else:
    result = verify_password("Test123456!", row[0])
    print("Ket qua:", result)

db.close()