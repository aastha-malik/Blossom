from sqlalchemy.orm import Session
from models import Task, User, Focus_time
from datetime import datetime
from datetime import timedelta

def get_user_tasks(db: Session, user_id: int):
    """
    Fetch all tasks for a specific user.
    
    :param db: Database session
    :param user_id: ID of the user whose tasks are to be fetched
    :return: List of tasks associated with the user
    """
    tasks = db.query(Task).filter(Task.user_id == user_id).filter(Task.completed==True).all()
    return tasks

def count_tasks_completed(db: Session, user_id: int):
    """
    Count the number of tasks completed by a specific user.
    db.query(Task).filter(Task.user_id == user_id).all()
    :param db: Database session
    :param user_id: ID of the user whose completed tasks are to be counted
    :return: Count of completed tasks for the user
    """
    num_completed = db.query(Task).filter(Task.user_id == user_id, Task.completed == True).count()
    return num_completed

def streaks(db: Session, user_id: int, task: Task):
    """
    Calculate the streak of completed tasks for a specific user.
    
    :param db: Database session
    :param user_id: ID of the user whose streak is to be calculated
    :return: Streak count of completed tasks for the user
    """
    tasks = get_user_tasks(db, user_id)
    streak = 0
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
            streak += 1
            current_date = date
        else:
            break
    return streak

def total_xps(db:Session, user_id:int, xp=User.xp):
    user = db.query(User).filter(User.id == user_id)
    return user.xp

def total_focus_time(db:Session, user_id:int, time=Focus_time.duration):
    user = db.query(User).filter(User.id == user_id).first()
    focus_time = 0
    if user:
        focus_times = db.query(Focus_time).filter(Focus_time.user_id == user.id).all()
        for focus in focus_times:
            focus_time += (focus.end_time - focus.start_time).total_seconds() / 60  # Convert seconds to minutes

        return focus_time
    else:
        return 0
    
