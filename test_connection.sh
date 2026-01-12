#!/bin/bash

# Test script to verify backend-frontend connection

echo "🔍 Testing Backend-Frontend Connection..."
echo ""

# Check if backend is running
echo "1. Checking if backend is running on http://localhost:8000..."
if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo "   ✅ Backend is running!"
    curl -s http://localhost:8000/ | head -c 100
    echo ""
else
    echo "   ❌ Backend is not running!"
    echo "   Start it with: cd blossom_backend/be && source venv/bin/activate && uvicorn main:app --reload"
fi

echo ""
echo "2. Checking frontend configuration..."
if [ -f "blossom_web/.env.local" ]; then
    echo "   ✅ .env.local file found"
    echo "   API URL: $(grep VITE_API_URL blossom_web/.env.local)"
else
    echo "   ⚠️  .env.local not found (will use default deployed backend)"
fi

echo ""
echo "3. Testing API endpoint..."
if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
    echo "   ✅ Backend API docs accessible at http://localhost:8000/docs"
else
    echo "   ❌ Cannot access backend API docs"
fi

echo ""
echo "✨ Setup complete! Start both servers:"
echo "   Backend:  cd blossom_backend/be && source venv/bin/activate && uvicorn main:app --reload"
echo "   Frontend: cd blossom_web && npm run dev"
