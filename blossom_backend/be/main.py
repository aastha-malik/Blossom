from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from jose import jwt
import models
from models import User, Task
from database import SessionLocal, engine, Base
import task_crud
import pet_crud
import auth_crud
from forget_password import to_confirm_email
import stats
from auth import pwd_context
from auth_crud import SECRET_KEY, ALGORITHM
from auth_dependencies import get_current_user
from schemas import (
    TaskCreate, TaskResponse, TaskCompletionUpdate,
    PetCreate, PetUpdate, PetResponse,PetFeed,
    RegistrationUser, TokenResponse, DeleteAccountRequest
)
print("TaskResponse imported from:", TaskResponse)

# ---------------------------------------------------
# DATABASE & APP SETUP
# ---------------------------------------------------

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------
# DEPENDENCY
# ---------------------------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "This is Task Manager side of our app Blossom!!"}


@app.get("/user/xp")
def get_user_xp(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user's XP"""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Initialize XP to 100 if None
    if user.xp is None:
        user.xp = 100
        db.commit()
    return {"xp": user.xp}


# ---------------------------------------------------
# TASK ROUTES
# ---------------------------------------------------

@app.post("/tasks", response_model=None)
def create_task_endpoint(task: TaskCreate,current_user= Depends(get_current_user),db: Session = Depends(get_db)):
    task = task_crud.create_task(db, task.title, task.priority, current_user)
    if not task:
        raise HTTPException(status_code=400, detail="Task creation failed")
    return TaskResponse.model_validate(task)


@app.get("/tasks", response_model=list[TaskResponse])
def get_all_tasks_endpoint(current_user= Depends(get_current_user),db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.user_id == current_user.id, Task.completed == False).all()
    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found")
        print("No task found")
    return [TaskResponse.model_validate(t) for t in tasks]


@app.put("/tasks/{title}", response_model=TaskResponse)
def update_task_endpoint(
    title: str,
    current_user= Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = task_crud.update_task(db, title, current_user)
    if not task:
        raise HTTPException(status_code=400, detail="Updating Task Failed")
    return TaskResponse.model_validate(task)


@app.patch("/tasks/{task_id}", response_model=TaskResponse)
def update_task_completion_endpoint(
    task_id: int,
    task_update: TaskCompletionUpdate,
    current_user= Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task_data = task_crud.update_task_completion(db, task_id, task_update.completed, current_user)
    if not task_data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    print("Task completion data:", task_data)
    
    return task_data



@app.delete("/tasks/{task_id}")
def delete_task_by_id_endpoint(
    task_id: int,
    current_user= Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = task_crud.delete_task_by_id(db, task_id, current_user)
    if result is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}


# ---------------------------------------------------
# PET ROUTES
# ---------------------------------------------------

@app.post("/pets", response_model=PetResponse)
def create_pet_endpoint(
    pet: PetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    pet_data = pet_crud.create_pet(db, pet.name, pet.type, current_user)
    if not pet_data:
        raise HTTPException(status_code=400, detail="Pet creation failed")
    return pet_data



@app.get("/pet", response_model=list[PetResponse])
def get_all_pets_endpoint(
    current_user= Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pets = pet_crud.get_all_pets(db, current_user)
    if not pets:
        raise HTTPException(status_code=404, detail="No pets found")
    return [PetResponse.model_validate(p) for p in pets]




@app.put("/pet/{id}", response_model=PetResponse)
def update_pet_endpoint(
    pet_update: PetUpdate,
    id: int,
    current_user= Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pet = pet_crud.update_pet(
        db, id, pet_update.hunger, pet_update.age,
        pet_update.last_fed, current_user
    )
    if not pet:
        raise HTTPException(status_code=400, detail="Pet Updating Failed")
    return PetResponse.model_validate(pet)


@app.patch("/pet/feed/{id}", response_model=PetResponse)
def feed_pet_endpoint(id: int, db: Session = Depends(get_db), current_user= Depends(get_current_user)):
    pet_data = pet_crud.feed_pet(db, id, current_user)
    if not pet_data:
        raise HTTPException(status_code=400, details="Feeding pet failed")
    return pet_data

@app.delete("/pet/{id}")
def delete_pet_endpoint(
    id: int,
    current_user= Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = pet_crud.delete_pet(db, id, current_user)
    if result is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    return {"message": "Pet deleted successfully"}


# ---------------------------------------------------
# AUTH ROUTES (LOGIN / PASSWORD / OTP)
# ---------------------------------------------------

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.post("/token", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    username = form_data.username
    password = form_data.password

    if '@' in username:
        user = auth_crud.authenticate_user(db, '', username, password)
    else:
        user = auth_crud.authenticate_user(db, username, '', password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    data = {"sub": user.username}
    token = auth_crud.create_access_token(data, expires_delta=timedelta(minutes=20))
    return {"access_token": token, "token_type": "bearer", "username":user.username, "email":user.email}


@app.patch("/reset_password")
def password_reset_endpoint(
    new_password: str,
    new_password_confirm: str,
    old_password: str,
    username: str,
    db: Session = Depends(get_db)
):
    reset = auth_crud.password_reset(db, new_password, new_password_confirm, old_password, username)
    if not reset:
        raise HTTPException(status_code=400, detail="Password reset failed")
    return {"message": "Password reset successful!"}


@app.post("/send_forgot_password_otp")
def send_forgot_password_otp(email: str, db: Session = Depends(get_db)):
    result = to_confirm_email(db, email)
    if not result:
        raise HTTPException(status_code=404, detail="Email not found")
    return {"message": "OTP sent to your email"}


@app.patch("/forgot_password")
def forgot_password_endpoint(
    entered_verify_code: str,
    new_password: str,
    new_password_confirm: str,
    username: str,
    db: Session = Depends(get_db)
):
    forget = auth_crud.forget_password(db, entered_verify_code,username, new_password, new_password_confirm)
    if not forget:
        raise HTTPException(status_code=400, detail="Forget password reset failed")
    return {"message": "Forget password reset done!"}


@app.delete("/delete_account")
def delete_account(data: DeleteAccountRequest,db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    result = auth_crud.del_user(db, current_user.id, data.password)
    if not result:
        raise HTTPException(status_code=404, detail="user not found")
    return {"message": "user account deleted successfully"}



# ---------------------------------------------------
# REGISTRATION & EMAIL VERIFICATION
# ---------------------------------------------------

@app.post("/register")
def register_user(user: RegistrationUser, db: Session = Depends(get_db)):
    from sqlalchemy import or_
    # Check if username or email already exists
    existing = db.query(User).filter(or_(User.username == user.username, User.email == user.email)).first()
    if existing:
        if existing.username == user.username:
            raise HTTPException(status_code=400, detail="Username already exists")
        if existing.email == user.email:
            raise HTTPException(status_code=400, detail="Email already exists")

    auth_crud.create_user(db, user.username, user.password, user.email)
    return {"message": "User registered successfully!"}


@app.post("/verify_email")
def verify_email_endpoint(email: str, verification_token: str, db: Session = Depends(get_db)):
    result = auth_crud.verify_email(db, email, verification_token)
    if not result:
        raise HTTPException(status_code=400, detail="Email verification failed")
    return {"message": "Email verified successfully"}


# ---------------------------------------------------
# STATS ROUTES
# ---------------------------------------------------

@app.get("/stats/{user_id}/all_time")
def get_user_stats_all_time(user_id: int, current_user = Depends(get_current_user),db: Session = Depends(get_db)):
    user_stats = stats.get_user_stats(db, user_id, stats.start_of_all_time, current_user)
    if not user_stats:
        raise HTTPException(status_code=404, detail="User stats not found")
    return user_stats


@app.get("/stats/{user_id}/today")
def get_user_stats_today(user_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    user_stats = stats.get_user_stats(db, user_id, stats.start_of_today, current_user)
    if not user_stats:
        raise HTTPException(status_code=404, detail="User stats not found")
    return user_stats


@app.get("/stats/{user_id}/week")
def get_user_stats_week(user_id: int, current_user= Depends(get_current_user), db: Session = Depends(get_db)):
    user_stats = stats.get_user_stats(db, user_id, stats.start_of_week, current_user)
    if not user_stats:
        raise HTTPException(status_code=404, detail="User stats not found")
    return user_stats


@app.get("/stats/{user_id}/month")
def get_user_stats_month(user_id: int, current_user= Depends(get_current_user), db: Session = Depends(get_db)):
    user_stats = stats.get_user_stats(db, user_id, stats.start_of_month, current_user)
    if not user_stats:
        raise HTTPException(status_code=404, detail="User stats not found")
    return user_stats


@app.get("/stats/{user_id}/year")
def get_user_stats_year(user_id: int, current_user= Depends(get_current_user), db: Session = Depends(get_db)):
    user_stats = stats.get_user_stats(db, user_id, stats.start_of_year, current_user)
    if not user_stats:
        raise HTTPException(status_code=404, detail="User stats not found")
    return user_stats
