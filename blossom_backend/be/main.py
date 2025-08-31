from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from be import task_crud
from be import pet_crud
from be import auth_crud
from be import stats
from be import models
from be.database import SessionLocal, engine, Base
from pydantic import BaseModel
from datetime import datetime
from be.auth_crud import SECRET_KEY, ALGORITHM
from jose import jwt
from datetime import timedelta
from be.models import User
from be.auth import pwd_context
from fastapi.middleware.cors import CORSMiddleware


models.Base.metadata.create_all(bind=engine)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allows all origins, you can specify a list of allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

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
    return {"message": "This is Task Manager side of our app Blossom!!"}

"""
This is Task Manager api routes below.
"""

@app.post("/tasks")
def create_task_endpoint(task: TaskCreate, db: Session = Depends(get_db)):
    task = task_crud.create_task(db, task.title)
    if task:
        return task
    else:
        raise HTTPException(status_code=400, detail="Task creation failed")

@app.get("/tasks")
def get_all_tasks_endpoint(db:Session = Depends(get_db)):
    task = task_crud.get_all_tasks(db)
    if task:
        return task
    else:
        raise HTTPException(status_code=404, detail="Task not found")

@app.put("/tasks/{title}")
def update_task_endpoint(title: str, db : Session = Depends(get_db)):
    task = task_crud.update_task(db, title)
    if task:
        return task
    else:
        raise HTTPException(status_code=400, detail="Updating Task Failed")

class TaskCompletionUpdate(BaseModel):
    completed: bool

@app.patch("/tasks/{task_id}")
def update_task_completion_endpoint(task_id: int, task_update: TaskCompletionUpdate, db: Session = Depends(get_db)):
    task = task_crud.update_task_completion(db, task_id, task_update.completed)
    if task:
        return task
    else:
        raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/tasks/{task_id}")
def delete_task_by_id_endpoint(task_id: int, db: Session = Depends(get_db)):
    result = task_crud.delete_task_by_id(db, task_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Task not found")
    else:
        return result

"""
this is Pet Backend api routes below.
"""

class PetCreate(BaseModel):
    name: str
    age: int
    hunger: int

@app.post("/pet")
def create_pet_endpoint(pet: PetCreate, db:Session = Depends(get_db)):
    pet = pet_crud.create_pet(db, pet.name, pet.age, pet.hunger, last_fed=datetime.utcnow())
    if pet:
        return pet
    else:
        raise HTTPException(status_code=400, detail="Pet creation Failed")


@app.get("/pet")
def get_all_pets_endpoint(db:Session = Depends(get_db)):
    pets = pet_crud.get_all_pets(db)
    if pets:
        return pets
    else:
        raise HTTPException(status_code=404, detail="Pet not found")


class PetUpdate(BaseModel):
    hunger:int
    last_fed: datetime
    age: float

@app.put("/pet/{id}")
def update_pet_endpoint(pet_update:PetUpdate, id:int, db:Session = Depends(get_db)):
    pet = pet_crud.update_pet(db, id, pet_update.hunger, pet_update.age, pet_update.last_fed)
    if pet:
        return pet
    else:
        raise HTTPException(status_code=400, detail="Pet Updating Failed")


@app.delete("/pet/{id}")
def delete_pet_endpoint(id:int, db:Session = Depends(get_db)):
    pet = pet_crud.delete_pet(db, id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    else:
        return {"message": "Pet Deleted Succesfully!!"}
"""
this is Auth Backend api routes below.  => basicaally the LOGIN part
"""

def get_current_user(token:str = Depends(oauth2_scheme), db:Session = Depends(get_db)):
    decode_jwt = jwt.decode(token, SECRET_KEY, algorithm=ALGORITHM)
    username = decode_jwt.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if user:
        return user
    else:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")


@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db:Session = Depends(get_db)):
    username = form_data.username
    password = form_data.password
    user = auth_crud.authenticate_user(db, username, password)
    data = {"sub": username}
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
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

"""
this is Analysis Backend api routes below.
"""
@app.get("/stats/{user_id}/all_time")
def get_user_stats_all_time(user_id: int, db: Session = Depends(get_db)):
    user_stats = stats.get_user_stats(db, user_id, stats.start_of_all_time)
    if user_stats is None:
        raise HTTPException(status_code=404, detail="User stats not found")
    else:
        return user_stats
    
@app.get("/stats/{user_id}/today")
def get_user_stats_today(user_id: int, db: Session = Depends(get_db)):
    user_stats = stats.get_user_stats(db, user_id, stats.start_of_today)
    if user_stats is None:
        raise HTTPException(status_code=404, detail="User stats not found")
    else:
        return user_stats
    
@app.get("/stats/{user_id}/week")
def get_user_stats_week(user_id: int, db: Session = Depends(get_db)):
    user_stats = stats.get_user_stats(db, user_id, stats.start_of_week)
    if user_stats is None:
        raise HTTPException(status_code=404, detail="User stats not found")
    else:
        return user_stats
    
@app.get("/stats/{user_id}/month")
def get_user_stats_month(user_id: int, db: Session = Depends(get_db)):
    user_stats = stats.get_user_stats(db, user_id, stats.start_of_month)
    if user_stats is None:
        raise HTTPException(status_code=404, detail="User stats not found")
    else:
        return user_stats
    
@app.get("/stats/{user_id}/year")
def get_user_stats_year(user_id: int, db: Session = Depends(get_db)):
    user_stats = stats.get_user_stats(db, user_id, stats.start_of_year)
    if user_stats is None:
        raise HTTPException(status_code=404, detail="User stats not found")
    else:
        return user_stats