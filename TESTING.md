# Human Match Testing Plan

Before deploying the Human Match application, we need to ensure that all components are working correctly. This document outlines the testing steps required and addresses issues identified during initial testing.

## Current Status

Initial testing has identified the following issues:

- ❌ **face_recognition library installation fails**: This is a critical dependency for the facial recognition functionality.
- ❌ **Docker and Docker Compose are not installed**: Required for containerized deployment.

## 1. Environment Setup Testing

### Backend Environment

#### System Dependencies

Before installing Python dependencies, ensure the following system dependencies are installed:

**macOS:**
```bash
brew install cmake
brew install dlib
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y build-essential cmake
sudo apt-get install -y libopenblas-dev liblapack-dev 
sudo apt-get install -y libx11-dev libgtk-3-dev
```

#### Python Dependencies

- [ ] Verify Python 3.8+ is installed
- [ ] Create and activate virtual environment
- [ ] Install dlib separately: `pip install dlib`
- [ ] Install face_recognition: `pip install face_recognition`
- [ ] Install remaining dependencies: `pip install -r requirements.txt`
- [ ] Verify all dependencies are installed correctly

#### Database and Storage

- [ ] Verify SQLite database creation
- [ ] Create upload directories: `mkdir -p backend/app/uploads/reference backend/app/uploads/query`
- [ ] Test file permissions for upload directories

### Frontend Environment

- [ ] Verify Node.js 14+ is installed
- [ ] Install npm dependencies: `cd frontend && npm install`
- [ ] Test build process: `npm run build`

## 2. Component Testing

### Backend Components

1. Start the backend server:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. Test API endpoints using the Swagger UI at http://localhost:8000/docs:
   - [ ] Test user authentication endpoints
   - [ ] Test image upload functionality
   - [ ] Test face encoding functionality
   - [ ] Test image matching algorithm
   - [ ] Verify parallel processing capabilities
   - [ ] Test API response formats

### Frontend Components

1. Start the frontend server:
   ```bash
   cd frontend
   npm start
   ```

2. Test UI components in the browser at http://localhost:3000:
   - [ ] Test login page functionality
   - [ ] Test user profile page rendering
   - [ ] Test image upload interface
   - [ ] Test match functionality UI
   - [ ] Verify responsive design

## 3. Integration Testing

Test the full application flow:

1. [ ] Start both backend and frontend servers
2. [ ] Log in with admin credentials (admin/123456)
3. [ ] Navigate to the Upload page and upload test images
4. [ ] Navigate to the Match page and test matching functionality
5. [ ] Verify match results display with correct similarity scores
6. [ ] Check user profile for updated match history

## 4. Performance Testing

- [ ] Test facial recognition speed with different image sizes
- [ ] Verify matching precision (90-95% threshold)
- [ ] Test system under load with multiple images
- [ ] Verify parallel processing performance

## 5. Deployment Testing

### Docker Installation

**macOS:**
```bash
brew install docker
brew install docker-compose
```

**Ubuntu/Debian:**
```bash
sudo apt-get install -y docker.io docker-compose
```

### Docker Testing

- [ ] Build Docker images: `docker-compose build`
- [ ] Start containers: `docker-compose up -d`
- [ ] Verify application is accessible at http://localhost
- [ ] Test all functionality in the containerized environment
- [ ] Check logs for any errors: `docker-compose logs`

## Testing Checklist

Use this checklist to track testing progress:

1. [ ] Install system dependencies (cmake, dlib, etc.)
2. [ ] Install all backend Python dependencies
3. [ ] Start backend server successfully
4. [ ] Install all frontend dependencies
5. [ ] Start frontend server successfully
6. [ ] Successfully log in with admin credentials
7. [ ] Upload test images to the system
8. [ ] Successfully match faces between images
9. [ ] Verify match results with expected precision (90-95%)
10. [ ] Install Docker and Docker Compose
11. [ ] Build and run Docker containers
12. [ ] Verify application functionality in Docker environment

## Troubleshooting Common Issues

### face_recognition Installation Issues

If you encounter issues installing the face_recognition library:

1. Make sure all system dependencies are installed (cmake, etc.)
2. Try installing dlib separately: `pip install dlib`
3. Then install face_recognition: `pip install face_recognition`

### Docker Issues

If you encounter issues with Docker:

1. Make sure Docker daemon is running: `sudo systemctl start docker`
2. Make sure you have permissions to use Docker: `sudo usermod -aG docker $USER`

### Database Issues

If you encounter database issues:

1. Check that the SQLite database file is created: `backend/human_match.db`
2. Verify database permissions: `chmod 644 backend/human_match.db`

## Next Steps After Testing

Once all tests pass:

1. Update the README.md with any additional setup instructions
2. Push the final changes to GitHub
3. Deploy to your remote host using the Docker configuration
4. Set up proper environment variables for production
