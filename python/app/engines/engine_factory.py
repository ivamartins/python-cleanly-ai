from typing import Optional, Dict, Type

from app.engines.base import BaseEngine
from app.engines.lama_engine import LamaEngine


# Apenas o engine LaMa (Módulo 1 - Remoção de Marca d'Água)
ENGINE_REGISTRY: Dict[str, Type[BaseEngine]] = {
    "lama": LamaEngine,
}


def get_engine(engine_name: Optional[str] = None) -> BaseEngine:
    """
    Factory responsável por instanciar o engine correto com base no nome.

    Esta é a única forma recomendada de obter um engine no sistema.
    """
    if not engine_name:
        engine_name = "lama"

    engine_name = engine_name.lower().strip()

    engine_class = ENGINE_REGISTRY.get(engine_name)

    if engine_class is None:
        print(f"[EngineFactory] Engine '{engine_name}' não encontrado. Usando 'lama'.")
        engine_class = LamaEngine

    return engine_class()
