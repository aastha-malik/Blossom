from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
"""
This file sets up the database connection and base class for SQLAlchemy models.
"""

#database url
import os

from dotenv import load_dotenv
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Try DATABASE_URL first (often provided by Render), fallback to SQLALCHEMY_DATABASE_URL
SQLALCHEMY_DATABASE_URL = os.getenv("SQLALCHEMY_DATABASE_URL")

# Handle potential SQLAlchemy compatibility issue with 'postgres://' URLs
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

#main connection b/w db and app
#connect_args={"check_same_thread": False} => this allows multiple parts of your app to access the db at the same time

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)

#temp connection to db
#autocommit=False => give control and changes are saved only after i commit!
#Basically, first you will write it on your draft, then you will copy it in your notebook, those notes, with your pencil. And auto-flush stays till the pencil, so if you want to make the changes, you can erase it and use it again, this, that, blah blah. And for auto-commit, when you say commit, only then that, those notes are written on pen, which means permanently.
#bind=engine => tells your session, “This is the database you’re working with.”
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

#this is for testing my code (good while using fastapi)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()