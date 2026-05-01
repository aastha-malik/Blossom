from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import uuid


def _uuid() -> str:
    return str(uuid.uuid4())

""""
Q - What is a Model?
Ans - A model is like a blueprint for a table in your database.
For ex - a "Task" model will become a "tasks" table, and each task you add will be a row in that table.
"""

class Task(Base):
    __tablename__ = "tasks"
    id = Column(String, primary_key=True, default=_uuid, index=True)
    title = Column(String(1000), index=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    priority = Column(String(50), default="Low")
    category = Column(String(50), nullable=True)
    user_id = Column(String, ForeignKey("user.id"))
    user = relationship("User", back_populates="tasks")

class Pet(Base):
    __tablename__ = "pets"
    id = Column(String, primary_key=True, default=_uuid, index=True)
    name = Column(String, index=True, nullable=False)
    age = Column(Float, default=0.0)
    type = Column(String, nullable=False)
    hunger = Column(Integer, default=100)
    last_fed = Column(DateTime, default=datetime.utcnow)
    is_alive = Column(Boolean, default=True)
    user_id = Column(String, ForeignKey("user.id"))
    user = relationship("User", back_populates="pets")

class FocusSession(Base):
    __tablename__ = "focus_sessions"
    id = Column(String, primary_key=True, default=_uuid, index=True)
    user_id = Column(String, ForeignKey("user.id"))
    duration_seconds = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="focus_sessions")

class User(Base):
    __tablename__ = "user"
    id = Column(String, primary_key=True, default=_uuid, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    email = Column(String, unique=True, index=True)
    xp = Column(Integer, default=100)
    start_acc_time = Column(DateTime, default=datetime.utcnow)
    tasks = relationship("Task", backref="user")  # Establishing a relationship with Task model
    user_verified = Column(Boolean, default=False) #whether email of user is verified or not
    user_verification_token = Column(String, default=False)  #verification token for user
    user_verification_token_expires_at = Column(DateTime, default=datetime.utcnow) #when verification token expires
    pets = relationship("Pet", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    focus_sessions = relationship("FocusSession", back_populates="user", cascade="all, delete-orphan")
    #for google login
    provider = Column(String, nullable=True)
    provider_id = Column(String, nullable=True)
    # Theme preference: 'light' or 'dark' (default: 'light')
    theme = Column(String, default='light')



