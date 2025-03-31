# Human Match Setup Guide

This guide provides instructions for setting up the Human Match application on different operating systems.

## System Dependencies

The face_recognition library requires several system dependencies that need to be installed before the Python dependencies.

### macOS

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required dependencies
brew install cmake
brew install dlib
brew install python

# For Docker deployment
brew install docker
brew install docker-compose
```

### Ubuntu/Debian

```bash
# Update package lists
sudo apt-get update

# Install required dependencies
sudo apt-get install -y build-essential cmake
sudo apt-get install -y libopenblas-dev liblapack-dev 
sudo apt-get install -y libx11-dev libgtk-3-dev
sudo apt-get install -y python3-dev python3-pip

# For Docker deployment
sudo apt-get install -y docker.io docker-compose
```

### CentOS/RHEL

```bash
# Update package lists
sudo yum update -y

# Install required dependencies
sudo yum groupinstall -y "Development Tools"
sudo yum install -y cmake
sudo yum install -y blas-devel lapack-devel
sudo yum install -y libX11-devel gtk3-devel
sudo yum install -y python3-devel python3-pip

# For Docker deployment
sudo yum install -y docker docker-compose
```

## Python Environment Setup

After installing the system dependencies, set up the Python environment:

```bash
# Clone the repository
git clone https://github.com/Zhou4truth/human-match.git
cd human-match

# Create and activate virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

## Frontend Setup

Set up the frontend environment:

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install
```

## Docker Setup

If you prefer to use Docker for deployment:

```bash
# Build and start the containers
docker-compose up -d
```

## Verifying Installation

Run the test script to verify that all dependencies are installed correctly:

```bash
./test-environment.sh
```

## Troubleshooting

### face_recognition Installation Issues

If you encounter issues installing the face_recognition library:

1. Make sure all system dependencies are installed
2. Try installing dlib separately:
   ```bash
   pip install dlib
   ```
3. Then install face_recognition:
   ```bash
   pip install face_recognition
   ```

### Docker Issues

If you encounter issues with Docker:

1. Make sure Docker daemon is running:
   ```bash
   sudo systemctl start docker
   ```
2. Make sure you have permissions to use Docker:
   ```bash
   sudo usermod -aG docker $USER
   ```
   (Log out and log back in for this to take effect)
