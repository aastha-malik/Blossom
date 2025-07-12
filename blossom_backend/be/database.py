from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

"""
This file sets up the database connection and base class for SQLAlchemy models.
"""

#database url!
SQLALCHEMY_DATABASE_URL = "sqlite:///../db/blossom_focus.db"

#main connection b/w db and app
#connect_args={"check_same_thread": False} => this allows multiple parts of your app to access the db at the same time
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

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