from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import shutil
import uuid

from app.db import get_db
from app.models.generation import Generation
from app.schemas.generation import GenerationResponse, GenerationCreate
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.processing import UPLOADS_DIR
from app.tasks import process_generation_task

router = APIRouter(prefix="/generations", tags=["generations"])


@router.post("/", response_model=GenerationResponse)
async def create_generation(
    image: UploadFile = File(...),
    mask_base64: str = Form(...),
    mode: str = Form("watermark"),
    engine: str = Form("lama"),
    prompt: str = Form(None),
    negative_prompt: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Save the original image
    original_filename = f"{uuid.uuid4().hex}_{image.filename}"
    original_path = UPLOADS_DIR / original_filename

    with open(original_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # Module 1: Always use LaMa for watermark removal
    # LaMa does not use text prompts
    new_gen = Generation(
        user_id=current_user.id,
        status="queued",
        mode="watermark",
        engine="lama",
        prompt=None,
        negative_prompt=None,
        original_filename=image.filename,
        original_path=str(original_path),
        mask_base64=mask_base64,
    )
    db.add(new_gen)
    db.commit()
    db.refresh(new_gen)

    # Queue asynchronous processing
    process_generation_task.delay(new_gen.id)

    return new_gen


@router.get("/", response_model=List[GenerationResponse])
def list_generations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Generation).filter(Generation.user_id == current_user.id).order_by(Generation.created_at.desc()).all()


@router.get("/{generation_id}", response_model=GenerationResponse)
def get_generation(
    generation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    gen = db.query(Generation).filter(
        Generation.id == generation_id,
        Generation.user_id == current_user.id
    ).first()

    if not gen:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found")

    return gen
