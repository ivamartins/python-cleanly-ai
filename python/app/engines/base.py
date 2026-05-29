from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional


class BaseEngine(ABC):
    """
    Interface for all image processing engines.
    Each engine (LaMa, SD Inpainting, Flux, etc.) must implement this class.
    """

    name: str

    def prepare_mask(
        self,
        mask_base64: str,
        original_size: tuple,
        mode: str,
    ) -> Path:
        """
        Prepares the mask for watermark removal.
        For watermark we use a precise mask (no aggressive dilation).
        """
        from app.services.processing import create_mask_from_base64

        return create_mask_from_base64(
            mask_base64,
            original_size,
            dilate=False,
            feather=False,
        )

    @abstractmethod
    def process(
        self,
        original_image_path: Path,
        mask_path: Path,
        mode: str = "watermark",
        prompt: Optional[str] = None,
        negative_prompt: Optional[str] = None,
    ) -> Path:
        """
        Executes the watermark removal processing.

        Args:
            original_image_path: Path to the original image
            mask_path: Path to the prepared mask
            mode: Editing mode (currently only "watermark")
            prompt: Ignored by LaMa
            negative_prompt: Ignored by LaMa

        Returns:
            Path to the generated result
        """
        pass
