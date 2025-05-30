#!/bin/bash

# Recommended Python version: 3.11 or 3.12
# Python 3.13 may cause dependency installation issues (e.g., Pillow).

echo "=== Gym Management System Setup ==="

# Try to use python3.12 if available, else fallback to python3
if command -v python3.12 &> /dev/null; then
    PYTHON_CMD=python3.12
    echo "Using python3.12 for virtual environment."
elif command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
    PYTHON_VERSION=$($PYTHON_CMD -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
    if [[ "$PYTHON_VERSION" == "3.13" ]]; then
        echo "Warning: Python 3.13 is not fully supported. Please use Python 3.11 or 3.12 if you encounter errors."
    fi
else
    echo "Error: Python 3.12 or Python 3.x is not installed. Please install Python 3.12 from https://www.python.org/downloads/"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Create virtual environment
echo "Setting up Python virtual environment..."
$PYTHON_CMD -m venv venv

# Upgrade pip, setuptools, wheel
source venv/bin/activate
pip install --upgrade pip setuptools wheel

# Install backend dependencies
echo "Installing backend dependencies..."
pip install -r backend/requirements.txt

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps
cd ..

# Create necessary directories
echo "Setting up directories..."
mkdir -p backend/frontend_build
mkdir -p backend/media/images

# Start both servers
echo -e "\n=== Servers Starting ==="
echo -e "Backend:  http://localhost:8000"
echo -e "Frontend: http://localhost:3000"
echo -e "=======================\n"

# Start backend server in the background
cd backend
source ../venv/bin/activate
python manage.py migrate
python manage.py runserver localhost:8000 &
BACKEND_PID=$!

# Start frontend server in the background
cd ../frontend
npm start &
FRONTEND_PID=$!

# Function to handle script termination
cleanup() {
    echo -e "\nShutting down servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit 0
}

# Set up trap to catch termination signal
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID 