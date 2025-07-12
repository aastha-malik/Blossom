from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import task_crud as task_crud
import pet_crud as pet_crud
import auth_crud as auth_crud
import models
from database import SessionLocal, engine, Base
from pydantic import BaseModel
from datetime import datetime
from auth_crud import SECRET_KEY, ALGORITHM
from jose import jwt
from datetime import timedelta
from models import User
from auth import pwd_context

models.Base.metadata.create_all(bind=engine)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
app = FastAPI()
class TaskCreate(BaseModel):
    title: str

#this is for testing my code (good while using fastapi)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "This is Task Manager side of our app Blossom Focus!!"}

"""
This is Task Manager api routes below.
"""

@app.post("/tasks")
def create_task_endpoint(task: TaskCreate, db: Session = Depends(get_db)):
    task = task_crud.create_task(db, task.title)
    return task

@app.get("/tasks")
def get_all_tasks_endpoint(db:Session = Depends(get_db)):
    task = task_crud.get_all_tasks(db)
    return task

@app.put("/tasks/{title}")
def update_task_endpoint(title: str, db : Session = Depends(get_db)):
    task = task_crud.update_task(db, title)
    return task

@app.delete("/tasks/{title}")
def delete_task_endpoint(title: str, db: Session = Depends(get_db)):
    task_crud.delete_task(db, title)
    return {"message": "Task Deleted Succesfully!!"}

"""
this is Pet Backend api routes below.
"""

class PetCreate(BaseModel):
    name: str
    age: int
    hunger: int

@app.post("/pet")
def create_pet_endpoint(pet: PetCreate, db:Session = Depends(get_db)):
    pet = pet_crud.create_pet(db, pet.name, pet.age, pet.hunger)
    return pet

@app.get("/pet")
def get_all_pets_endpoint(db:Session = Depends(get_db)):
    pets = pet_crud.get_all_pets(db)
    return pets
class PetUpdate(BaseModel):
    hunger:int
    last_fed: datetime
    age: float
@app.put("/pet/{id}")
def update_pet_endpoint(pet_update:PetUpdate, id:int, db:Session = Depends(get_db)):
    pet = pet_crud.update_pet(db, id, pet_update.hunger, pet_update.age, pet_update.last_fed)
    return pet

@app.delete("/pet/{id}")
def delete_pet_endpoint(id:int, db:Session = Depends(get_db)):
    pet = pet_crud.delete_pet(db, id)
    return {"message": "Pet has been deleted sucessfully"}

"""
this is Auth Backend api routes below.  => basicaally the LOGIN part
"""

def get_current_user(token:str = Depends(oauth2_scheme), db:Session = Depends(get_db)):
    decode_jwt = jwt.decode(token, SECRET_KEY, algorithm=ALGORITHM)
    username = decode_jwt.get("sub")
    user = db.query(User).filter(User.username == username).first()
    return user

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db:Session = Depends(get_db)):
    username = form_data.username
    password = form_data.password
    user = auth_crud.authenticate_user(db, username, password)
    data = {"sub": username}
    if not user:
        return None
    else:
        token = auth_crud.create_access_token(data, expires_delta=timedelta(minutes=20))
        return {"access_token": token, "token_type": "bearer"}
        
"""
this is Registration Backend api routes below.
"""
class Registration_user(BaseModel):
    username: str
    password: str
@app.post("/register")
def register_user(user:Registration_user, db:Session = Depends(get_db)):
    hashed_password = pwd_context.hash(user.password)
    user_name = db.query(User).filter(User.username == user.username).first() 
    if not user_name:
        user = auth_crud.create_user(db, user.username, hashed_password)
        return {"message": "User Registered Sucessfully!!"}
    else:
        return {"message": "Username is already taken"}
