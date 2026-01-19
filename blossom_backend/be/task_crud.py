from sqlalchemy.orm import Session
from models import Task, User
from auth_dependencies import get_current_user
from fastapi import Depends

#adding task to db
def create_task(db: Session, title: str, priority: str, current_user):
    # Normalize priority to capitalized format for consistency
    priority_normalized = priority.capitalize() if priority else "Medium"
    new_task = Task(title=title,user_id=current_user.id, completed=False, priority=priority_normalized)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)     # This updates the object with data from the database (like the new id)
    return new_task
    
#getting all task from db
def get_all_tasks(db:Session, current_user):
    all_tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    if all_tasks:
        return all_tasks
    else:
        return None

#getting the task by id
#.first() returns the first matching task
def get_task_by_title(db: Session, task_title:str, current_user):
    task = db.query(Task).filter(Task.title == task_title, Task.user_id == current_user.id).first()
    if task:
        return task
    else:
        return None

#getting the task by id
def get_task_by_id(db: Session, task_id: int, current_user):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if task:
        return task
    else:
        return None

#updating task
def update_task(db:Session, task_title : str, current_user):
    task = get_task_by_title(db, task_title, current_user)
    if task is None:
        return None
    task.completed = True
    db.commit()
    if task:
        return task
    else:
        return None 

#updating task completion by id
def update_task_completion(db: Session, task_id: int, completed: bool, current_user: User):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    user = db.query(User).filter(User.id == current_user.id).first()

    if not task:
        return None

    

    # Decide XP based on priority (handle both lowercase and capitalized)
    xp_reward = 0
    priority_lower = (task.priority or "").lower()
    if priority_lower == "low":
        xp_reward = 10
    elif priority_lower == "medium":
        xp_reward = 15
    elif priority_lower == "high":
        xp_reward = 25

    # Initialize XP if null (default is 100)
    if user.xp is None:
        user.xp = 100

    # Only add XP when marking task as complete
    if not task.completed and completed:
        print(f"[DEBUG] XP before: {user.xp}")
        user.xp = (user.xp or 0) + xp_reward
        print(f"[DEBUG] XP after: {user.xp}")
    
    task.completed = completed

    print(f"[DEBUG] Before commit: user {user.id} XP = {user.xp}, reward = {xp_reward}")
    db.commit()
    db.refresh(task)
    db.refresh(user)
    print(f"[DEBUG] After commit: user {user.id} XP = {user.xp}")

    print({
        "id": task.id,
        "title": task.title,
        "priority": task.priority,
        "completed": task.completed,
        "created_at": task.created_at,
        "user_id": task.user_id,
        "xpReward": xp_reward,
        "userXP": user.xp,
    })
    return {
        "id": task.id,
        "title": task.title,
        "priority": task.priority,
        "completed": task.completed,
        "created_at": task.created_at,
        "user_id": task.user_id,
        "xpReward": xp_reward,
        "userXP": user.xp,
    }



#delete task
def delete_task(db: Session, task_title : str, current_user):
    task = get_task_by_title(db, task_title, current_user)
    if task is None:
        return None
    db.delete(task)
    db.commit()
    if task:
        return True  # Return True to indicate successful deletion
    else:
        return False

#delete task by id
def delete_task_by_id(db: Session, task_id: int, current_user):
    task = get_task_by_id(db, task_id, current_user)
    if task is None:
        return None
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}
    # Note: Returning True or False is a common practice to indicate success or failure of an operation.
    # In this case, we return True if the task was successfully deleted, otherwise False
    # This can be useful for the caller to know whether the deletion was successful or not.
    # If you want to raise an exception instead, you can do so, but returning True
