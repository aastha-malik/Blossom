# 🌸 Blossom — Productivity, Focus & Virtual Pet System

Blossom is a **full-stack productivity application** that combines task management, focus sessions, analytics, and a gamified virtual pet system to encourage consistency and disciplined work habits.

The project consists of:
- a **FastAPI backend (fully built by me)**  
- a **desktop frontend (Tkinter)**  
- a **web frontend (React + TypeScript)**  

Both frontends (desktop and web) were **implemented by me with AI assistance (vice-coded)**, including UI logic, API connections, and state handling.  
The backend architecture, database design, authentication flow, and API logic are fully mine.

---

## 🔗 Quick Links (Top Priority)

- **Live Backend API + Swagger Docs**  
  [blossomBackend](https://blossombackend-ib15.onrender.com/docs)

- **Backend Source Code**  
  `blossom_backend/`

- **Desktop App (Tkinter)**  
  `blossom_gui/`

- **Web Frontend (React + TypeScript)**    
   [Blossom](https://blossom-arru.onrender.com)
  

---

## 🧠 Project Overview

Blossom is built as a **backend-first system**, not a UI demo.

The primary learning goals of this project are:
- real authentication flows
- JWT-based authorization
- API design and protection
- database modeling
- frontend ↔ backend communication
- handling long-lived application state

The gamification layer (XP, pets, streaks) exists to simulate **state-heavy real-world applications**, not just for visual appeal.

---

## ✨ Features

### 🧾 Task Manager
- Create tasks with priority levels
- Mark tasks as completed
- Delete tasks
- Tasks are user-specific
- Completing tasks grants XP
- XP is consumed by the virtual pet system

---

### ⏱️ Focus Timer
- 25 / 45 / 60 minute focus sessions
- Frontend-controlled timer
- Encourages deep work

---

### 🐾 Virtual Pet System (Gamification)
- Adopt one or more pets
- Each pet has:
  - hunger
  - happiness
  - age
  - life state
- Feeding pets consumes XP earned from tasks
- Hunger increases automatically over time
- Pets die if unfed for 7 days
- Switch between multiple adopted pets

---

### 📊 Growth & Analytics
- Tracks:
  - completed tasks
  - streaks
- Analytics available for:
  - all-time

---

### 🔐 Authentication & Security
- User registration
- Login using email & password
- **Google login**
- Email verification
- Forgot-password via OTP
- Password reset
- JWT-protected backend routes
- Desktop and web frontends authenticate using access tokens

---

## 🛠️ Technology Stack

### Backend
- FastAPI
- SQLAlchemy ORM
- SQLite
- JWT (OAuth2 Password Flow)
- Pydantic
- CORS enabled
- Deployed on Render

### Desktop Frontend
- Python Tkinter
- Local JSON storage
- `requests` for API communication

### Web Frontend
- React
- TypeScript
- Tailwind CSS
- Context-based state management
- API abstraction layer

---

## 📁 Project Structure

```text
blossom_app/
│
├── blossom_backend/
│   └── be/
│       ├── __init__.py
│       ├── .env
│       ├── auth.py
│       ├── auth_crud.py
│       ├── auth_dependencies.py
│       ├── create_db.py
│       ├── database.py
│       ├── email_verify.py
│       ├── forget_password.py
│       ├── main.py              # FastAPI entry point
│       ├── models.py
│       ├── oauth.py
│       ├── password_reset.py
│       ├── pet_crud.py
│       ├── requirements.txt
│       ├── schemas.py
│       ├── stats.py
│       └── task_crud.py
│
├── blossom_gui/
│   ├── main.py                  # Tkinter desktop app
│   └── fe/
│       └── user_data.json
│
├── blossom_web/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── endpoints.ts
│   │   │   └── types.ts
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── focus/
│   │   │   ├── layout/
│   │   │   ├── pets/
│   │   │   ├── stats/
│   │   │   ├── tasks/
│   │   │   └── ui/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.html
│
├── ui_designs/
│   ├── desktop_ui/
│   └── web_ui/
│
└── README.md
```
---

## 🧪 API Overview

### Authentication
```
POST   /register
POST   /verify_email
POST   /token
POST   /google_login
PATCH  /reset_password
POST   /send_forgot_password_otp
PATCH  /forgot_password
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
POST   /pet
GET    /pet
PUT    /pet/{id}
DELETE /pet/{id}
```

### Analysis
```
GET /stats/{user_id}/all_time
```
---
### 🚀 How to Use
- Launch the desktop application or web frontend
- Register or log in using email/password or Google login
- Create tasks and complete them to earn XP
- Use earned XP to feed and maintain your virtual pet
- Use focus sessions to build productivity streaks
- Track progress using analytics views
---
### 📝 Notes
- ui_designs/ contains UI screenshots for both desktop and web versions
- Early frontend experiments are intentionally preserved
- This project prioritizes backend correctness and real system design
- Frontends are AI-assisted (vice-coded) but fully implemented and integrated by me
