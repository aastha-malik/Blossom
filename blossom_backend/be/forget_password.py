from email_verify import send_email
import random
from auth import pwd_context, truncate_password
from models import User
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, timedelta



def to_confirm_email(db:Session, email:str):
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    else:
        email_token = random.randint(100000, 999999)
        user.user_verification_token = str(email_token)
        user.user_verification_token_expires_at = datetime.utcnow() + timedelta(minutes=15)
        db.commit()
        success = send_email(user.email, "OTP for Password Reset" ,f"please enter the OTP in the app : {email_token}")
        if success:
            print(f"✅ Password reset OTP sent to {user.email}")
        else:
            print(f"❌ CRITICAL: Failed to send password reset OTP to {user.email}")
        
        return {"message": "OTP processed"}


from sqlalchemy import or_

def forget_password(db:Session, entered_verify_code:str, identity:str, new_password:str, new_password_confirm:str):
    user = db.query(User).filter(or_(User.username == identity, User.email == identity)).first()
    if user:
        if entered_verify_code == user.user_verification_token :
            if user.user_verification_token_expires_at > datetime.utcnow():
                if new_password == new_password_confirm:
                    # Truncate password to 72 bytes (bcrypt limit)
                    truncated_password = truncate_password(new_password)
                    hashed_password = pwd_context.hash(truncated_password)
                    user.hashed_password = hashed_password
                    db.commit()
                    db.refresh(user)
                    return True
                else:
                    print("new_password != new_password_confirm")
                    return False  # Return False for password mismatch
            else:
                print("Times Up to verify email!")
                return False  # Return False for expired token
        else:
            print("Verification code doesn't match")
            return False  # Return False for token mismatch
    else:
        print("User not found")
        return False  # Return False for user not found
        

