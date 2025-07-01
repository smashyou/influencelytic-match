#!/bin/bash
# ai_service/start.sh - AI Service startup script

echo "🤖 Starting Influencelytic AI Service..."

# Activate virtual environment
source venv/bin/activate

# Check if models directory exists
if [ ! -d "models" ]; then
    mkdir -p models/.cache
    echo "📁 Created models directory"
fi

# Set environment variables for model caching
export TRANSFORMERS_CACHE="./models/.cache"
export HF_HOME="./models/.cache"

echo "📦 Loading AI models (this may take a moment on first run)..."

# Start the service with proper uvicorn command
uvicorn main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload \
    --log-level info \
    --access-log

echo "🚀 AI Service started on http://localhost:8000"
echo "📚 API docs available at http://localhost:8000/docs"