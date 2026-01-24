# Google OAuth Login - Issue & Fix Guide

## 🔍 Issue Identified: **BACKEND NEEDS UPDATE**

### Problem Summary
The Google OAuth flow in the backend is currently configured for **desktop/GUI applications** but you have a **web application**. The current implementation uses a session-based approach that doesn't work for web apps.

---

## 📊 Current vs Required Flow

### Current Flow (Desktop App - NOT WORKING for Web)
```
1. Frontend calls /login/google/start
   ↓
2. Backend creates session_id and stores in login_sessions dict
   ↓
3. Returns session_id and login_url
   ↓
4. Desktop app opens browser window
   ↓
5. After OAuth, backend stores JWT in login_sessions[session_id]
   ↓
6. Shows HTML: "You may close this window"
   ↓
7. Desktop app polls login_sessions to get JWT
```

### Required Flow (Web App - CORRECT)
```
1. Frontend redirects to /login/google
   ↓
2. User authenticates with Google
   ↓
3. Google redirects to /login/google/callback
   ↓
4. Backend creates/updates user, generates JWT
   ↓
5. Backend redirects to frontend: /auth/callback?token=xxx&username=xxx&email=xxx
   ↓
6. Frontend receives token and stores it
   ↓
7. User is logged in!
```

---

## 🔧 Backend Fix Required

### File: `/blossom_backend/be/main.py`

**Location:** Lines 232-295 (the `google_callback` function)

### Current Code (WRONG for Web):
```python
@app.get("/login/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    session_id = request.query_params.get("session_id")
    
    # ... OAuth logic ...
    
    # PROBLEM: This is for desktop apps
    if session_id and session_id in login_sessions:
        login_sessions[session_id]["status"] = "success"
        login_sessions[session_id]["jwt"] = jwt_token
    
    # PROBLEM: Shows HTML instead of redirecting
    return HTMLResponse("<h2>Login / Account created successfully. You may close this window.</h2>")
```

### Required Code (CORRECT for Web):
```python
@app.get("/login/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    # S1: Exchange code for tokens
    token = await oauth.google.authorize_access_token(request)

    # S2: Extract user info from Google
    user_info = token.get("userinfo")
    if user_info is None:
        user_info = await oauth.google.parse_id_token(request, token)

    # Debug print
    print("Google user info:", user_info)
    
    # Extract email, sub
    user_email = user_info["email"]
    user_sub = user_info["sub"]
    
    user = db.query(User).filter(User.email == user_email).first()
    
    # Create new user if doesn't exist
    if not user:
        base_username = user_email.split("@")[0]
        username = base_username
        count = 1

        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}_{count}"
            count += 1

        new_user = User(
            username=username,
            hashed_password="", 
            email=user_email, 
            user_verified=True, 
            start_acc_time=datetime.utcnow(), 
            provider="google",
            provider_id=user_sub
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user = new_user
    
    # IMPORTANT: Create JWT with username (not id) to match your login flow
    data = {"sub": user.username}
    jwt_token = auth_crud.create_access_token(data, expires_delta=timedelta(minutes=30))
    
    # SOLUTION: Redirect to frontend with token
    redirect_url = f"https://blossom-arru.onrender.com/auth/callback?token={jwt_token}&username={user.username}&email={user.email}"
    
    return RedirectResponse(redirect_url)
```

### Key Changes Needed:
1. **Remove** lines 234 (session_id extraction)
2. **Remove** lines 291-293 (session storage)
3. **Replace** line 295 (HTMLResponse) with RedirectResponse
4. **Fix** line 281: Change `data = {"sub": user.id}` to `data = {"sub": user.username}`
5. **Add** redirect to frontend with token, username, and email

---

## ✅ Frontend Fix (ALREADY DONE)

I've already fixed the frontend for you:

### 1. Created `/pages/AuthCallback.tsx`
- Receives token, username, email from URL parameters
- Stores them in auth context
- Redirects to home page

### 2. Updated `/App.tsx`
- Added route: `/auth/callback`

### 3. Google Login Buttons
- Already correctly redirect to `/login/google`
- Located in: Login.tsx, Signup.tsx, Settings.tsx

---

## 📝 Step-by-Step Backend Fix Instructions

### Step 1: Open the file
```bash
nano /home/asus/Desktop/Code/blossom_app/blossom_backend/be/main.py
```

### Step 2: Find the `google_callback` function (around line 232)

### Step 3: Replace the entire function with:
```python
@app.get("/login/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    # S1: Exchange code for tokens
    token = await oauth.google.authorize_access_token(request)

    # S2: Extract user info from Google
    user_info = token.get("userinfo")
    if user_info is None:
        user_info = await oauth.google.parse_id_token(request, token)

    # Debug print
    print("Google user info:", user_info)
    
    # Extract email, sub
    user_email = user_info["email"]
    user_sub = user_info["sub"]
    
    user = db.query(User).filter(User.email == user_email).first()
    
    # Create new user if doesn't exist
    if not user:
        base_username = user_email.split("@")[0]
        username = base_username
        count = 1

        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}_{count}"
            count += 1

        new_user = User(
            username=username,
            hashed_password="", 
            email=user_email, 
            user_verified=True, 
            start_acc_time=datetime.utcnow(), 
            provider="google",
            provider_id=user_sub
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user = new_user
    
    # Create JWT token with username (not id)
    data = {"sub": user.username}
    jwt_token = auth_crud.create_access_token(data, expires_delta=timedelta(minutes=30))
    
    # Redirect to frontend with token and user info
    redirect_url = f"https://blossom-arru.onrender.com/auth/callback?token={jwt_token}&username={user.username}&email={user.email}"
    
    return RedirectResponse(redirect_url)
```

### Step 4: Optional - Remove unused code
You can also remove the `/login/google/start` endpoint (lines 221-229) and the `login_sessions` dictionary (line 47) since they're not needed for web apps.

### Step 5: Save and the server will auto-reload (uvicorn --reload)

---

## 🧪 Testing After Fix

1. **Go to Login page**: `https://blossom-arru.onrender.com/login`
2. **Click "Continue with Google"**
3. **Authenticate with Google**
4. **You should be redirected back** to `https://blossom-arru.onrender.com/auth/callback?token=...`
5. **Then automatically redirected** to home page
6. **Check**: You should be logged in (see username in header)

---

## 🔍 Debugging Tips

If it still doesn't work after the fix:

### Check Backend Logs
Look for:
- "Google user info: ..." (should show email, sub, etc.)
- Any error messages

### Check Frontend Console
- Should show the token being received
- Should show auth context being updated

### Common Issues:
1. **CORS Error**: Make sure CORS is configured (already done in your main.py)
2. **Redirect URI Mismatch**: Check Google Cloud Console OAuth settings
3. **Missing Environment Variables**: Check `.env` file has Google OAuth credentials

---

## 📋 Summary

**Issue**: Backend uses desktop app flow instead of web app flow  
**Location**: `/blossom_backend/be/main.py` - `google_callback` function  
**Fix**: Replace session-based logic with redirect to frontend  
**Frontend**: ✅ Already fixed (AuthCallback page created)  
**Status**: Waiting for backend update  

Once you update the backend code as shown above, Google login will work perfectly! 🎉
