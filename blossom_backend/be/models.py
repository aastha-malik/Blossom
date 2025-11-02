from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

""""
Q - What is a Model?
Ans - A model is like a blueprint for a table in your database.
For ex - a "Task" model will become a "tasks" table, and each task you add will be a row in that table.
"""

class Task(Base):
    __tablename__ = "tasks" # name  of my db table
    id = Column(Integer, primary_key=True, index=True) #column names in db table
    title = Column(String(1000), index=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow())
    updated_at = Column(DateTime, default=datetime.utcnow())
    priority = Column(String(50), default="Low")
    user_id  = Column(Integer, ForeignKey("user.id"))   # Foreign key to link to the User table
    user = relationship("User", back_populates="tasks")  # Establishing a relationship with User model

class Pet(Base):
    __tablename__ = "pets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True) #names for pet
    age = Column(Float)
    hunger = Column(Integer)
    last_fed = Column(DateTime, default=datetime.utcnow())
    is_alive = Column(Boolean, default=True)
    user_id  = Column(Integer, ForeignKey("user.id"))   # Foreign key to link to the User table
    user = relationship("User", back_populates="pets")  # Establishing a relationship

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    email = Column(String, unique=True, index=True)
    xp = Column(Integer, default=100)
    tasks = relationship("Task", backref="user")  # Establishing a relationship with Task model
    focus_times = relationship("Focus_time", back_populates="user")  # Establishing a relationship with Focus_time model
    user_verified = Column(Boolean, default=False) #whether email of user is verified or not
    user_verification_token = Column(String, default=False)  #verification token for user
    user_verification_token_expires_at = Column(DateTime, default=datetime.utcnow()) #when verification token expires
    pets = relationship("Pet", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")

class Focus_time(Base):
    __tablename__ = "focus_times"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    start_time = Column(DateTime, default=datetime.utcnow())
    end_time = Column(DateTime, default=datetime.utcnow())
    duration = Column(Float)  # Duration in minutes
    user = relationship("User", back_populates="focus_times")  # Establishing a relationship with User model





