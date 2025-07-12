from sqlalchemy.orm import Session
from models import User
from auth import pwd_context
from jose import jwt
from datetime import timedelta, datetime

SECRET_KEY = "blossom_focus"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30


# creating user => registration part
def create_user(db:Session, username:str, hashed_password:str, user:User):
    new_user = user(db, username=username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh()
    return new_user

#authenticate user => Login part
def authenticate_user(db:Session, username:str, password:str):
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        return None
    pwd_context.verify(password, user.hashed_password)
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
