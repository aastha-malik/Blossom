from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import User
from auth import pwd_context, truncate_password
from jose import jwt, JWTError
from datetime import timedelta, datetime
import random
import os
from email_verify import send_email
from password_reset import password_reset
from forget_password import forget_password
# JWT has  => header | payload | SIGNATURE

# below part is SIGNATURE
SECRET_KEY = os.getenv("SECRET_KEY", "tendr_fallback_secret_12345")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_DAYS = int(os.getenv("ACCESS_TOKEN_EXPIRE_DAYS", "1"))

# 72 = 72 characters max password length

# creating user => registration part
def create_user(db:Session, username:str, plain_password:str, email:str):
    email_token = random.randint(100000, 999999)
    # Truncate password to 72 bytes (bcrypt limit)
    truncated_password = truncate_password(plain_password)
    hashed_password = pwd_context.hash(truncated_password)
    new_user = User( username=username, hashed_password=hashed_password, email=email, user_verification_token=str(email_token), start_acc_time= datetime.utcnow())

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    new_user.user_verification_token = str(email_token)
    new_user.user_verification_token_expires_at = datetime.utcnow() + timedelta(minutes=30)
    db.commit()
    plain_body = (
        f"Hi {username},\n\n"
        f"Welcome to Tendr. Your verification code is:\n\n"
        f"  {email_token}\n\n"
        f"This code expires in 30 minutes. If you didn't sign up, you can ignore this email.\n\n"
        f"— The Tendr team"
    )
    html_body = f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#faf9f7;border:1px solid #e5e3de;padding:48px 44px;">
        <tr>
          <td style="font-family:'Georgia',serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#9e9b94;padding-bottom:24px;">
            TENDR
          </td>
        </tr>
        <tr>
          <td style="font-family:'Georgia',serif;font-size:28px;font-style:italic;color:#1a1916;padding-bottom:8px;line-height:1.2;">
            Verify your account.
          </td>
        </tr>
        <tr>
          <td style="font-family:'Georgia',serif;font-size:15px;color:#6b6860;padding-bottom:32px;line-height:1.6;">
            Hi {username}, welcome. Enter this code to get started.
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:32px;">
            <div style="display:inline-block;background:#1a1916;color:#faf9f7;font-family:'Courier New',monospace;font-size:36px;letter-spacing:10px;padding:20px 36px;">
              {email_token}
            </div>
          </td>
        </tr>
        <tr>
          <td style="font-family:'Georgia',serif;font-size:13px;color:#9e9b94;padding-bottom:24px;line-height:1.6;border-top:1px solid #e5e3de;padding-top:24px;">
            This code expires in <strong>30 minutes</strong>. If you didn't create a Tendr account, you can safely ignore this email.
          </td>
        </tr>
        <tr>
          <td style="font-family:'Georgia',serif;font-size:12px;color:#c4c1ba;letter-spacing:1px;">
            — The Tendr team
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
    success = send_email(email, "Verify your Tendr account", plain_body, html_body=html_body)
    
    if success:
        print(f"✅ Verification email sent to {email}")
    else:
        print(f"❌ CRITICAL: Failed to send verification email to {email}")
        # Note: We still return the user because they are already in the DB, 
        # but they will be 'unverified' and unable to log in.
    
    return new_user

#to verify the email
def verify_email(db:Session, email:str, verification_token:str):
    user = db.query(User).filter(User.email == email).first()
    if user:
        if user.user_verification_token == verification_token and user.user_verification_token_expires_at > datetime.utcnow():
            user.user_verified = True
            user.user_verification_token = None
            user.user_verification_token_expires_at = None
            db.add(user)
            db.commit()
            db.refresh(user)
            
            return True
        else:
            return False

#authenticate user => Login part
def authenticate_user(db:Session, username:str, email:str, password:str):
    user = db.query(User).filter(or_(User.username == username, User.email == email)).first()
    if user is None:
        print("user not found")
        return None
    
    # Check if email is verified (skip for Google OAuth users)
    if not user.user_verified and user.provider != "google":
        print("email not verified")
        return "unverified"
    
    # Truncate password to 72 bytes (bcrypt limit)
    truncated_password = truncate_password(password)
    password_check = pwd_context.verify(truncated_password, user.hashed_password)
    if not password_check:
        print("password not matched")
        return None
    return user
    

# Creating JWT token
def create_access_token(data:dict, expires_delta:timedelta):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() +  timedelta(minutes=20)
    to_encode.update({"exp":expire})
    encode_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encode_jwt

# delete account
def del_user(db:Session, user_id: str, plain_password:str):
    user = db.query(User).filter(User.id == user_id).first()
    # Note: Cascading delete in DB should handle tasks and pets if configured, 
    # but let's ensure the user object exists first.
    if user is None:
        print("user not found")
        return None
    # Truncate password to 72 bytes (bcrypt limit)
    truncated_password = truncate_password(plain_password)
    password_check = pwd_context.verify(truncated_password, user.hashed_password)
    if not password_check:
        print("password not matched")
        return False
    db.delete(user)
    db.commit()
    return True

#to reset password
def reset_password(db:Session, new_password:str, new_password_confirm: str, old_password:str, username:str):
    return password_reset(db, new_password, new_password_confirm, old_password, username)

#when user forgot password while login
def forgot_password(db:Session, entered_verify_code:str, new_password:str, new_password_confirm:str, username:str):
    return forget_password(db, entered_verify_code, username, new_password, new_password_confirm)