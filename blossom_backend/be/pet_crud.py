from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import Pet

#created a new pet
def create_pet(db: Session, name:str, age:float, hunger:int, last_fed:datetime):
    new_pet = Pet(name=name, age=age, hunger=hunger, last_fed=last_fed)
    db.add(new_pet) #adding new_pet in db
    db.commit() #saving all the data and pet in db
    db.refresh(new_pet) #basically refresh all the data of new pet in db
    return new_pet

#getting pet by id
def get_pet_by_id(db:Session, id:int):
    pet = db.query(Pet).filter(Pet.id == id).first()
    return pet

#getting all pets
def get_all_pets(db:Session):
    pets = db.query(Pet).all()
    return pets

#updating our pet
def update_pet(db:Session, id:int, hunger:int, last_fed:datetime, age:float):
    pet = get_pet_by_id(db, id)
    if pet is None:
        return None
    pet.hunger = hunger
    pet.last_fed=last_fed
    pet.age=age
    db.commit()
    db.refresh(pet)
    return pet

#checking that when did the user fed its pet!
def check_last_fed(last_fed:datetime):
    now = datetime.utcnow()
    fed_time_diff = now - last_fed
    return fed_time_diff.days

#checking and updating(if needed) is_alive property of pet
def updating_is_alive(db:Session, last_fed:datetime, id:int):
    pet = get_pet_by_id(db, id)
    if pet is None:
        return None
    if check_last_fed(last_fed) > 7:
        pet.is_alive = False
    else:
        pet.is_alive = True
    db.commit()
    db.refresh(pet)
    return pet.is_alive

#checking that whether the pet is dead or not! 
def check_dead_pet(db: Session):
    """
    even after death of pet it stays in db.
    so that we can show to user that how many its pet died!
    """

    pets = db.query(Pet).filter(Pet.is_alive==False).all()
    return pets

#deleteing pet from  db
def delete_pet(db:Session, id:int):
    """
    Deletes a pet from the database by its ID.
    Returns True if deleted, False if not found.
    """
    pet =  get_pet_by_id(db, id)
    if pet is None:
        return False
    db.delete(pet)
    db.commit()
    return True



