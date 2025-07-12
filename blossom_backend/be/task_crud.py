from sqlalchemy.orm import Session
from models import Task

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
    return all_tasks

#getting the task by id
#.first() returns the first matching task
def get_task_by_title(db: Session, task_title:str):
    task = db.query(Task).filter(Task.title == task_title).first()
    return task

#updating task
def update_task(db:Session, task_title : str):
    task = get_task_by_title(db, task_title)
    if task is None:
        return None
    task.completed = True
    db.commit()
    return task

#delete task
def delete_task(db: Session, task_title : str):
    task = get_task_by_title(db, task_title)
    if task is None:
        return None
    db.delete(task)
    db.commit()
    return None
