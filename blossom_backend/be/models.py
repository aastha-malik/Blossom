from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
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
    title = Column(String(100), index=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Pet(Base):
    __tablename__ = "pets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True) #names for pet
    age = Column(Float)
    hunger = Column(Integer)
    last_fed = Column(DateTime, default=datetime.utcnow())
    is_alive = Column(Boolean, default=True)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)






