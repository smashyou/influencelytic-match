#!/bin/bash
# Test all services are working

echo "🧪 Testing Influencelytic-Match services..."

test_service() {
    local service=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $service ($url)... "
    
    if response=$(curl -s "$url" 2>/dev/null); then
        if echo "$response" | grep -q "$expected"; then
            echo "✅ OK"
            return 0
        else
            echo "❌ Unexpected response"
            echo "Response: $response"
            return 1
        fi
    else
        echo "❌ Connection failed"
        return 1
    fi
}

# Test services
test_service "Backend API" "http://localhost:3001/health" "status"
test_service "AI Service" "http://localhost:8000/health" "healthy"

if [ -d "frontend" ]; then
    test_service "Frontend" "http://localhost:3000" "html"
fi

echo ""
echo "🔗 Service URLs:"
echo "  Backend: http://localhost:3001"
echo "  AI Service: http://localhost:8000/docs"
echo "  Frontend: http://localhost:3000"
