# Tasks Connection Testing Guide

## ✅ **What's Fixed**

1. ✅ **Backend empty tasks** - Now returns empty array `[]` instead of 404 when no tasks found
2. ✅ **Priority format** - Backend normalizes priority to capitalized format ("Low", "Medium", "High")
3. ✅ **Priority XP calculation** - Handles both lowercase and capitalized priority values
4. ✅ **Task completion** - Updates XP in backend and frontend refreshes XP display
5. ✅ **All CRUD operations** - Create, Read, Update (completion), Delete all connected

---

## 🧪 **Testing Steps**

### **Prerequisites**
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:5173`
- User logged in (authentication working)

### **1. Test Create Task**

1. Go to home page (`/`)
2. In the "Add New Task" form:
   - Enter task title: `"Complete project documentation"`
   - Select priority: `Medium` (or Low/High)
   - Click "Add Task"
3. **Expected:**
   - Task appears in the task list below
   - Success toast message (if configured)
   - Task saved to backend database

**Check backend logs:**
- Should see task creation
- Task ID assigned

**Check browser Network tab:**
- POST request to `/tasks`
- Response with task data including `id`, `title`, `priority`, `completed: false`

---

### **2. Test Read Tasks (List)**

1. After creating tasks, refresh the page
2. **Expected:**
   - All incomplete tasks load from backend
   - Tasks display with correct priority badges
   - Tasks sorted: incomplete first, then by creation date

**Check browser Network tab:**
- GET request to `/tasks`
- Response with array of tasks

**Note:** Backend only returns incomplete tasks (completed tasks are filtered out)

---

### **3. Test Update Task (Complete/Uncomplete)**

1. Click the checkbox on a task
2. **Expected:**
   - Task gets checked (completed)
   - Task shows strikethrough text
   - XP increases in header (based on priority):
     - Low priority: +10 XP
     - Medium priority: +15 XP
     - High priority: +25 XP
   - Task disappears from list (backend only returns incomplete tasks)

3. **To test uncomplete:**
   - Currently, completed tasks don't show in the list
   - This is by design (backend filters them out)

**Check browser Network tab:**
- PATCH request to `/tasks/{task_id}`
- Response includes:
  ```json
  {
    "id": 1,
    "title": "Task title",
    "completed": true,
    "xpReward": 15,
    "userXP": 115
  }
  ```

**Check backend logs:**
- Should see XP calculation and update

---

### **4. Test Delete Task**

1. Click the X button on a task
2. **Expected:**
   - Task disappears from list immediately
   - Task deleted from backend

**Check browser Network tab:**
- DELETE request to `/tasks/{task_id}`
- Response: `{"message": "Task deleted successfully"}`

---

### **5. Test Priority XP Rewards**

Create tasks with different priorities and complete them:

1. **Low Priority Task:**
   - Create task with "Low" priority
   - Complete it
   - **Expected:** XP increases by 10

2. **Medium Priority Task:**
   - Create task with "Medium" priority
   - Complete it
   - **Expected:** XP increases by 15

3. **High Priority Task:**
   - Create task with "High" priority
   - Complete it
   - **Expected:** XP increases by 25

**Check Header:**
- XP value should update after each task completion
- XP refreshes every 30 seconds automatically

---

## 🔍 **Debugging**

### **If tasks don't appear:**

1. **Check authentication:**
   - Make sure you're logged in
   - Check browser console for 401 errors
   - Verify token is being sent in Authorization header

2. **Check backend:**
   - Verify backend is running
   - Check backend logs for errors
   - Verify user exists in database

3. **Check API response:**
   - Open browser Network tab
   - Look for GET `/tasks` request
   - Check response status and data

### **If task creation fails:**

1. **Check request payload:**
   - Should include `title` and `priority`
   - Priority should be "Low", "Medium", or "High"

2. **Check backend validation:**
   - Title is required
   - Priority is optional (defaults to "Medium")

3. **Check CORS:**
   - Backend CORS allows all origins
   - Should not be a CORS issue

### **If XP doesn't update:**

1. **Check task completion response:**
   - Should include `xpReward` and `userXP` fields
   - Verify XP calculation in backend logs

2. **Check frontend query invalidation:**
   - TaskItem invalidates `userXP` query after completion
   - Header should refetch XP automatically

3. **Check Header component:**
   - Should be using `useQuery` with `queryKey: ['userXP']`
   - Should refetch every 30 seconds

---

## 📝 **Current Behavior**

### **What Works:**
- ✅ Create tasks (with priority)
- ✅ List incomplete tasks
- ✅ Complete tasks (with XP reward)
- ✅ Delete tasks
- ✅ XP updates in header
- ✅ Falls back to local storage when not authenticated

### **Limitations:**
- ⚠️ Completed tasks don't show in list (backend filters them out)
- ⚠️ Can't uncomplete a task (would need separate endpoint or show completed tasks)

### **Future Enhancements:**
- Add endpoint to get all tasks (including completed)
- Add filter to show/hide completed tasks
- Add task editing (update title/priority)

---

## 🎯 **Quick Test Commands**

```bash
# Test create task (requires auth token)
curl -X POST http://localhost:8000/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","priority":"Medium"}'

# Test get tasks (requires auth token)
curl -X GET http://localhost:8000/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test complete task (requires auth token)
curl -X PATCH http://localhost:8000/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Test delete task (requires auth token)
curl -X DELETE http://localhost:8000/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ **Verification Checklist**

- [ ] Can create tasks when logged in
- [ ] Tasks appear in list after creation
- [ ] Tasks persist after page refresh
- [ ] Can complete tasks
- [ ] XP increases when completing tasks
- [ ] XP updates in header
- [ ] Can delete tasks
- [ ] Priority badges display correctly
- [ ] Tasks sorted correctly (incomplete first)
- [ ] Falls back to local storage when not logged in
