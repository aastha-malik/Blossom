from sqlalchemy.orm import Session
from be.models import Task

#adding task to db
def create_task(db: Session, title: str):
    new_task = Task(title=title)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)     # This updates the object with data from the database (like the new id)
    return new_task
    
#getting all task from db
def get_all_tasks(db:Session):
    all_tasks = db.query(Task).all()
    if all_tasks:
        return all_tasks
    else:
        return None

#getting the task by id
#.first() returns the first matching task
def get_task_by_title(db: Session, task_title:str):
    task = db.query(Task).filter(Task.title == task_title).first()
    if task:
        return task
    else:
        return None

#getting the task by id
def get_task_by_id(db: Session, task_id: int):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task:
        return task
    else:
        return None

#updating task
def update_task(db:Session, task_title : str):
    task = get_task_by_title(db, task_title)
    if task is None:
        return None
    task.completed = True
    db.commit()
    if task:
        return task
    else:
        return None 

#updating task completion by id
def update_task_completion(db: Session, task_id: int, completed: bool):
    task = get_task_by_id(db, task_id)
    if task is None:
        return None
    task.completed = completed
    db.commit()
    db.refresh(task)
    return task

#delete task
def delete_task(db: Session, task_title : str):
    task = get_task_by_title(db, task_title)
    if task is None:
        return None
    db.delete(task)
    db.commit()
    if task:
        return True  # Return True to indicate successful deletion
    else:
        return False

#delete task by id
def delete_task_by_id(db: Session, task_id: int):
    task = get_task_by_id(db, task_id)
    if task is None:
        return None
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}
    # Note: Returning True or False is a common practice to indicate success or failure of an operation.
    # In this case, we return True if the task was successfully deleted, otherwise False
    # This can be useful for the caller to know whether the deletion was successful or not.
    # If you want to raise an exception instead, you can do so, but returning True
