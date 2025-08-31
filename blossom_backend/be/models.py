from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from be.database import Base
from datetime import datetime

""""
Q - What is a Model?
Ans - A model is like a blueprint for a table in your database.
For ex - a "Task" model will become a "tasks" table, and each task you add will be a row in that table.
"""

class Task(Base):
    __tablename__ = "tasks" # name  of my db table
    id = Column(Integer, primary_key=True, index=True) #column names in db table
    title = Column(String(100), index=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow())
    updated_at = Column(DateTime, default=datetime.utcnow())
    user_id  = Column(Integer, ForeignKey("user.id"))   # Foreign key to link to the User table

class Pet(Base):
    __tablename__ = "pets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True) #names for pet
    age = Column(Float)
    hunger = Column(Integer)
    last_fed = Column(DateTime, default=datetime.utcnow())
    is_alive = Column(Boolean, default=True)

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    xp = Column(Integer, default=0)
    tasks = relationship("Task", backref="user")  # Establishing a relationship with Task model
    focus_times = relationship("Focus_time", back_populates="user")  # Establishing a relationship with Focus_time model

class Focus_time(Base):
    __tablename__ = "focus_times"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    start_time = Column(DateTime, default=datetime.utcnow())
    end_time = Column(DateTime, default=datetime.utcnow())
    duration = Column(Float)  # Duration in minutes
    user = relationship("User", back_populates="focus_times")  # Establishing a relationship with User model




