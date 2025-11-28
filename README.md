# Blossom — Productivity + Virtual Pet (Desktop App + FastAPI Backend)

Blossom is a desktop productivity application combining a task manager, focus timer, and a virtual pet system. It includes full authentication using JWT and a deployed FastAPI backend where users can test the API.

## Features

### 1. Task Manager
- Add tasks with priority levels
- Mark tasks as complete
- Delete tasks
- Tasks are stored locally in the GUI
- Completing tasks grants XP used in the virtual pet system

### 2. Focus Timer (Gamification)
- Supports 25, 45, and 60-minute focus sessions
- Completely frontend-based
- Does not award XP
- Designed to support productivity through gamification

### 3. Virtual Pet System (Gamification)
- Adopt pets
- Manually feed your pet
- Feeding requires XP earned from completing tasks
- Hunger increases automatically with time
- Feeding decreases hunger
- If the pet stays unfed for 7 days, it dies
- Switch between multiple adopted pets

### 4. Growth Analytics
- Tracks total completed tasks
- Tracks user streaks

### 5. Authentication (JWT-Based)
- User signup
- Login
- Email verification
- Forgot-password (OTP)
- Password reset
- JWT-protected routes
- GUI communicates with the backend via JWT authentication

## Technology Stack

### GUI (Desktop Frontend)
- Python Tkinter
- Local JSON storage
- Requests library for API communication

### Backend
- FastAPI
- SQLAlchemy ORM
- JWT authentication
- SQLite database
- Pydantic models
- CORS enabled
- Deployed on Render

## Project Structure
```
blossom_app/
│
├── blossom_backend/
│ └── be/
│ ├── pycache/
│ ├── init.py
│ ├── auth_crud.py
│ ├── auth_dependencies.py
│ ├── auth.py
│ ├── create_db.py
│ ├── database.py
│ ├── email_verify.py
│ ├── forget_password.py
│ ├── main.py   (backend)
│ ├── models.py
│ ├── password_reset.py
│ ├── pet_crud.py
│ ├── practice.py
│ ├── requirements.txt
│ ├── schemas.py
│ ├── stats.py
│ └── task_crud.py
│
├── blossom_gui/
| └── main.py  (tkinter GUI)
│ └── fe/
│   └── user_date.json
│
├── blossom_fe_plain/ (Unused)
├── blossom_frontend/ (Unused)
│
└── README.md

```
**Note:**  
The directories `blossom_fe_plain` & `blossom_frontend` are early attempts at a web frontend. They are inactive but intentionally kept for anyone who wants to build a web-based UI using the existing backend.

## Deployed Backend (API Docs)

All backend routes can be tested here:  
https://blossombackend-ib15.onrender.com/docs

## API Overview

### Authentication (JWT-Based)
```
POST   /register
POST   /verify_email
POST   /token
PATCH  /reset_password
POST   /send_forgot_password_otp
PATCH  /forgot_password
DELETE /delete_account
```
### User
```
GET    /user/xp
```
### Tasks
```
POST   /tasks
GET    /tasks
PUT    /tasks/{title}
PATCH  /tasks/{task_id}
DELETE /tasks/{task_id}
```
### Pets
```
POST   /pets
GET    /pet
PUT    /pet/{id}
PATCH  /pet/feed/{id}
DELETE /pet/{id}
```
### Stats
```
GET    /stats/{user_id}/all_time
```
## How to Use the App

1. Launch the GUI application.
2. Sign up or log in using the authentication section.
3. Add tasks and complete them to earn XP.
4. Use XP to feed and care for your virtual pet.
5. Use the focus timer for structured sessions.
6. Track completed tasks and streaks in the analytics section.
