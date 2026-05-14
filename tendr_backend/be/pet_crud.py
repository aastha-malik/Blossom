from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from models import Pet, User, FocusSession, PetQualifyingDay
from fastapi import HTTPException


def create_pet(db: Session, name: str, type: str, current_user, gender: str = None):
    now = datetime.utcnow()
    new_pet = Pet(
        name=name,
        type=type,
        gender=gender,
        user_id=current_user.id,
        last_fed=now,
        last_focused_at=now,
        hunger=100,
        bond=0.0,
        age=0,
        is_alive=True,
    )
    db.add(new_pet)
    db.commit()
    db.refresh(new_pet)
    return new_pet


def get_pet_by_id(db: Session, id: str, current_user):
    return db.query(Pet).filter(Pet.id == id, Pet.user_id == current_user.id).first()


def get_all_pets(db: Session, current_user):
    pets = db.query(Pet).filter(Pet.user_id == current_user.id).all()
    if not pets:
        return []
    today = datetime.utcnow().date()
    changed = False
    for pet in pets:
        if pet.is_alive:
            days_since_fed = (today - pet.last_fed.date()).days
            if days_since_fed >= 3:
                pet.is_alive = False
                changed = True
    if changed:
        db.commit()
        for pet in pets:
            db.refresh(pet)
    return pets


def _check_qualifying_day(db: Session, pet: Pet, user_id: str):
    today = datetime.utcnow().date()
    existing = db.query(PetQualifyingDay).filter(
        PetQualifyingDay.pet_id == pet.id,
        PetQualifyingDay.date == today,
    ).first()
    if existing:
        return
    start_of_today = datetime.combine(today, datetime.min.time())
    fed_today = pet.last_fed.date() == today
    focused_today = db.query(FocusSession).filter(
        FocusSession.user_id == user_id,
        FocusSession.created_at >= start_of_today,
    ).first() is not None
    if fed_today and focused_today:
        qd = PetQualifyingDay(pet_id=pet.id, user_id=user_id, date=today)
        db.add(qd)
        pet.age = (pet.age or 0) + 1
        db.commit()


def feed_pet(db: Session, pet_id: str, current_user):
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.user_id == current_user.id).first()
    if not pet:
        return None

    today = datetime.utcnow().date()
    days_since_fed = (today - pet.last_fed.date()).days
    if days_since_fed >= 3:
        pet.is_alive = False
        db.commit()
        db.refresh(pet)
        return pet

    user = db.query(User).filter(User.id == current_user.id).first()
    if not user or user.xp < 35:
        raise HTTPException(status_code=400, detail="Not enough XP to feed pet")

    user.xp -= 35
    pet.hunger = 100
    pet.last_fed = datetime.utcnow()

    db.commit()
    db.refresh(pet)
    db.refresh(user)

    _check_qualifying_day(db, pet, str(current_user.id))

    return pet


def add_bond_from_focus(db: Session, user_id: str, duration_seconds: int):
    pet = db.query(Pet).filter(Pet.user_id == user_id, Pet.is_alive == True).first()
    if not pet:
        return

    today = datetime.utcnow().date()
    days_since_focus = (today - pet.last_focused_at.date()).days
    pet.bond = max(0.0, (pet.bond or 0.0) - days_since_focus * 33)

    duration_minutes = duration_seconds / 60
    gain = (duration_minutes / 60) * 15
    pet.bond = min(100.0, pet.bond + gain)
    pet.last_focused_at = datetime.utcnow()

    db.commit()
    db.refresh(pet)

    _check_qualifying_day(db, pet, str(user_id))


def update_pet(db: Session, id: str, hunger: int, last_fed: datetime, age: float, current_user):
    pet = get_pet_by_id(db, id, current_user)
    if pet is None:
        return None
    pet.hunger = hunger
    pet.last_fed = last_fed
    pet.age = age
    db.commit()
    db.refresh(pet)
    return pet


def check_dead_pet(db: Session, current_user):
    pets = db.query(Pet).filter(Pet.is_alive == False, Pet.user_id == current_user.id).all()
    return pets or None


def delete_pet(db: Session, id: str, current_user):
    pet = get_pet_by_id(db, id, current_user)
    if pet is None:
        return False
    db.delete(pet)
    db.commit()
    return True
