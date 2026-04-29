from models import User
from sqlalchemy.orm import Session
from auth import pwd_context, truncate_password

#fetch password
#check the old password (correct or not)
#if correct : store(update db) new hashed password if (new_hash_password === new_hash_password_confirm) [infact for new_pass and new_pass_confirm hash is not imp]

def password_reset(db:Session, new_password:str, new_password_confirm: str, old_password:str, username:str):
    user =  db.query(User).filter(User.username == username).first()
    if user:
        # Truncate passwords to 72 bytes (bcrypt limit)
        truncated_old_password = truncate_password(old_password)
        if pwd_context.verify(truncated_old_password, user.hashed_password):
            if new_password == new_password_confirm:
                truncated_new_password = truncate_password(new_password)
                new_hashed_password = pwd_context.hash(truncated_new_password)
                user.hashed_password = new_hashed_password
                db.commit()
                db.refresh(user)
                return True
            else:
                print("new_password != new_password_confirm")
                return False
        else:
            print("old_hash_password != user.hashed_password (old password is incorrect)")
            return False
    else:
        print("user not found (username is incorrect)")
        return False



