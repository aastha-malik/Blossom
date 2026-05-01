# Tendr

A journal-shaped productivity app with task management, focus sessions, a gamified virtual pet system, and analytics — built backend-first.

**Live app:** [tendr-tick-treats.onrender.com](https://tendr-tick-treats.onrender.com)  
**API + Swagger docs:** [tendrbackend.onrender.com/docs](https://tendrbackend.onrender.com/docs)

---

## Overview

Tendr is a full-stack web application. The backend is the core of the project — it handles real authentication flows, JWT-based authorization, PostgreSQL data modeling, and a stateful gamification layer. The React frontend consumes the API and manages client-side state with TanStack Query and React Context.

The gamification layer (XP, virtual pets, streaks) exists to simulate state-heavy real-world systems, not just for visual appeal.

---

## Features

### Task Management
- Create tasks with title, priority, and category
- Mark tasks complete / incomplete
- Delete tasks
- Completing a task grants XP to the user
- Tasks are scoped per user (JWT-protected)

### Focus Sessions
- 25 / 45 / 60 minute focus timer
- Sessions are saved to the database on completion
- Cumulative focus time tracked per user

### Virtual Pet System
- Adopt and name pets (multiple supported)
- Each pet has hunger, age, and alive state
- Feeding a pet costs XP earned from tasks
- Pets go hungry over time and die if unfed for 7 days
- Hunger state is recalculated server-side on every fetch

### Analytics
- Completed task count (all-time)
- Current streak (consecutive days with completed tasks)
- Total XP
- Guest users get local stats without authentication

### Authentication
- Email + password registration with email verification (6-digit OTP, 30-min TTL)
- Google OAuth 2.0 login via Authlib — new users choose their own unique username
- JWT access tokens (HS256, configurable expiry)
- Forgot password via OTP email
- Password reset (authenticated)
- Account deletion — password-based for email users, OTP-based for Google users
- Google users can set a password via OTP to enable email login

### UX
- Guest mode — tasks and pets work locally (localStorage) without an account
- Light / dark theme, persisted per user in the database
- Fully responsive

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI |
| ORM | SQLAlchemy |
| Database | PostgreSQL (psycopg2-binary) |
| Auth | python-jose (JWT), passlib/bcrypt |
| OAuth | Authlib (Google OAuth 2.0) |
| Validation | Pydantic v2 |
| Server | Uvicorn |
| Deployment | Render (Web Service) |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Deployment | Render (Static Site) |

---

## Project Structure

```
tendr_app/
├── tendr_backend/
│   └── be/
│       ├── main.py               # FastAPI app, all route definitions
│       ├── models.py             # SQLAlchemy models (UUID PKs)
│       ├── schemas.py            # Pydantic request/response schemas
│       ├── database.py           # DB engine, session factory
│       ├── auth.py               # Password hashing utilities
│       ├── auth_crud.py          # Auth business logic (register, login, JWT)
│       ├── auth_dependencies.py  # get_current_user FastAPI dependency
│       ├── oauth.py              # Authlib Google OAuth config
│       ├── task_crud.py          # Task CRUD + XP logic
│       ├── pet_crud.py           # Pet CRUD + hunger/alive logic
│       ├── stats.py              # Analytics calculations
│       ├── email_verify.py       # Email sending
│       ├── forget_password.py    # OTP generation and password reset
│       ├── password_reset.py     # Authenticated password change
│       └── requirements.txt
│
└── tendr_web/
    └── src/
        ├── api/
        │   ├── client.ts         # All fetch calls, typed
        │   ├── endpoints.ts      # Centralised URL constants
        │   └── types.ts          # TypeScript interfaces
        ├── components/
        │   ├── auth/
        │   ├── focus/
        │   ├── layout/
        │   ├── pets/
        │   ├── stats/
        │   ├── tasks/
        │   └── ui/
        ├── contexts/             # AuthContext, LocalTasksContext
        ├── hooks/                # useLocalTasks, useLocalPets
        ├── pages/                # One file per route
        └── utils/
```

---

## API Reference

### Auth
```
POST   /signup                              Register (email + password)
POST   /verify_email                        Verify registration OTP
POST   /login                               Login (OAuth2 password form)
GET    /auth/google/login                   Initiate Google OAuth
GET    /auth/google/callback                Google OAuth callback
POST   /auth/google/complete-registration   New Google user picks username
PATCH  /reset_password                      Change password (authenticated)
POST   /send_forgot_password_otp            Send OTP to email
PATCH  /forgot_password                     Reset password via OTP
DELETE /delete_account                      Delete account (password)
DELETE /delete_account_otp                  Delete account via OTP (Google users)
```

### User
```
GET    /user/xp          Get current XP
GET    /user/theme       Get theme preference
PATCH  /user/theme       Update theme preference
GET    /user/provider    Get auth provider (google / null)
```

### Tasks
```
POST   /tasks                Create task
GET    /tasks                List all tasks for current user
PUT    /tasks/{title}        Mark task complete by title
PATCH  /tasks/{task_id}      Update task completion by ID
DELETE /tasks/{task_id}      Delete task
```

### Pets
```
POST   /pets                 Adopt a new pet
GET    /pet                  List alive pets for current user
PUT    /pet/{id}             Update pet
PATCH  /pet/feed/{id}        Feed pet (costs XP)
DELETE /pet/{id}             Release pet
```

### Analytics & Focus
```
GET    /analysis/{user_id}   All-time stats (tasks, streaks, XP)
POST   /focus/session        Save a completed focus session
GET    /focus/total          Get total focus time in seconds
```

---

## Database Models

All primary keys are UUID strings generated with `str(uuid.uuid4())`.

| Model | Key fields |
|---|---|
| `User` | id, username, email, hashed_password, xp, provider, provider_id, theme |
| `Task` | id, user_id (FK), title, priority, category, completed, created_at |
| `Pet` | id, user_id (FK), name, type, hunger, age, is_alive, last_fed |
| `FocusSession` | id, user_id (FK), duration_seconds, created_at |

---

## Auth Flow

### Email Registration
1. `POST /signup` — creates unverified user, sends 6-digit OTP to email
2. `POST /verify_email` — validates OTP (30-min TTL), marks user verified
3. `POST /login` — returns JWT

### Google OAuth
1. `GET /auth/google/login` — redirects to Google
2. `GET /auth/google/callback` — receives token from Google
   - **Returning user:** issues JWT, redirects to `/login?token=...`
   - **New user:** issues 10-min pending token, redirects to `/choose-username?pending_token=...`
3. `POST /auth/google/complete-registration` — validates pending token, creates user with chosen username, returns JWT

---

## Running Locally

### Backend

```bash
cd tendr_backend/be
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/tendr
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=1
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET_KEY=your_session_secret
```

```bash
uvicorn main:app --reload
# API at http://localhost:8000
# Swagger UI at http://localhost:8000/docs
```

### Frontend

```bash
cd tendr_web
npm install
npm run dev
# App at http://localhost:5173
```
