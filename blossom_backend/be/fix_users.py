from database import SessionLocal
from models import User

def fix_google_users():
    db = SessionLocal()
    try:
        # Find users who have a password but are still marked as 'google' provider
        users = db.query(User).filter(User.provider == 'google', User.hashed_password != "").all()
        for user in users:
            print(f"Fixing user: {user.username}")
            user.provider = None
        db.commit()
        print(f"Fixed {len(users)} users.")
    finally:
        db.close()

if __name__ == "__main__":
    fix_google_users()
