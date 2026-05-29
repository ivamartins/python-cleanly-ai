from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

class Generation(Base):
    __tablename__ = "generations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")  # pending, processing, done, failed
    mode = Column(String, default="watermark")    # currently only "watermark"
    engine = Column(String, default="lama")       # currently only "lama" (LaMa via IOPaint)
    prompt = Column(Text, nullable=True)          # text prompt for generative models
    negative_prompt = Column(Text, nullable=True) # negative prompt for generative models
    original_filename = Column(String, nullable=True)
    original_path = Column(String, nullable=True)   # path to the saved original image
    mask_base64 = Column(Text, nullable=True)       # mask in base64 (temporarily stored)
    mask_path = Column(String, nullable=True)       # path to saved mask
    result_path = Column(String, nullable=True)     # path to the result
    thumbnail_path = Column(String, nullable=True)  # path to the result thumbnail
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="generations")
