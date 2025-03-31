from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import uuid
from datetime import datetime

from app.database import get_db
from utils.auth import get_current_active_user
from utils.face_recognition_util import FaceRecognitionService
from models.user import User
from models.image import Image, MatchResult
from pydantic import BaseModel

router = APIRouter(tags=["images"])

# Initialize face recognition service
face_service = FaceRecognitionService()

# Create upload directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "reference"), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "query"), exist_ok=True)

class ImageResponse(BaseModel):
    id: int
    filename: str
    filepath: str
    created_at: datetime
    is_reference: bool

    class Config:
        orm_mode = True

class MatchResultResponse(BaseModel):
    id: int
    source_image_id: int
    matched_image_id: int
    similarity_score: float
    match_date: datetime
    matched_image: ImageResponse

    class Config:
        orm_mode = True

@router.post("/upload", response_model=ImageResponse)
async def upload_image(
    is_reference: bool = Form(False),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Upload an image and extract face encodings."""
    # Validate file type
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .png, .jpg, and .jpeg files are allowed"
        )
    
    # Create unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Determine subdirectory based on whether it's a reference image
    subdir = "reference" if is_reference else "query"
    file_path = os.path.join(UPLOAD_DIR, subdir, unique_filename)
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract face encoding
    face_encoding = face_service.encode_face(file_path)
    
    if face_encoding is None:
        # Clean up the file if no face was detected
        os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No face detected in the uploaded image"
        )
    
    # Convert encoding to base64 for storage
    encoded_face = face_service.encode_to_base64(face_encoding)
    
    # Create database entry
    db_image = Image(
        filename=unique_filename,
        filepath=file_path,
        user_id=current_user.id,
        face_encoding=encoded_face,
        is_reference=is_reference
    )
    
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    
    return db_image

@router.get("/images", response_model=List[ImageResponse])
async def get_user_images(
    reference_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all images uploaded by the current user."""
    query = db.query(Image).filter(Image.user_id == current_user.id)
    
    if reference_only:
        query = query.filter(Image.is_reference == True)
        
    images = query.order_by(Image.created_at.desc()).all()
    return images

@router.get("/images/{image_id}", response_model=ImageResponse)
async def get_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific image by ID."""
    image = db.query(Image).filter(Image.id == image_id, Image.user_id == current_user.id).first()
    
    if image is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
        
    return image

@router.post("/match/{image_id}", response_model=Optional[MatchResultResponse])
async def match_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Match an uploaded image against the reference database."""
    # Get the query image
    query_image = db.query(Image).filter(Image.id == image_id, Image.user_id == current_user.id).first()
    
    if query_image is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Get all reference images
    reference_images = db.query(Image).filter(Image.is_reference == True).all()
    
    if not reference_images:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"detail": "No reference images available for matching"}
        )
    
    # Decode query image face encoding
    query_encoding = face_service.decode_from_base64(query_image.face_encoding)
    
    # Prepare database encodings
    database_encodings = [
        (ref_img.id, face_service.decode_from_base64(ref_img.face_encoding))
        for ref_img in reference_images
    ]
    
    # Find the best match
    match_result = face_service.find_match_in_database(query_encoding, database_encodings)
    
    if match_result is None:
        return None
    
    # Get the matched image
    matched_image = db.query(Image).filter(Image.id == match_result["image_id"]).first()
    
    # Create a match result record
    db_match = MatchResult(
        source_image_id=query_image.id,
        matched_image_id=matched_image.id,
        similarity_score=match_result["similarity"]
    )
    
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    
    # Include the matched image in the response
    setattr(db_match, "matched_image", matched_image)
    
    return db_match

@router.get("/match-history", response_model=List[MatchResultResponse])
async def get_match_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get match history for the current user."""
    # Get all source images belonging to the current user
    user_image_ids = db.query(Image.id).filter(Image.user_id == current_user.id).all()
    user_image_ids = [img_id for (img_id,) in user_image_ids]
    
    # Get match results where the source image belongs to the current user
    match_results = db.query(MatchResult).filter(
        MatchResult.source_image_id.in_(user_image_ids)
    ).order_by(MatchResult.match_date.desc()).all()
    
    # Load the matched images for each result
    for result in match_results:
        matched_image = db.query(Image).filter(Image.id == result.matched_image_id).first()
        setattr(result, "matched_image", matched_image)
    
    return match_results
