from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import Task, User, Focus_time
from datetime import datetime
from datetime import timedelta
from auth_dependencies import get_current_user
from fastapi import Depends


def get_user_tasks(db: Session, user_id: int, start_date: datetime, current_user):
    """
    Fetch all tasks for a specific user.
    
    :param db: Database session
    :param user_id: ID of the user whose tasks are to be fetched
    :return: List of tasks associated with the user
    """
    tasks = db.query(Task).filter(Task.user_id == current_user.id).filter(Task.completed==True).filter(Task.created_at >= start_date).all()
    if tasks is None:
        raise HTTPException(status_code=404, detail="Tasks not found")
    else:
        return tasks

def count_tasks_completed(db: Session, user_id: int, start_date: datetime, current_user):
    """
    Count the number of tasks completed by a specific user.
    db.query(Task).filter(Task.user_id == user_id).all()
    :param db: Database session
    :param user_id: ID of the user whose completed tasks are to be counted
    :return: Count of completed tasks for the user
    """
    num_completed = db.query(Task).filter(Task.user_id == current_user.id, Task.completed == True).filter(Task.created_at >= start_date).count()
    if num_completed is None:
        raise HTTPException(status_code=404, detail="No completed tasks found for the user")    
    elif num_completed < 0:
        raise HTTPException(status_code=400, detail="Invalid task count")
    else:
        return num_completed

def streak_calculation(db: Session, user_id: int, current_user , task: Task):
    """
    Calculate the streak of completed tasks for a specific user.
    
    :param db: Database session
    :param user_id: ID of the user whose streak is to be calculated
    :return: Streak count of completed tasks for the user
    """
    tasks = get_user_tasks(db, user_id, start_date, current_user)
    streaks = 0
    task_dates = set()
    for i in tasks:
        date = task.created_at.date()
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

def total_focus_time(db:Session, user_id:int, current_user, time=Focus_time.duration):
    user = db.query(User).filter(User.id == current_user.id).first()
    focus_time = 0

    if user:

        focus_times = db.query(Focus_time).filter(Focus_time.user_id == current_user.id).all()
        for focus in focus_times:
            focus_time += (focus.end_time - focus.start_time).total_seconds() / 60  # Convert seconds to minutes
        
        if focus_time < 0:
            raise HTTPException(status_code=400, detail="Invalid focus time value")
        elif focus_time is None:
            raise HTTPException(status_code=404, detail="Focus time not found for the user")
        else:
            return focus_time
        
    else:
        return 0


def start_of_today():
    today = datetime.utcnow()
    start_date = datetime(today.year, today.month, today.day)
    return start_date

def start_of_week():
    today = datetime.utcnow()
    start_date = today - timedelta(days=today.weekday())  # Get the start of the week (Monday)
    return datetime(start_date.year, start_date.month, start_date.day)
    
def start_of_month():
    today = datetime.utcnow()
    start_date = datetime(today.year, today.month, 1)
    return start_date

def start_of_year():
    today = datetime.utcnow()
    start_date = datetime(today.year, 1, 1) # Get the start of the year
    return start_date

def start_of_all_time():
    return datetime.min # Return the earliest possible date
 


def get_user_stats(db: Session, user_id: int, start_period_func, current_user):
    start_date = start_period_func()
    num_task_completed = count_tasks_completed(db, user_id, start_date, current_user)
    streaks_count = streak_calculation(db, user_id, start_date, current_user)
    xps = total_xps(db, user_id, current_user)
    focus_time = total_focus_time(db, user_id, current_user)
    
    if start_date is None or num_task_completed is None or streaks_count is None or xps is None or focus_time is None:
        raise HTTPException(status_code=404, detail="User stats not found")
    if num_task_completed < 0 or streaks_count < 0 or xps < 0 or focus_time < 0:
        raise HTTPException(status_code=400, detail="Invalid stats values")
    else:      
        return {
            "num_task_completed": num_task_completed,
            "streaks": streaks_count,
            "xps": xps,
            "focus_time": focus_time
        }



    