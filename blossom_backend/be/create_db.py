from .database import Base, engine

#this creates all tables in the database
Base.metadata.create_all(bind=engine) 

print("Database tables created!") 