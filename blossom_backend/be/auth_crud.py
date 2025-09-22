from sqlalchemy.orm import Session
from sqlalchemy import or_
from be.models import User
from be.auth import pwd_context
from jose import jwt
from datetime import timedelta, datetime

SECRET_KEY = "blossom_app"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30


# creating user => registration part
def create_user(db:Session, username:str, hashed_password:str, email:str):
    new_user = User( username=username, hashed_password=hashed_password, email=email )
    db.add(new_user)
    db.commit()
    db.refresh()
    return new_user

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
