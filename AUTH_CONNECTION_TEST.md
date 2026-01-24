# Authentication Connection Testing Guide

## ✅ **What's Fixed**

1. ✅ **bcrypt compatibility** - Downgraded to bcrypt 4.3.0 (compatible with passlib)
2. ✅ **Password truncation** - Added helper function to handle 72-byte limit properly
3. ✅ **Register endpoint** - Removed auth headers (registration doesn't need auth)
4. ✅ **Signup flow** - Updated to show email verification message instead of auto-login

---

## 🧪 **Testing Steps**

### **1. Backend (Render)**
- URL: `https://blossombackend-ib15.onrender.com`
- Docs: `https://blossombackend-ib15.onrender.com/docs`

### **2. Frontend (Render)**
- URL: `https://blossom-arru.onrender.com`

### **3. Test Registration**

1. Open `https://blossom-arru.onrender.com`
2. Click "Sign Up" or go to `/signup`
3. Fill in:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click "Sign Up"
5. **Expected:** Success message saying "Please check your email to verify"
6. **Expected:** Redirects to login page

**Check backend logs** - Should see:
- "Mock email to test@example.com: Hello! Please verify your Email for Blossom [code]"
- User created in database

### **4. Test Email Verification**

**Note:** The backend sends a verification code. For testing, check the backend console/logs for the code.

1. Get verification code from backend logs (6-digit number)
2. We'll need to create an email verification page or use the API directly

**Using Swagger UI:**
- Go to `https://blossombackend-ib15.onrender.com/docs`
- Find `/verify_email` endpoint
- Use POST method with:
  ```json
  {
    "email": "test@example.com",
    "verification_token": "123456"  // Use code from backend logs
  }
  ```

### **5. Test Login**

1. Go to `/login` page
2. Enter:
   - Username or Email: `testuser` (or `test@example.com`)
   - Password: `password123`
3. Click "Log In"
4. **Expected:** Success message "Welcome back! 🎉"
5. **Expected:** Redirects to home page (`/`)
6. **Expected:** Header shows username and XP

**Check:**
- Token is stored in AuthContext
- Header shows "Hi, testuser!"
- XP is displayed (fetched from backend)

---

## 🔍 **Debugging**

### **If Registration Fails:**

1. **Check backend logs** for errors
2. **Check browser console** (F12) for API errors
3. **Check Network tab** to see the actual request/response
4. **Verify backend is running** on port 8000
5. **Check `.env.local`** has correct `VITE_API_URL=https://blossombackend-ib15.onrender.com`

### **If Login Fails:**

1. **Check if email is verified** - Backend might require verification
2. **Check token in browser** - Should be stored in AuthContext
3. **Check API response** - Should return `access_token`, `username`, `email`
4. **Verify password** - Make sure it matches what you registered with

### **Common Issues:**

- **CORS errors** - Backend CORS is set to allow all origins, should work
- **401 Unauthorized** - Token might be expired or invalid
- **404 Not Found** - Check API URL in `.env.local`
- **500 Internal Server Error** - Check backend logs for details

---

## 📝 **Next Steps After Auth Works**

1. ✅ Test Tasks connection
2. ✅ Test Pets connection  
3. ✅ Test Stats/Analytics
4. ✅ Add email verification UI (optional)

---

## 🎯 **Quick Test Commands**

```bash
# Test backend registration endpoint directly
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Test backend login endpoint directly  
curl -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=password123"
```
