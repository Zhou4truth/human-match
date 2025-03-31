from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os

from app.database import get_db, engine, Base
from models.user import User
from models.image import Image, MatchResult
from utils.auth import get_password_hash
from routers import auth, users, images

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Human Match API",
    description="API for facial recognition and matching",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router, prefix="/api")
app.include_router(images.router, prefix="/api")

# Create upload directories if they don't exist
os.makedirs("uploads", exist_ok=True)
os.makedirs(os.path.join("uploads", "reference"), exist_ok=True)
os.makedirs(os.path.join("uploads", "query"), exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def startup_event():
    # Create admin user if it doesn't exist
    db = next(get_db())
    admin_user = db.query(User).filter(User.username == "admin").first()
    
    if admin_user is None:
        admin_user = User(
            username="admin",
            email="admin@example.com",
            hashed_password=get_password_hash("123456"),
            full_name="Administrator",
            is_admin=True
        )
        db.add(admin_user)
        db.commit()

@app.get("/")
async def root():
    return {"message": "Welcome to Human Match API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
