# Frontend-Backend Connection Guide

## ✅ **Step 1: API URL Configuration - COMPLETED**

**What was done:**
- ✅ Fixed hardcoded backend URLs in Login.tsx and Signup.tsx
- ✅ Now using `API_URL` from constants (reads from `.env.local`)
- ✅ Google OAuth redirect now uses environment variable

**Status:** Ready to test!

---

## 🔄 **Step 2: Authentication Connection - READY TO TEST**

**What's already set up:**
- ✅ Login page uses `AuthContext` → `authAPI.login()`
- ✅ Signup page uses `AuthContext` → `authAPI.register()`
- ✅ AuthContext stores JWT token and user info
- ✅ Token is automatically sent with API requests via `getAuthHeaders()`

**What to test:**
1. Start backend: `cd blossom_backend/be && source venv/bin/activate && uvicorn main:app --reload`
2. Start frontend: `cd blossom_web && npm run dev`
3. Try registering a new account
4. Try logging in
5. Check if token is stored and user is redirected

**Files involved:**
- `src/pages/Login.tsx` - Login form
- `src/pages/Signup.tsx` - Signup form
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/api/client.ts` - API calls

---

## 🔄 **Step 3: Tasks Connection - PARTIALLY CONNECTED**

**What's already working:**
- ✅ TaskForm creates tasks via backend when authenticated
- ✅ TaskList fetches tasks from backend when authenticated
- ✅ TaskItem can toggle completion via backend
- ✅ TaskItem can delete tasks via backend
- ✅ Falls back to local storage when not authenticated

**What might need fixing:**
- ⚠️ Backend returns 404 when no tasks found (handled, but check if it works)
- ⚠️ Task completion updates XP - need to verify this works
- ⚠️ Backend only returns incomplete tasks - completed tasks might not show

**Files involved:**
- `src/components/tasks/TaskForm.tsx` - Create tasks
- `src/components/tasks/TaskList.tsx` - List tasks
- `src/components/tasks/TaskItem.tsx` - Task actions
- `src/api/client.ts` - `tasksAPI` functions

---

## 📋 **Step 4: Pets Connection - NEEDS CONNECTION**

**What needs to be done:**
- ⚠️ Check if Pets page uses backend or local storage
- ⚠️ Connect PetForm to backend API
- ⚠️ Connect PetList to backend API
- ⚠️ Connect feed pet functionality

**Files to check:**
- `src/pages/Pets.tsx`
- `src/components/pets/PetForm.tsx`
- `src/components/pets/PetList.tsx`
- `src/components/pets/PetCard.tsx`
- `src/contexts/LocalPetsContext.tsx` - Might need to replace with backend

---

## 📊 **Step 5: Stats/Analytics Connection - NEEDS CONNECTION**

**What needs to be done:**
- ⚠️ Connect Analytics page to backend stats API
- ⚠️ Display user stats (tasks completed, streaks, XP)
- ⚠️ Add period selector (today, week, month, year, all_time)

**Files to check:**
- `src/pages/Analytics.tsx`
- `src/components/stats/StatsCard.tsx`
- `src/components/stats/StatsPeriodSelector.tsx`
- `src/api/client.ts` - `statsAPI` functions

---

## ⭐ **Step 6: User XP Display - NEEDS CONNECTION**

**What needs to be done:**
- ⚠️ Display user XP in Header or sidebar
- ⚠️ Fetch XP from `/user/xp` endpoint
- ⚠️ Update XP after task completion

**Files to check:**
- `src/components/layout/Header.tsx`
- `src/api/client.ts` - `userAPI.getXP()`

---

## 🚀 **Quick Start Testing**

### 1. Backend (Render)
- URL: `https://blossombackend-ib15.onrender.com`
- Docs: `https://blossombackend-ib15.onrender.com/docs`

### 2. Frontend (Render)
- URL: `https://blossom-arru.onrender.com`

### 3. Test Authentication
- Open `https://blossom-arru.onrender.com`
- Click "Sign Up" or "Log In"
- Try creating an account
- Try logging in

### 4. Test Tasks
- After logging in, go to home page
- Add a task
- Complete a task
- Delete a task

---

## 📝 **Next Steps**

1. **Test Authentication** (Step 2) - Make sure login/signup works
2. **Verify Tasks** (Step 3) - Test task CRUD operations
3. **Connect Pets** (Step 4) - Replace local storage with backend
4. **Connect Stats** (Step 5) - Display user statistics
5. **Connect XP** (Step 6) - Show user XP in UI

---

## 🔍 **Debugging Tips**

- Check browser console for API errors
- Check Network tab to see API requests
- Verify backend is running on port 8000
- Check `.env.local` has correct `VITE_API_URL`
- Verify JWT token is being sent in Authorization header
