# ai_service/Dockerfile - Alternative robust version

FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV TRANSFORMERS_CACHE=/app/models/.cache
ENV HF_HOME=/app/models/.cache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    libpq-dev \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd --create-home --shell /bin/bash app

# Create necessary directories with proper permissions
RUN mkdir -p /app/models/.cache /app/data/cache /app/logs && \
    chown -R app:app /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=app:app . .

# Switch to non-root user
USER app

# Create a model download script
RUN echo '#!/usr/bin/env python3\n\
import os\n\
import sys\n\
\n\
def download_models():\n\
    try:\n\
        # Set cache directory\n\
        os.environ["TRANSFORMERS_CACHE"] = "/app/models/.cache"\n\
        os.environ["HF_HOME"] = "/app/models/.cache"\n\
        \n\
        print("Starting model downloads...")\n\
        \n\
        # Import after setting environment\n\
        from transformers import pipeline, AutoTokenizer, AutoModel\n\
        \n\
        print("Downloading sentiment analysis model...")\n\
        sentiment_pipeline = pipeline(\n\
            "sentiment-analysis",\n\
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",\n\
            return_all_scores=True\n\
        )\n\
        print("✓ Sentiment analysis model downloaded")\n\
        \n\
        print("Downloading embedding model...")\n\
        model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")\n\
        tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")\n\
        print("✓ Embedding model downloaded")\n\
        \n\
        print("All models downloaded successfully!")\n\
        return True\n\
        \n\
    except Exception as e:\n\
        print(f"Error downloading models: {e}")\n\
        print("Models will be downloaded on first use.")\n\
        return False\n\
\n\
if __name__ == "__main__":\n\
    success = download_models()\n\
    sys.exit(0)  # Always exit successfully to not fail Docker build\n\
' > download_models.py && chmod +x download_models.py

# Download models (but don't fail build if it doesn't work)
RUN python3 download_models.py || echo "Model download failed, will download on startup"

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Default command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]