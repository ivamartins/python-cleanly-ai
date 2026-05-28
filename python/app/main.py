from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.db import Base, engine
from app.routers import auth, generations
from app.services.processing import UPLOADS_DIR, RESULTS_DIR

app = FastAPI(title="Cleanly API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables (for development)
Base.metadata.create_all(bind=engine)

# Garantir que as pastas de dados existam
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

# Servir arquivos estáticos (resultados e uploads)
app.mount("/results", StaticFiles(directory=str(RESULTS_DIR)), name="results")
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.include_router(auth.router)
app.include_router(generations.router)

@app.get("/")
def root():
    return {"message": "Cleanly API - AI Watermark Removal (LaMa)"}
