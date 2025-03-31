# Human Match

A facial recognition web application for matching human faces with high precision.

## Project Overview

Human Match is a web application that allows users to upload images of people and match them against a database of existing images. The application uses state-of-the-art facial recognition technology to determine if the person in the uploaded image matches any person in the database with high precision (90-95% similarity threshold).

## Features

- User authentication system
- User profile management with match history
- Image upload functionality with reference database
- High-precision facial matching using advanced algorithms
- Intuitive user interface with split-screen comparison
- Parallel computing for efficient matching against large databases

## Technical Stack

### Backend
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- face_recognition (facial recognition library)
- DeepFace (advanced facial analysis)
- SQLite (development) / PostgreSQL (production)
- Python multiprocessing for parallel computing

### Frontend
- React.js
- Ant Design (UI framework)
- Axios (HTTP client)
- React Router for navigation

## Project Structure

```
human-match/
├── backend/
│   ├── app/
│   │   ├── database.py
│   │   └── main.py
│   ├── models/
│   │   ├── user.py
│   │   └── image.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── users.py
│   │   └── images.py
│   ├── utils/
│   │   ├── auth.py
│   │   └── face_recognition_util.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── UserProfile.js
│   │   │   ├── Upload.js
│   │   │   └── Match.js
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── run.sh
```

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- Docker and Docker Compose (optional, for containerized deployment)

### Installation

#### Method 1: Using the run script (Recommended for development)

1. Clone the repository
2. Make the run script executable:
   ```
   chmod +x run.sh
   ```
3. Run the application:
   ```
   ./run.sh
   ```
   This will:
   - Create a Python virtual environment
   - Install backend dependencies
   - Start the backend server
   - Install frontend dependencies
   - Start the frontend server

#### Method 2: Manual setup

1. Clone the repository
2. Set up the backend:
   ```
   cd human-match/backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
3. Set up the frontend (in a separate terminal):
   ```
   cd human-match/frontend
   npm install
   npm start
   ```

#### Method 3: Using Docker (Recommended for production)

1. Clone the repository
2. Build and start the containers:
   ```
   docker-compose up -d
   ```
   This will:
   - Build the backend and frontend Docker images
   - Start the containers
   - Make the application available at http://localhost

### Accessing the Application

- Frontend: http://localhost:3000 (development) or http://localhost (Docker)
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Default Admin Credentials

For demo purposes, use the following credentials:
- Username: admin
- Password: 123456

**Note:** Change these credentials in a production environment.

## Facial Recognition Technology

The application uses a combination of face_recognition and DeepFace libraries to achieve high-precision matching:

1. **Primary Recognition**: Uses the face_recognition library with HOG (Histogram of Oriented Gradients) for face detection and a pre-trained model for face encoding.

2. **Secondary Verification**: For borderline matches, uses DeepFace with the VGG-Face model for additional verification.

3. **Parallel Processing**: Implements parallel computing for matching against large databases, significantly improving performance.

The default similarity threshold is set to 95%, which provides a good balance between precision and recall. This can be adjusted in the .env file.

## Development and Deployment

### Development

- Backend API endpoints are available at http://localhost:8000/docs for testing
- The SQLite database is used by default for development
- Hot reloading is enabled for both backend and frontend

### Production Deployment

For production deployment, consider:

1. Using PostgreSQL instead of SQLite
2. Setting up proper environment variables
3. Implementing proper security measures
4. Using Docker for containerization

## License

This project is licensed under the MIT License - see the LICENSE file for details.
