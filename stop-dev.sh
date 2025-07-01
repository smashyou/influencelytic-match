#!/bin/bash
# Stop all development services

echo "🛑 Stopping all Influencelytic-Match services..."

for service in backend ai-service frontend; do
    if [ -f "logs/${service}.pid" ]; then
        pid=$(cat "logs/${service}.pid")
        echo "Stopping $service (PID: $pid)..."
        kill $pid 2>/dev/null && echo "  → $service stopped" || echo "  → $service was not running"
        rm -f "logs/${service}.pid"
    fi
done

# Kill any remaining processes on our ports
echo "Cleaning up any remaining processes..."
pkill -f "uvicorn.*8000" 2>/dev/null || true
pkill -f "node.*3001" 2>/dev/null || true
pkill -f "node.*3000" 2>/dev/null || true

echo "✅ All services stopped"
