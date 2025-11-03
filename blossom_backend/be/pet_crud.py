from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import Pet, User
from auth_dependencies import get_current_user
from fastapi import Depends

#created a new pet
def create_pet(db: Session, name:str, age:float, hunger:int, last_fed:datetime, current_user):
    new_pet = Pet(name=name, age=age, hunger=hunger, last_fed=last_fed, user_id=current_user.id, is_alive=True)
    pet.last_fed = datetime.utcnow()
    pet.hunger = 100
    pet.is_alive = True
    pet.age = 0.0

    db.add(new_pet) #adding new_pet in db
    db.commit() #saving all the data and pet in db
    db.refresh(new_pet) #basically refresh all the data of new pet in db
    return new_pet

#getting pet by id
def get_pet_by_id(db:Session, id:int, current_user):
    pet = db.query(Pet).filter(Pet.id == id, Pet.user_id == current_user.id).first()
    if not pet:
        return None
    else:
        return pet

#getting all pets
def get_all_pets(db:Session, current_user):
    pets = db.query(Pet).filter(Pet.user_id == current_user.id, is_alive == True).all()
    if not pets:
        return None
    else:
        return pets

        
#updating our pet
def update_pet(db:Session, id:int, hunger:int, last_fed:datetime, age:float, current_user):
    pet = get_pet_by_id(db, id, current_user)
    if pet is None:
        return None
    pet.hunger = hunger
    pet.last_fed=last_fed
    pet.age=age
    db.commit()
    db.refresh(pet)
    if not pet:
        return None
    else:
        return pet

#checking that when did the user fed its pet!
def check_last_fed(last_fed:datetime):
    now = datetime.utcnow()
    fed_time_diff = now - last_fed
    return fed_time_diff.days

#checking and updating(if needed) is_alive property of pet
def updating_is_alive(db:Session, last_fed:datetime, id:int, current_user):
    pet = get_pet_by_id(db, id, current_user)
    if pet is None:
        return None
    if check_last_fed(last_fed) > 7:
        pet.is_alive = False
    else:
        pet.is_alive = True
    db.commit()
    db.refresh(pet)
    if not pet:
        return None
    else:
        return pet.is_alive
#feed pet  function
def feed_pet(db:Session, is_alive:bool, hunger:int, last_fed:datetime, age:float, current_user):
    pet = db.query(Pet).filter(Pet.user_id == current_user.id, is_alive == True).first()
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        return None
    if not pet:
        return None
    if check_last_fed(last_fed) > 7:
        pet.is_alive = False
        db.commit()
        return pet
    elif days_since_last_fed >= 1 and pet.is_alive:
        pet.hunger = 100

    
    if user.xp >= 35:
        user.xp -= 35
        pet.hunger = max(pet.hunger - 50, 0)
        pet.last_fed = datetime.utcnow()
        pet.age += 0.01
        pet.is_alive = True

        db.commit()
        db.refresh(pet)
        db.refresh(user)

        print({
        "id": pet.id,
        "name": pet.name,
        "age": pet.age,
        "hunger": pet.hunger,
        "last_fed": pet.last_fed,
        "is_alive": pet.is_alive,
        })

        return {
        "id": pet.id,
        "name": pet.name,
        "age": pet.age,
        "hunger": pet.hunger,
        "last_fed": pet.last_fed,
        "is_alive": pet.is_alive,
        }
    else:
        print("Not enough XP to feed pet")
        raise HTTPException(status_code=400, detail="Not enough XP to feed pet")
    
    
#checking that whether the pet is dead or not! 
def check_dead_pet(db: Session, current_user):
    """
    even after death of pet it stays in db.
    so that we can show to user that how many its pet died!
    """

    pets = db.query(Pet).filter(Pet.is_alive==False, Pet.user_id == current_user.id).all()
    if not pets:
        return None
    else:
        return pets

#deleteing pet from  db
def delete_pet(db:Session, id:int, current_user):
    """
    Deletes a pet from the database by its ID.
    Returns True if deleted, False if not found.
    """
    pet =  get_pet_by_id(db, id, current_user)
    if pet is None:
        return False
    db.delete(pet)
    db.commit()
    if pet:
        return True  # Return True to indicate successful deletion
    else:
        return False
    # Note: Returning True or False is a common practice to indicate success or failure of an operation.
    # In this case, we return True if the task was successfully deleted, otherwise False
    # This can be useful for the caller to know whether the deletion was successful or not.
    # If you want to raise an exception instead, you can do so, but returning True




