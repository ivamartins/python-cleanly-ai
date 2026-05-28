import base64
import io
import uuid
from pathlib import Path
from PIL import Image, ImageFilter

from app.core.config import settings

# Shared data directory (will be mounted in docker)
DATA_DIR = Path("/app/data")
UPLOADS_DIR = DATA_DIR / "uploads"
MASKS_DIR = DATA_DIR / "masks"
RESULTS_DIR = DATA_DIR / "results"

for folder in [UPLOADS_DIR, MASKS_DIR, RESULTS_DIR]:
    folder.mkdir(parents=True, exist_ok=True)


def save_base64_image(base64_str: str, filename: str, folder: Path) -> Path:
    """Save a base64 image to disk and return the path."""
    if "," in base64_str:
        base64_str = base64_str.split(",", 1)[1]

    image_data = base64.b64decode(base64_str)
    filepath = folder / filename
    with open(filepath, "wb") as f:
        f.write(image_data)
    return filepath


def create_mask_from_base64(
    mask_base64: str,
    original_size: tuple,
    dilate: bool = False,
    feather: bool = False,
) -> Path:
    """
    Converte uma máscara em base64 para uma imagem PNG no disco.
    Usada pelo engine LaMa para remoção de marca d'água.
    """
    if "," in mask_base64:
        mask_base64 = mask_base64.split(",", 1)[1]

    mask_bytes = base64.b64decode(mask_base64)
    mask_img = Image.open(io.BytesIO(mask_bytes)).convert("L")

    # Redimensiona para o tamanho original se necessário
    if mask_img.size != original_size:
        mask_img = mask_img.resize(original_size, Image.Resampling.NEAREST)

    # Para watermark: máscara precisa (sem dilatação)
    if dilate:
        mask_img = mask_img.filter(ImageFilter.MaxFilter(size=7))

    if feather:
        mask_img = mask_img.filter(ImageFilter.GaussianBlur(radius=1))

    # Salva a máscara final
    mask_path = MASKS_DIR / f"mask_{uuid.uuid4().hex}.png"
    mask_img.save(mask_path)
    return mask_path
