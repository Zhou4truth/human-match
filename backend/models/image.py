from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    filepath = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    face_encoding = Column(String)  # Stored as base64 encoded numpy array
    is_reference = Column(Boolean, default=False)  # Whether this image is in the reference database
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship with user
    user = relationship("User", back_populates="images")

class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(Integer, primary_key=True, index=True)
    source_image_id = Column(Integer, ForeignKey("images.id"))
    matched_image_id = Column(Integer, ForeignKey("images.id"))
    similarity_score = Column(Float)
    match_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    source_image = relationship("Image", foreign_keys=[source_image_id])
    matched_image = relationship("Image", foreign_keys=[matched_image_id])
