# scripts/test.sh - Testing Script

#!/bin/bash

set -e

echo "🧪 Running Influencelytic-Match Tests..."

# Function to test backend
test_backend() {
    echo "📦 Testing Backend..."
    cd backend
    
    if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
        npm test
        echo "✅ Backend tests passed"
    else
        echo "⚠️  No backend tests configured"
    fi
    
    cd ..
}

# Function to test AI service
test_ai_service() {
    echo "🤖 Testing AI Service..."
    cd ai_service
    
    if [ -f "requirements.txt" ] && grep -q "pytest" requirements.txt; then
        source venv/bin/activate
        python -m pytest tests/ -v
        deactivate
        echo "✅ AI Service tests passed"
    else
        echo "⚠️  No AI service tests configured"
    fi
    
    cd ..
}

# Function to test frontend
test_frontend() {
    if [ -d "frontend" ]; then
        echo "🌐 Testing Frontend..."
        cd frontend
        
        if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
            npm test -- --watchAll=false
            echo "✅ Frontend tests passed"
        else
            echo "⚠️  No frontend tests configured"
        fi
        
        cd ..
    fi
}

# Function to run integration tests
test_integration() {
    echo "🔗 Running Integration Tests..."
    
    # Start services
    ./scripts/dev.sh &
    DEV_PID=$!
    
    # Wait for services to start
    sleep 10
    
    # Basic health checks
    echo "🏥 Running health checks..."
    
    # Test backend health
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ Backend health check passed"
    else
        echo "❌ Backend health check failed"
    fi
    
    # Test AI service health
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ AI Service health check passed"
    else
        echo "❌ AI Service health check failed"
    fi
    
    # Stop services
    kill $DEV_PID 2>/dev/null || true
    sleep 5
}

# Function to run linting
test_linting() {
    echo "🔍 Running Code Quality Checks..."
    
    # Backend linting
    cd backend
    if [ -f "package.json" ] && grep -q "\"lint\"" package.json; then
        npm run lint
        echo "✅ Backend linting passed"
    fi
    cd ..
    
    # AI Service linting
    cd ai_service
    if [ -f "requirements.txt" ] && grep -q "flake8\|black\|pylint" requirements.txt; then
        source venv/bin/activate
        flake8 . --max-line-length=100 --exclude=venv || true
        black --check . || true
        deactivate
        echo "✅ AI Service linting completed"
    fi
    cd ..
    
    # Frontend linting
    if [ -d "frontend" ]; then
        cd frontend
        if [ -f "package.json" ] && grep -q "\"lint\"" package.json; then
            npm run lint
            echo "✅ Frontend linting passed"
        fi
        cd ..
    fi
}

# Main testing function
main() {
    echo "🧪 Starting Test Suite..."
    echo "=================================================="
    
    # Check if in correct directory
    if [ ! -f "package.json" ] && [ ! -f "backend/package.json" ]; then
        echo "❌ Not in project root directory"
        exit 1
    fi
    
    test_linting
    test_backend
    test_ai_service
    test_frontend
    test_integration
    
    echo ""
    echo "🎉 All tests completed!"
    echo "=================================================="
}

# Run tests based on argument
case "${1:-all}" in
    "backend")
        test_backend
        ;;
    "ai")
        test_ai_service
        ;;
    "frontend")
        test_frontend
        ;;
    "lint")
        test_linting
        ;;
    "integration")
        test_integration
        ;;
    "all")
        main
        ;;
    *)
        echo "Usage: $0 [backend|ai|frontend|lint|integration|all]"
        exit 1
        ;;
esac
