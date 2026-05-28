from typing import Optional, Dict, Type

from app.engines.base import BaseEngine
from app.engines.lama_engine import LamaEngine


# Only LaMa engine is active (Module 1 - Watermark Removal)
ENGINE_REGISTRY: Dict[str, Type[BaseEngine]] = {
    "lama": LamaEngine,
}


def get_engine(engine_name: Optional[str] = None) -> BaseEngine:
    """
    Factory responsible for instantiating the correct engine based on name.

    This is the recommended way to obtain an engine in the system.
    """
    if not engine_name:
        engine_name = "lama"

    engine_name = engine_name.lower().strip()

    engine_class = ENGINE_REGISTRY.get(engine_name)

    if engine_class is None:
        print(f"[EngineFactory] Engine '{engine_name}' not found. Falling back to 'lama'.")
        engine_class = LamaEngine

    return engine_class()
