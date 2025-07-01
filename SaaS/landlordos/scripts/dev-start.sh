#!/bin/bash

# LandlordOS Development Startup Script
echo "🏠 Starting LandlordOS Development Environment..."

# Start the backend server
echo "🚀 Starting API server..."
cd server
npx nodemon src/index.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start the frontend
echo "🎨 Starting React frontend..."
cd ../client
npx vite &
FRONTEND_PID=$!

echo "✅ Development environment started!"
echo "📊 API Server: http://localhost:5000"
echo "🌐 Frontend: http://localhost:5173"
echo "💾 Prisma Studio: http://localhost:5555"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down development environment..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
