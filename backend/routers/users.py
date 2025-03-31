from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from pydantic import BaseModel, EmailStr

from app.database import get_db
from utils.auth import get_current_active_user, get_current_admin_user, get_password_hash
from models.user import User
from models.image import Image, MatchResult

router = APIRouter(tags=["users"])

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str = None
    is_admin: bool = False

class UserUpdate(BaseModel):
    email: EmailStr = None
    full_name: str = None
    password: str = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str = None
    is_admin: bool
    is_active: bool

    class Config:
        orm_mode = True

class UserProfileResponse(UserResponse):
    total_uploads: int
    total_matches: int
    
    class Config:
        orm_mode = True

@router.post("/users", response_model=UserResponse)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new user (admin only)."""
    # Check if username already exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        is_admin=user.is_admin
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.get("/users/profile", response_model=UserProfileResponse)
async def get_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get the current user's profile with statistics."""
    # Count total uploads
    total_uploads = db.query(Image).filter(Image.user_id == current_user.id).count()
    
    # Count total matches
    user_image_ids = db.query(Image.id).filter(Image.user_id == current_user.id).all()
    user_image_ids = [img_id for (img_id,) in user_image_ids]
    
    total_matches = db.query(MatchResult).filter(
        MatchResult.source_image_id.in_(user_image_ids)
    ).count()
    
    # Create response with additional fields
    response = UserProfileResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        is_admin=current_user.is_admin,
        is_active=current_user.is_active,
        total_uploads=total_uploads,
        total_matches=total_matches
    )
    
    return response

@router.put("/users/me", response_model=UserResponse)
async def update_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update the current user's profile."""
    # Update email if provided
    if user_update.email and user_update.email != current_user.email:
        # Check if email already exists
        db_user = db.query(User).filter(User.email == user_update.email).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = user_update.email
    
    # Update full name if provided
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    
    # Update password if provided
    if user_update.password:
        current_user.hashed_password = get_password_hash(user_update.password)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/users", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all users (admin only)."""
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific user by ID (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    return user

@router.delete("/users/{user_id}", response_model=UserResponse)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a user (admin only)."""
    # Prevent deleting yourself
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    
    return user
