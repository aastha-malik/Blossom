# Complete Backend Packages Installation Guide

## 📦 **Virtual Environment - YES, YOU NEED IT!**

**Why?** Virtual environments keep your project dependencies isolated from other Python projects and your system Python. This prevents conflicts and makes your project portable.

---

## 🚀 **Step 1: Create and Activate Virtual Environment**

```bash
# Navigate to backend directory
cd blossom_backend/be

# Create virtual environment (if not already created)
python3 -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate
```

**Note:** You already have a `venv` folder, so you can skip the creation step and just activate it.

---

## 📋 **Step 2: Complete Package List**

Here's **EVERY package** you need for this FastAPI backend:

### **Core Framework & Server**
1. **FastAPI** - Web framework
2. **uvicorn** - ASGI server to run FastAPI
3. **python-multipart** - For handling form data (login, file uploads)

### **Database & ORM**
4. **SQLAlchemy** - ORM for database operations
5. **SQLite** - ✅ **NO INSTALL NEEDED** (built into Python)

### **Data Validation**
6. **Pydantic** - ✅ **AUTO-INSTALLED** with FastAPI (comes bundled)

### **Authentication & Security**
7. **passlib[bcrypt]** - Password hashing (includes bcrypt)
8. **python-jose** - JWT token creation/verification
9. **cryptography** - ✅ **AUTO-INSTALLED** (dependency of python-jose)

### **Email & Validation**
10. **email-validator** - Email format validation
11. **python-dotenv** - Loading .env files (environment variables)
12. **smtplib** - ✅ **NO INSTALL NEEDED** (built into Python for email sending)

### **OAuth (Google Login)**
13. **authlib** - OAuth integration (Google login)

### **HTTP Requests**
14. **requests** - For making HTTP requests (if needed)

---

## 💻 **Installation Commands**

### **Option A: Install All at Once (Recommended)**

```bash
# Make sure virtual environment is activated first!
pip install fastapi uvicorn sqlalchemy "passlib[bcrypt]" python-jose email-validator python-multipart python-dotenv authlib requests
```

### **Option B: Install One by One**

```bash
# Core Framework
pip install fastapi
pip install uvicorn
pip install python-multipart

# Database
pip install sqlalchemy

# Authentication & Security
pip install "passlib[bcrypt]"
pip install python-jose

# Email & Validation
pip install email-validator
pip install python-dotenv

# OAuth
pip install authlib

# HTTP Requests
pip install requests
```

### **Option C: Install from requirements.txt (After updating it)**

```bash
# After updating requirements.txt, run:
pip install -r requirements.txt
```

---

## ✅ **Missing Packages in Your Current requirements.txt**

Your current `requirements.txt` is missing:
- ❌ **python-dotenv** (you're using `from dotenv import load_dotenv`)
- ❌ **authlib** (you're using it for Google OAuth in `oauth.py`)

---

## 📝 **Updated requirements.txt**

Here's what your complete `requirements.txt` should contain:

```
fastapi
uvicorn
sqlalchemy
passlib[bcrypt]
python-jose
email-validator
python-multipart
python-dotenv
authlib
requests
```

**Total: 10 packages** (SQLite, smtplib, and Pydantic don't need installation)

---

## 🔍 **Verify Installation**

After installing, verify all packages are installed:

```bash
pip list
```

You should see all the packages listed above.

---

## 🎯 **Quick Start Commands**

```bash
# 1. Navigate to backend
cd blossom_backend/be

# 2. Activate virtual environment
source venv/bin/activate

# 3. Install all packages
pip install fastapi uvicorn sqlalchemy "passlib[bcrypt]" python-jose email-validator python-multipart python-dotenv authlib requests

# 4. Verify installation
pip list | grep -E "fastapi|uvicorn|sqlalchemy|passlib|jose|email-validator|multipart|dotenv|authlib|requests"

# 5. Run the server
uvicorn main:app --reload
```

---

## 📌 **Important Notes**

1. **Virtual Environment**: Always activate it before installing packages
2. **SQLite**: No installation needed - it's built into Python
3. **Pydantic**: Comes automatically with FastAPI
4. **cryptography**: Installed automatically with python-jose
5. **smtplib**: Built into Python for email sending
6. **email module**: Built into Python (MIMEText, MIMEMultipart)

---

## 🐛 **Troubleshooting**

If you get errors:
- Make sure virtual environment is activated (you'll see `(venv)` in your terminal)
- Use `pip3` instead of `pip` if `pip` doesn't work
- On some systems: `python3 -m pip install <package>`
