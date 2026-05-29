# Engines - Cleanly

This folder contains the processing engine layer for Cleanly.

## Current Status (Module 1 - Watermark Removal)

The project is **100% focused on watermark removal** using **LaMa via IOPaint**.

- `base.py` — Abstract interface
- `engine_factory.py` — Simple factory (only "lama")
- `lama_engine.py` — Functional implementation using LaMa (the lightest and fastest for watermark)

## How it works

1. The user draws a mask on the frontend.
2. The backend saves the image + mask.
3. The Celery task calls `LamaEngine`.
4. The engine runs the `iopaint run --model lama` command **inside the dedicated container** using `docker exec` (via Docker socket).
5. The result is returned to the user.

## Why only LaMa?

- Lightweight (runs well on CPU)
- Excellent quality for watermark and text removal
- No prompt needed
- Fast to build and run

Other engines (SD Inpaint, etc.) were removed to keep the project simple, lightweight, and suitable as a portfolio/study project.

## How to add a new Engine (future)

If you want to try other models later:

1. Create `new_engine.py` inheriting from `BaseEngine`
2. Implement `process()`
3. Register it in `engine_factory.py`

## Useful commands

```bash
# View processing logs
docker compose logs -f celery-worker

# Access the IOPaint container
docker exec -it cleanly-iopaint bash
```

## Stack

- LaMa (via IOPaint)
- FastAPI + Celery + PostgreSQL + Redis
- Next.js (frontend)
- Docker Compose
