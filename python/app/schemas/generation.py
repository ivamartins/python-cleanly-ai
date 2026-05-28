from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GenerationCreate(BaseModel):
    mask_base64: str
    original_filename: Optional[str] = None
    mode: Optional[str] = "watermark"           # atualmente apenas "watermark"
    engine: Optional[str] = "lama"              # atualmente apenas "lama"
    prompt: Optional[str] = None
    negative_prompt: Optional[str] = None

class GenerationResponse(BaseModel):
    id: int
    status: str
    mode: str
    engine: str
    prompt: Optional[str] = None
    negative_prompt: Optional[str] = None
    original_filename: Optional[str]
    result_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
