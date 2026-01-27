from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import Task, User
from datetime import datetime
from datetime import timedelta
from auth_dependencies import get_current_user
from fastapi import Depends


def start_of_all_time(current_user: User):
    return User.start_acc_time


def get_user_tasks(db: Session, user_id: int, start_date: datetime, current_user):
    tasks = db.query(Task).filter(Task.user_id == current_user.id).filter(Task.completed==True).filter(Task.created_at >= start_date).all()
    if tasks is None:
        return []
    else:
        return tasks

def count_tasks_completed(db: Session, user_id: int, start_date: datetime, current_user):

    num_completed = db.query(Task).filter(Task.user_id == current_user.id, Task.completed == True).filter(Task.created_at >= start_date).count()
    if num_completed is None:
        raise HTTPException(status_code=404, detail="No completed tasks found for the user")    
    elif num_completed < 0:
        raise HTTPException(status_code=400, detail="Invalid task count")
    else:
        return num_completed

def streak_calculation(db: Session, user_id: int,start_date: datetime, current_user):

    tasks = get_user_tasks(db, user_id, start_date, current_user)
    streaks = 0
    task_dates = set()
    for i in tasks:
        date = i.created_at.date()
        task_dates.add(date)
    sorted_dates = sorted(task_dates, reverse=True)
    if not sorted_dates:
        return 0
    current_date = sorted_dates[0]
    for date in sorted_dates:
        if current_date - date == timedelta(days = 1):
            streaks += 1
            current_date = date
        else:
            break
    if streaks is None:
        raise HTTPException(status_code=404, detail="No Streaks found for the user")    
    elif streaks < 0:
        raise HTTPException(status_code=400, detail="Invalid Streaks value")
    else:
        return streaks

def total_xps(db:Session, user_id:int,current_user , xp=User.xp):
    user = db.query(User).filter(User.id == current_user.id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    elif user.xp < 0:
        raise HTTPException(status_code=400, detail="Invalid XP value")
    else:
        return user.xp or 0

def get_user_stats(db: Session, user_id: int, start_period_func, current_user):
    start_date = start_period_func(current_user)
    num_task_completed = count_tasks_completed(db, user_id, start_date, current_user)
    streaks_count = streak_calculation(db, user_id, start_date, current_user)
    xps = total_xps(db, user_id, current_user)
    
    if start_date is None or num_task_completed is None or streaks_count is None or xps is None:
        raise HTTPException(status_code=404, detail="User stats not found")
    if num_task_completed < 0 or streaks_count < 0 or xps < 0:
        raise HTTPException(status_code=400, detail="Invalid stats values")
    else:      
        return {
            "num_task_completed": num_task_completed,
            "streaks": streaks_count,
            "xps": xps,
        }



    