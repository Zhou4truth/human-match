#!/bin/bash

# Human Match Test Script
echo "===== Human Match Environment Testing ====="
echo "This script will test the environment setup for Human Match application"
echo

# Create output directory for test results
mkdir -p test-results

# Test Backend Environment
echo "===== Testing Backend Environment ====="

# Check Python installation
echo -n "Checking Python installation... "
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ $PYTHON_VERSION"
else
    echo "❌ Python 3 not found"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

# Check virtual environment
echo -n "Checking virtual environment... "
cd backend
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found"
    echo "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create virtual environment"
        exit 1
    fi
else
    echo "✅ Virtual environment exists"
fi

# Activate virtual environment
echo -n "Activating virtual environment... "
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "❌ Failed to activate virtual environment"
    exit 1
else
    echo "✅ Virtual environment activated"
fi

# Install dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    echo "Some dependencies might require system libraries. Check the error messages."
else
    echo "✅ Dependencies installed"
fi

# Test critical dependencies
echo "Testing critical dependencies..."

echo -n "Testing SQLAlchemy... "
python -c "import sqlalchemy; print('✅ SQLAlchemy', sqlalchemy.__version__)" || echo "❌ SQLAlchemy not installed properly"

echo -n "Testing FastAPI... "
python -c "import fastapi; print('✅ FastAPI', fastapi.__version__)" || echo "❌ FastAPI not installed properly"

echo -n "Testing face_recognition... "
python -c "import face_recognition; print('✅ face_recognition available')" || echo "❌ face_recognition not installed properly"

echo -n "Testing DeepFace... "
python -c "import deepface; print('✅ DeepFace', deepface.__version__)" || echo "❌ DeepFace not installed properly"

# Test upload directories
echo -n "Testing upload directories... "
mkdir -p app/uploads/reference app/uploads/query
if [ $? -ne 0 ]; then
    echo "❌ Failed to create upload directories"
else
    echo "✅ Upload directories created"
fi

# Deactivate virtual environment
deactivate
cd ..

# Test Frontend Environment
echo
echo "===== Testing Frontend Environment ====="

# Check Node.js installation
echo -n "Checking Node.js installation... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js $NODE_VERSION"
else
    echo "❌ Node.js not found"
    echo "Please install Node.js 14 or higher"
    exit 1
fi

# Check npm installation
echo -n "Checking npm installation... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm $NPM_VERSION"
else
    echo "❌ npm not found"
    echo "Please install npm"
    exit 1
fi

# Check frontend dependencies
echo -n "Checking frontend dependencies... "
cd frontend
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found"
    echo "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    else
        echo "✅ Frontend dependencies installed"
    fi
else
    echo "✅ node_modules exists"
fi

cd ..

# Test Docker Environment
echo
echo "===== Testing Docker Environment ====="

# Check Docker installation
echo -n "Checking Docker installation... "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ $DOCKER_VERSION"
else
    echo "❌ Docker not found"
    echo "Docker is required for containerized deployment"
fi

# Check Docker Compose installation
echo -n "Checking Docker Compose installation... "
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(docker-compose --version)
    echo "✅ $DOCKER_COMPOSE_VERSION"
else
    echo "❌ Docker Compose not found"
    echo "Docker Compose is required for containerized deployment"
fi

echo
echo "===== Environment Test Summary ====="
echo "Please review the test results above and fix any issues before deployment."
echo "For detailed testing steps, refer to TESTING.md"
echo
