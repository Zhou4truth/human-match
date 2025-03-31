import face_recognition
import numpy as np
import cv2
from typing import List, Tuple, Optional, Dict
import base64
import os
from deepface import DeepFace
import logging
from concurrent.futures import ThreadPoolExecutor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Default similarity threshold (can be configured)
DEFAULT_SIMILARITY_THRESHOLD = 0.95  # 95% similarity required for a match

class FaceRecognitionService:
    def __init__(self, similarity_threshold=DEFAULT_SIMILARITY_THRESHOLD):
        self.similarity_threshold = similarity_threshold
        self.models = {
            "face_recognition": "hog",  # Can be 'hog' (faster) or 'cnn' (more accurate)
            "deepface": "VGG-Face"  # Options: VGG-Face, Facenet, OpenFace, DeepFace, DeepID, ArcFace, Dlib
        }
        # Create directory for temporary files if it doesn't exist
        os.makedirs("temp", exist_ok=True)
        
    def encode_face(self, image_path: str) -> Optional[np.ndarray]:
        """Extract face encoding from an image."""
        try:
            # Load image
            image = face_recognition.load_image_file(image_path)
            
            # Find all faces in the image
            face_locations = face_recognition.face_locations(image, model=self.models["face_recognition"])
            
            # If no faces found, return None
            if not face_locations:
                logger.warning(f"No faces found in image: {image_path}")
                return None
                
            # Get face encodings (using the first face found)
            face_encodings = face_recognition.face_encodings(image, face_locations)
            
            if not face_encodings:
                logger.warning(f"Could not encode face in image: {image_path}")
                return None
                
            # Return the first face encoding
            return face_encodings[0]
        except Exception as e:
            logger.error(f"Error encoding face: {str(e)}")
            return None
    
    def encode_to_base64(self, encoding: np.ndarray) -> str:
        """Convert numpy array to base64 string for storage."""
        return base64.b64encode(encoding.tobytes()).decode('utf-8')
    
    def decode_from_base64(self, encoded_string: str) -> np.ndarray:
        """Convert base64 string back to numpy array."""
        decoded = base64.b64decode(encoded_string)
        return np.frombuffer(decoded, dtype=np.float64)
    
    def compare_faces(self, face_encoding1: np.ndarray, face_encoding2: np.ndarray) -> float:
        """Compare two face encodings and return similarity score."""
        # Calculate face distance (lower means more similar)
        face_distance = face_recognition.face_distance([face_encoding1], face_encoding2)[0]
        
        # Convert distance to similarity score (0 to 1, where 1 is perfect match)
        similarity = 1 - face_distance
        
        return similarity
    
    def is_match(self, similarity: float) -> bool:
        """Determine if similarity score constitutes a match."""
        return similarity >= self.similarity_threshold
    
    def find_match_in_database(self, query_encoding: np.ndarray, 
                              database_encodings: List[Tuple[int, np.ndarray]],
                              parallel: bool = True) -> Optional[Dict]:
        """
        Find the best match for a face in the database.
        
        Args:
            query_encoding: Face encoding to match
            database_encodings: List of tuples (image_id, face_encoding)
            parallel: Whether to use parallel processing
            
        Returns:
            Dictionary with match information or None if no match found
        """
        if not database_encodings:
            return None
            
        if parallel and len(database_encodings) > 5:
            # Use parallel processing for larger databases
            with ThreadPoolExecutor() as executor:
                results = list(executor.map(
                    lambda x: (x[0], self.compare_faces(query_encoding, x[1])),
                    database_encodings
                ))
        else:
            # Sequential processing for smaller databases
            results = [(id, self.compare_faces(query_encoding, enc)) for id, enc in database_encodings]
        
        # Sort by similarity score (highest first)
        results.sort(key=lambda x: x[1], reverse=True)
        
        # Get the best match
        best_match_id, best_similarity = results[0]
        
        # Check if it's a match
        if self.is_match(best_similarity):
            return {
                "image_id": best_match_id,
                "similarity": best_similarity,
                "is_match": True
            }
        
        return None
    
    def verify_with_deepface(self, img1_path: str, img2_path: str) -> Dict:
        """
        Secondary verification using DeepFace for higher accuracy.
        
        Args:
            img1_path: Path to first image
            img2_path: Path to second image
            
        Returns:
            Dictionary with verification results
        """
        try:
            result = DeepFace.verify(
                img1_path=img1_path,
                img2_path=img2_path,
                model_name=self.models["deepface"],
                detector_backend="opencv"
            )
            return result
        except Exception as e:
            logger.error(f"DeepFace verification error: {str(e)}")
            return {"verified": False, "distance": 1.0, "error": str(e)}
    
    def detect_faces(self, image_path: str) -> List[Dict]:
        """
        Detect and analyze faces in an image.
        
        Args:
            image_path: Path to the image
            
        Returns:
            List of dictionaries with face information
        """
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                logger.error(f"Could not load image: {image_path}")
                return []
                
            # Convert to RGB (face_recognition uses RGB)
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Detect face locations
            face_locations = face_recognition.face_locations(rgb_image, model=self.models["face_recognition"])
            
            # Get face landmarks
            face_landmarks_list = face_recognition.face_landmarks(rgb_image, face_locations)
            
            # Prepare results
            results = []
            for i, (top, right, bottom, left) in enumerate(face_locations):
                face_dict = {
                    "location": {
                        "top": top,
                        "right": right,
                        "bottom": bottom,
                        "left": left
                    },
                    "landmarks": face_landmarks_list[i] if i < len(face_landmarks_list) else None
                }
                results.append(face_dict)
                
            return results
        except Exception as e:
            logger.error(f"Error detecting faces: {str(e)}")
            return []
            
    def analyze_face(self, image_path: str) -> Dict:
        """
        Perform comprehensive face analysis using DeepFace.
        
        Args:
            image_path: Path to the image
            
        Returns:
            Dictionary with analysis results
        """
        try:
            analysis = DeepFace.analyze(
                img_path=image_path,
                actions=['age', 'gender', 'race', 'emotion'],
                detector_backend="opencv"
            )
            return analysis
        except Exception as e:
            logger.error(f"Face analysis error: {str(e)}")
            return {"error": str(e)}
