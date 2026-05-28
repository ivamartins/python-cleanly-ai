from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional


class BaseEngine(ABC):
    """
    Interface para todos os engines de processamento de imagem.
    Cada engine (LaMa, SD Inpainting, Flux, etc.) deve implementar esta classe.
    """

    name: str

    def prepare_mask(
        self,
        mask_base64: str,
        original_size: tuple,
        mode: str,
    ) -> Path:
        """
        Prepara a máscara para remoção de marca d'água.
        Para watermark usamos uma máscara mais precisa (sem dilatação agressiva).
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
        Executa o processamento de remoção de marca d'água.

        Args:
            original_image_path: Caminho da imagem original
            mask_path: Caminho da máscara (já preparada)
            mode: Modo de edição (atualmente apenas "watermark")
            prompt: Ignorado no LaMa
            negative_prompt: Ignorado no LaMa

        Returns:
            Path do resultado gerado
        """
        pass
