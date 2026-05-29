# Cleanly

**Intelligent Watermark Removal with Local AI**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.12-blue)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)](https://www.docker.com/)

Cleanly is a modern, lightweight web application for **removing watermarks, logos, and text** from images using local AI (LaMa via IOPaint).

> Built with a focus on **code quality**, simplicity, and as a technical portfolio / study project.

---

## Features

- High-quality removal using **LaMa** (excellent for watermarks and text)
- Mask editor with brush and eraser (precise and intuitive)
- Async processing (Celery task queue)
- Results gallery with thumbnails
- JWT authentication (login and registration)
- 100% local — no images leave your computer
- Clean architecture, easy to study

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Backend     | FastAPI + SQLAlchemy + Celery       |
| AI          | LaMa (via IOPaint)                  |
| Database    | PostgreSQL                          |
| Cache/Queue | Redis                               |
| Frontend    | Next.js 15 + TypeScript + Tailwind  |
| Infra       | Docker Compose                      |

---

## Build Size & Optimizations

The project is carefully optimized for minimal image size:

- Uses **Docker socket mount** in the worker (instead of installing `docker.io` inside the Python image).
- Strategic `.dockerignore` files to reduce build context.
- Only the `iopaint` container carries the heavy LaMa dependencies.

**Realistic estimate:**
- First full build: ≈ **2.8 GB – 3.5 GB** on disk
- Subsequent builds: much faster (uses cache)

---

## Processing Architecture

Image processing works as follows:

1. The Celery Worker receives the task.
2. It runs the `iopaint` command **inside the dedicated container** using `docker exec` (via Docker socket).
3. LaMa processes the image with the provided mask.
4. The result is saved to the shared volume and returned to the user.

This approach keeps both the backend and worker images very lightweight.

---

## How to Run (Recommended)

### 1. Clone the repository

```bash
git clone https://github.com/ivamartins/python-cleanly-ai.git
cd python-cleanly-ai
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit the `.env` file and set a strong `SECRET_KEY`:

```bash
# Generate a secure key
openssl rand -hex 32
```

### 3. Start the application

```bash
sudo docker compose up --build -d
```

**Important build notes:**

- The first run is heavier because it downloads base images + the IOPaint container (LaMa).
- Estimated total size after the first full build: **~2.8 GB – 3.5 GB** on disk.
- The project is optimized to be as light as possible (no `docker.io` inside the Python image, uses Docker socket mount instead).

Subsequent runs are much faster thanks to Docker cache.

### 4. Access the application

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

Create an account and start removing watermarks!

---

## Project Structure

```
python-cleanly-ai/
├── docker-compose.yml
├── Dockerfile.iopaint
├── README.md
├── LICENSE
├── .env.example
│
├── frontend/                 # Next.js
│   ├── app/
│   └── components/
│
└── python/                   # FastAPI Backend
    ├── app/
    │   ├── engines/          # LaMa Engine
    │   ├── routers/
    │   ├── services/
    │   └── tasks.py
    └── requirements.txt
```

---

## Project Goals

This project was created with the following purposes:

- Serve as a **technical portfolio** (Full Stack + AI)
- Demonstrate clean architecture with **pluggable Engines**
- Provide good **study material** (well-organized and commented code)
- Focus on doing one thing excellently (Watermark Removal) rather than many things mediocrely

---

## Privacy

All images and processing happen **locally**.
Nothing is sent to external servers.

---

## License

Distributed under the [MIT](LICENSE) license.

---

## Author

**Iva Martins**
https://github.com/ivamartins

---

## Contributions

This is a study and portfolio project.
Suggestions and improvements are welcome via Pull Request or Issues.

---

**Built with focus on quality and simplicity.**
