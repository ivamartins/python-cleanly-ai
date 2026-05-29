from app.celery_app import celery_app
from app.engines.engine_factory import get_engine
from app.db import SessionLocal
from app.models.generation import Generation
from app.models.user import User
from pathlib import Path
from PIL import Image
import logging

from app.services.processing import RESULTS_DIR

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=2)
def process_generation_task(self, generation_id: int):
    db = SessionLocal()
    gen = None
    try:
        gen = db.query(Generation).filter(Generation.id == generation_id).first()
        if not gen:
            return

        gen.status = "processing"
        db.commit()

        logger.info(f"Processing generation {generation_id} | mode=watermark | engine=lama")

        original_path = Path(gen.original_path)
        if not original_path.exists():
            raise FileNotFoundError("Original image not found")

        # Load original image dimensions
        with Image.open(original_path) as img:
            original_size = img.size

        # Prepare precise mask for watermark removal (no aggressive dilation)
        processing_engine = get_engine("lama")
        mask_path = processing_engine.prepare_mask(
            gen.mask_base64,
            original_size,
            mode="watermark"
        )
        logger.info("Mask prepared for watermark removal")

        # Execute LaMa processing
        result_path = processing_engine.process(
            original_image_path=original_path,
            mask_path=mask_path,
            mode="watermark",
        )

        # Generate thumbnail
        thumbnail_filename = f"thumb_{result_path.name}"
        thumbnail_path = RESULTS_DIR / thumbnail_filename

        with Image.open(result_path) as img:
            img.thumbnail((400, 400))
            img.save(thumbnail_path, "PNG")

        # Update the record
        gen.status = "done"
        gen.mask_path = str(mask_path)
        gen.result_path = str(result_path)
        gen.thumbnail_path = str(thumbnail_path)
        db.commit()

    except Exception as exc:
        if gen:
            gen.status = "failed"
            db.commit()
        raise self.retry(exc=exc, countdown=60)
    finally:
        db.close()
