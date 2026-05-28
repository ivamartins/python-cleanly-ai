FROM python:3.12-slim
WORKDIR /app

# Install system dependencies + Docker CLI (needed to run commands inside iopaint container)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
