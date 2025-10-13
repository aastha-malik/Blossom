from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import User
from auth import pwd_context
from jose import jwt, JWTError
from datetime import timedelta, datetime
import random
from email_verify import send_email
from password_reset import password_reset
# JWT has  => header | payload | SIGNATURE

# below part is SIGNATURE
SECRET_KEY = "blossom_app"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30


# creating user => registration part
def create_user(db:Session, username:str, hashed_password:str, email:str):
    email_token = random.randint(99999, 1000000)
    new_user = User( username=username, hashed_password=hashed_password, email=email, user_verification_token=str(email_token) )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_user.user_verification_token_expires_at = datetime.utcnow() + timedelta(minutes=30)
    db.commit()
    email_body = f" Hello! Please verify your Email for Blossom  {email_token}  Thank you!"
    send_email(email, "Verify your Blossom Account", email_body)

    return new_user

#to verify the email
def verify_email(db:Session, email:str, verification_token:str):
    user = db.query(User).filter(User.email == email).first()
    if user:
        if user.user_verification_token == verification_token and user.user_verification_token_expires_at > datetime.utcnow():
            user.user_verified = True
            user.user_verification_token = None
            user.user_verification_token_expires_at = None
            db.commit()
            return True
        else:
            return False

#authenticate user => Login part
def authenticate_user(db:Session, username:str, email:str, password:str):
    user = db.query(User).filter(or_(User.username == username, User.email == email)).first()
    if user is None:
        return None
    password_check = pwd_context.verify(password, user.hashed_password)
    if not password_check:
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

#to reset password
def reset_password(db:Session, new_password:str, new_password_confirm: str, old_password:str, username:str):
    return password_reset(new_password, new_password_confirm, old_password, username)