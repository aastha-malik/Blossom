# Connecting Web Frontend to Backend

## Quick Setup Guide

### 1. Backend (Production)
The backend is deployed on Render.
URL: `https://blossombackend-ib15.onrender.com`
Docs: `https://blossombackend-ib15.onrender.com/docs`

The backend is available at: `https://blossombackend-ib15.onrender.com`

### 2. Frontend Setup

**Option A: Use Local Backend (Recommended for Development)**

Create a `.env` file in `blossom_web/` directory:
```bash
cd blossom_web
echo "VITE_API_URL=http://localhost:8000" > .env
```

The frontend is configured to use the deployed backend at `https://blossombackend-ib15.onrender.com`.
Production URL: `https://blossom-arru.onrender.com`

**Start the frontend:**
```bash
cd blossom_web
npm run dev
```

The frontend will be available at: `http://localhost:5173` (or next available port)

### 3. Verify Connection

1. Start the backend server (see step 1)
2. Start the frontend dev server (see step 2)
1. Open browser to `https://blossom-arru.onrender.com`
4. Check browser console for any API connection errors
5. Try logging in or registering a new account

## API Configuration

The frontend API client is configured in:
- `blossom_web/src/utils/constants.ts` - API URL configuration
- `blossom_web/src/api/endpoints.ts` - Endpoint definitions
- `blossom_web/src/api/client.ts` - API client functions

## Backend CORS

The backend is configured to accept requests from any origin (for development):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Troubleshooting

### Backend not starting
- Make sure virtual environment is activated
- Check if port 8000 is already in use
- Verify all Python packages are installed: `pip install -r requirements.txt`

### Frontend can't connect to backend
- Verify backend is running on `http://localhost:8000`
- Check `.env` file has correct `VITE_API_URL`
- Restart frontend dev server after changing `.env`
- Check browser console for CORS errors

### Authentication issues
- Verify JWT token is being stored correctly
- Check token expiration (backend tokens expire in 20 minutes)
- Ensure Authorization header is being sent: `Bearer <token>`
