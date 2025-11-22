from pydantic import BaseModel, EmailStr
from typing import Optional, Union
from datetime import datetime


# --------------------------------------
# USER SCHEMAS
# --------------------------------------

class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True


# --------------------------------------
# TASK SCHEMAS
# --------------------------------------

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[Union[str, int]] = None


class TaskCreate(TaskBase):
    pass


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    priority: Optional[str | int] = None
    completed: Optional[bool] = False
    created_at: datetime
    user_id: int
    xpReward: Optional[int] = None
    userXP: Optional[int] = None

    class Config:
        from_attributes = True



class TaskCompletionUpdate(BaseModel):
    completed: bool

# --------------------------------------
# PET SCHEMAS
# --------------------------------------

class PetBase(BaseModel):
    name: str
    age: float
    hunger: int
    type: str


class PetCreate(PetBase):
    pass


class PetUpdate(BaseModel):
    hunger: int
    last_fed: datetime


class PetFeed(BaseModel):
    pass  # feeding requires no input from the user


class PetResponse(BaseModel):
    id: int
    name: str
    type: str
    age: float
    hunger: int
    last_fed: datetime
    is_alive: bool
    user_id: int

    class Config:
        from_attributes = True


# --------------------------------------
# AUTH / REGISTER / PASSWORD SCHEMAS
# --------------------------------------

class RegistrationUser(BaseModel):
    username: str
    password: str
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class PasswordResetRequest(BaseModel):
    username: str
    old_password: str
    new_password: str
    new_password_confirm: str


class ForgotPasswordRequest(BaseModel):
    entered_verify_code: str
    new_password: str
    new_password_confirm: str
    email: EmailStr


class EmailVerificationRequest(BaseModel):
    email: EmailStr
    verification_token: str
