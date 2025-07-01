# scripts/dev.sh - Development Server Startup Script

#!/bin/bash

set -e

echo "🚀 Starting Influencelytic-Match Development Environment..."

# Function to start backend
start_backend() {
    echo "📦 Starting Backend API..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"
    cd ..
}

# Function to start AI service
start_ai_service() {
    echo "🤖 Starting AI Service..."
    cd ai_service
    source venv/bin/activate
    uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
    AI_PID=$!
    echo "AI Service started with PID: $AI_PID"
    cd ..
}

# Function to start frontend (if it exists)
start_frontend() {
    if [ -d "frontend" ]; then
        echo "🌐 Starting Frontend..."
        cd frontend
        npm run dev &
        FRONTEND_PID=$!
        echo "Frontend started with PID: $FRONTEND_PID"
        cd ..
    fi
}

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo "Backend stopped"
    fi
    
    if [ ! -z "$AI_PID" ]; then
        kill $AI_PID 2>/dev/null || true
        echo "AI Service stopped"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo "Frontend stopped"
    fi
    
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handling
trap cleanup SIGINT SIGTERM

# Check if environment files exist
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env not found. Run ./scripts/setup.sh first."
    exit 1
fi

if [ ! -f "ai_service/.env" ]; then
    echo "❌ ai_service/.env not found. Run ./scripts/setup.sh first."
    exit 1
fi

# Start services
start_backend
sleep 2
start_ai_service
sleep 2
start_frontend

echo ""
echo "✅ All services started!"
echo "=================================================="
echo "🔗 Service URLs:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:3001"
echo "   • AI Service: http://localhost:8000"
echo "   • API Documentation: http://localhost:3001/api-docs"
echo ""
echo "📝 Logs:"
echo "   • Press Ctrl+C to stop all services"
echo "   • Check individual terminals for detailed logs"
echo ""

# Wait for user interrupt
wait
