#!/bin/bash
# Start all services in development mode

echo "🚀 Starting Influencelytic-Match in development mode..."

# Function to run commands in background with process tracking
run_bg() {
    local service_name="$1"
    local command="$2"
    local log_file="logs/${service_name}.log"
    
    mkdir -p logs
    echo "Starting $service_name..."
    echo "Logs: $log_file"
    
    # Run command in background and save PID
    eval "$command" > "$log_file" 2>&1 &
    local pid=$!
    echo $pid > "logs/${service_name}.pid"
    echo "  → $service_name started (PID: $pid)"
}

# Check if ports are available
check_port() {
    local port=$1
    if lsof -i:$port &>/dev/null; then
        echo "⚠️  Port $port is in use. Please stop the existing service or use a different port."
        return 1
    fi
    return 0
}

# Stop any existing services
if [ -f "logs/backend.pid" ]; then
    echo "Stopping existing backend..."
    kill $(cat logs/backend.pid) 2>/dev/null || true
    rm -f logs/backend.pid
fi

if [ -f "logs/ai-service.pid" ]; then
    echo "Stopping existing AI service..."
    kill $(cat logs/ai-service.pid) 2>/dev/null || true
    rm -f logs/ai-service.pid
fi

# Check port availability
check_port 3001 || exit 1
check_port 8000 || exit 1

# Start services
run_bg "backend" "cd backend && npm run dev"
sleep 2

run_bg "ai-service" "cd ai_service && source venv/bin/activate && uvicorn main_simple:app --reload --host 0.0.0.0 --port 8000"
sleep 2

# Start frontend if available
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    check_port 3000 && run_bg "frontend" "cd frontend && npm start"
fi

echo ""
echo "✅ All services started!"
echo "📊 Backend API: http://localhost:3001"
echo "🤖 AI Service: http://localhost:8000 (docs: http://localhost:8000/docs)"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "📋 Commands:"
echo "  View logs: tail -f logs/SERVICE.log"
echo "  Stop all: ./stop-dev.sh"
echo ""
echo "Press Ctrl+C to stop monitoring..."

# Monitor services
while true; do
    sleep 10
    
    # Check if services are still running
    for service in backend ai-service; do
        if [ -f "logs/${service}.pid" ]; then
            pid=$(cat "logs/${service}.pid")
            if ! kill -0 $pid 2>/dev/null; then
                echo "⚠️  $service stopped unexpectedly (PID: $pid)"
                rm -f "logs/${service}.pid"
            fi
        fi
    done
done
