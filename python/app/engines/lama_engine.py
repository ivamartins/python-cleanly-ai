from pathlib import Path
from typing import Optional
import subprocess
import uuid
import os

from app.engines.base import BaseEngine
from app.services.processing import RESULTS_DIR


class LamaEngine(BaseEngine):
    """
    LaMa engine using IOPaint.
    Currently the only and lightest engine in Cleanly.
    """

    name = "lama"

    def process(
        self,
        original_image_path: Path,
        mask_path: Path,
        mode: str,
        prompt: Optional[str] = None,
        negative_prompt: Optional[str] = None,
    ) -> Path:
        """
        Performs inpainting using LaMa.

        LaMa is a traditional inpainting model and **does not use text prompts**.
        Any provided prompt will be ignored (only logged).
        """
        if prompt or negative_prompt:
            print(
                f"[LamaEngine] Prompt received but will be ignored. "
                f"LaMa does not support text prompts. "
                f"Prompt: '{(prompt or '')[:80]}...'"
            )

        result_filename = f"result_{uuid.uuid4().hex}.png"
        output_path = RESULTS_DIR / result_filename

        # Run iopaint CLI inside the dedicated iopaint container using docker exec.
        # This keeps heavy ML dependencies only in the iopaint service.
        cmd = [
            "docker", "exec", "cleanly-iopaint",
            "iopaint", "run",
            "--model", "lama",
            "--device", "cpu",
            "--image", str(original_image_path),
            "--mask", str(mask_path),
            "--output", str(RESULTS_DIR),
        ]

        try:
            subprocess.run(cmd, check=True, capture_output=True, text=True)

            expected_result = RESULTS_DIR / original_image_path.name
            if expected_result.exists():
                expected_result.rename(output_path)
            else:
                files = sorted(RESULTS_DIR.glob("*.png"), key=os.path.getmtime, reverse=True)
                if files:
                    files[0].rename(output_path)

            return output_path

        except subprocess.CalledProcessError as e:
            print("IOPaint (LaMa) error:", e.stderr)
            raise Exception("Failed to process image with LaMa engine (via docker exec in iopaint container)")
