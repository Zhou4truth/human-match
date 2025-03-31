#!/bin/bash

# Human Match Development Server Launcher
echo "Starting Human Match Development Environment..."

# Create necessary directories
mkdir -p uploads/reference uploads/query

# Start backend server
echo "Starting backend server..."
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to initialize
sleep 2

# Open API documentation in browser
echo "Opening API documentation..."
open http://localhost:8000/docs

# Start frontend server
echo "Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Function to handle script termination
function cleanup {
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit 0
}

# Register the cleanup function for when the script is terminated
trap cleanup SIGINT SIGTERM

echo "Development environment is running!"
echo "Backend server: http://localhost:8000"
echo "Frontend server: http://localhost:3000"
echo "Press Ctrl+C to stop the servers."

# Keep the script running
wait
