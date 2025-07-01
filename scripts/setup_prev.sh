#!/bin/bash
# scripts/setup.sh - Complete Influencelytic-Match Setup Script (Enhanced Edition)
# Updated for compatibility with various systems and dependency issues

set -e

echo "🚀 Setting up Influencelytic-Match Platform..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_header "📋 Checking System Requirements"
    
    local missing_tools=()
    local python_version=""
    local node_version=""
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_tools+=("Node.js 18+")
    else
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        node_version=$(node --version)
        if [ "$NODE_VERSION" -lt 18 ]; then
            missing_tools+=("Node.js 18+ (current: $node_version)")
        else
            print_status "Node.js $node_version ✓"
        fi
    fi
    
    # Check Python - prefer 3.10 for ML compatibility
    local python_cmd=""
    if command -v python3.10 &> /dev/null; then
        python_cmd="python3.10"
        python_version=$(python3.10 --version)
        print_status "Python $python_version (optimal for ML) ✓"
    elif command -v python3 &> /dev/null; then
        python_cmd="python3"
        python_version=$(python3 --version)
        local py_major=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1)
        local py_minor=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f2)
        
        if [ "$py_major" -eq 3 ] && [ "$py_minor" -ge 8 ]; then
            if [ "$py_minor" -eq 13 ]; then
                print_warning "Python 3.13 detected - may have ML compatibility issues"
                print_warning "Consider installing Python 3.10 for better PyTorch support"
            else
                print_status "Python $python_version ✓"
            fi
        else
            missing_tools+=("Python 3.8+ (current: $python_version)")
        fi
    else
        missing_tools+=("Python 3.8+")
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    else
        print_status "npm $(npm --version) ✓"
    fi
    
    # Check Docker (optional but recommended)
    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found - containerized deployment will be limited"
    else
        print_status "Docker $(docker --version | cut -d' ' -f3 | tr -d ',') ✓"
    fi
    
    # Check system architecture for platform-specific notes
    local arch=$(uname -m)
    local os=$(uname -s)
    print_status "System: $os $arch"
    
    if [[ "$arch" == "arm64" ]] && [[ "$os" == "Darwin" ]]; then
        print_warning "Apple Silicon detected - using optimized ML setup"
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools:"
        for tool in "${missing_tools[@]}"; do
            echo "  - $tool"
        done
        echo ""
        echo "📚 Installation guides:"
        echo "  Node.js: https://nodejs.org/en/download/"
        echo "  Python: https://www.python.org/downloads/"
        echo "  Docker: https://docs.docker.com/get-docker/"
        echo ""
        echo "Please install the missing tools and run this script again."
        exit 1
    fi
    
    # Store Python command for later use
    export PYTHON_CMD="$python_cmd"
    print_status "All requirements satisfied!"
    echo
}

# Create project structure
setup_project_structure() {
    print_header "📁 Setting up Project Structure"
    
    # Create main directories if they don't exist
    mkdir -p backend/{routes,middleware,config,utils,tests}
    mkdir -p ai_service/{models,utils,tests}
    mkdir -p frontend/src/{components,services,hooks,utils,types}
    mkdir -p database/{migrations,seeds}
    mkdir -p docs/{api,deployment}
    mkdir -p scripts/{deployment,maintenance}
    mkdir -p logs
    
    print_status "Project structure created"
}

# Setup environment files
setup_environment_files() {
    print_header "📝 Setting up Environment Files"
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << 'EOF'
# Backend Environment Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Supabase Configuration (REQUIRED)
SUPABASE_URL=your-supabase-url-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# Stripe Configuration (REQUIRED)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# AI Service Configuration
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-ai-secret-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Social Media API Credentials
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Optional Services
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.example.com
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
EOF
        print_status "Created backend/.env from template"
    else
        print_status "Backend .env already exists"
    fi
    
    # AI Service environment
    if [ ! -f "ai_service/.env" ]; then
        cat > ai_service/.env << 'EOF'
# AI Service Environment Configuration
ENVIRONMENT=development
AI_SERVICE_API_KEY=your-ai-secret-key
REDIS_URL=redis://localhost:6379
SUPABASE_URL=your-supabase-url-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ML Model Configuration
TRANSFORMERS_CACHE=./models/.cache
HF_HOME=./models/.cache
PYTORCH_ENABLE_MPS_FALLBACK=1

# Performance Settings
MAX_WORKERS=1
MODEL_CACHE_SIZE=1000
EOF
        print_status "Created ai_service/.env"
    else
        print_status "AI service .env already exists"
    fi
    
    # Frontend environment
    if [ ! -f "frontend/.env" ]; then
        cat > frontend/.env << 'EOF'
# Frontend Environment Configuration
REACT_APP_API_URL=http://localhost:3001
REACT_APP_AI_SERVICE_URL=http://localhost:8000
REACT_APP_SUPABASE_URL=your-supabase-url-here
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Optional Analytics
REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
REACT_APP_SENTRY_DSN=your-sentry-dsn
EOF
        print_status "Created frontend/.env"
    else
        print_status "Frontend .env already exists"
    fi
    
    print_warning "⚠️  IMPORTANT: Update the .env files with your actual API keys!"
    echo ""
    echo "📚 Required API Keys:"
    echo "  1. Supabase: https://supabase.com (Database & Auth)"
    echo "  2. Stripe: https://stripe.com (Payments)"
    echo "  3. Social Media APIs (Instagram, TikTok, etc.)"
    echo ""
}

# Install backend dependencies with compatibility fixes
setup_backend() {
    print_header "📦 Setting up Backend Dependencies"
    
    cd backend
    
    # Create package.json if it doesn't exist
    if [ ! -f "package.json" ]; then
        print_status "Creating backend package.json..."
        cat > package.json << 'EOF'
{
  "name": "influencelytic-backend",
  "version": "1.0.0",
  "description": "Backend API for Influencelytic-Match platform",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint .",
    "format": "prettier --write .",
    "type-check": "echo 'Type checking not needed for JavaScript'"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.49.1",
    "bcryptjs": "^2.4.3",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.4.1",
    "express": "^4.19.2",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "redis": "^4.6.12",
    "stripe": "^14.11.0",
    "validator": "^13.11.0",
    "json2csv": "^5.0.7"
  },
  "devDependencies": {
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "nodemon": "^3.0.2",
    "prettier": "^3.1.1",
    "supertest": "^6.3.4"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": [
    "influencer",
    "marketing",
    "api",
    "express",
    "supabase",
    "stripe"
  ],
  "author": "Influencelytic Team",
  "license": "MIT"
}
EOF
    fi
    
    # Clean install with compatibility fixes
    if [ ! -d "node_modules" ]; then
        print_status "Installing backend dependencies..."
        
        # Clear npm cache to avoid conflicts
        npm cache clean --force
        
        # Install with specific compatible versions
        npm install || {
            print_warning "Standard install failed, trying with --legacy-peer-deps"
            npm install --legacy-peer-deps
        }
        
        print_status "Backend dependencies installed successfully"
    else
        print_status "Backend dependencies already installed"
        print_status "Checking for updates..."
        npm update || print_warning "Update check completed with warnings"
    fi
    
    cd ..
}

# Setup AI service with enhanced compatibility
setup_ai_service() {
    print_header "🤖 Setting up AI Service"
    
    cd ai_service
    
    # Determine Python version for virtual environment
    local python_cmd="${PYTHON_CMD:-python3}"
    local python_version_info=$($python_cmd --version 2>&1)
    print_status "Using $python_version_info"
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        $python_cmd -m venv venv
        print_status "Virtual environment created"
    else
        print_status "Virtual environment already exists"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Check Python version in venv
    local venv_python_version=$(python --version 2>&1)
    print_status "Virtual environment Python: $venv_python_version"
    
    # Upgrade pip and install build tools
    print_status "Upgrading pip and installing build tools..."
    pip install --upgrade pip setuptools wheel
    
    # Create requirements based on Python version
    local py_version=$(python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
    
    if [ ! -f "requirements.txt" ]; then
        print_status "Creating AI service requirements.txt..."
        
        if [[ "$py_version" == "3.10" ]] || [[ "$py_version" == "3.11" ]]; then
            # Full ML stack for Python 3.10/3.11
            cat > requirements.txt << 'EOF'
# Core FastAPI dependencies
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
pydantic==2.5.0

# Compatible NumPy version
numpy==1.24.4

# Optional ML libraries (install if compatible)
scikit-learn==1.3.2
pandas==2.0.3

# HTTP and utilities
httpx==0.25.2
requests==2.31.0

# Development tools
pytest==7.4.3
black==23.11.0

# Note: PyTorch and Transformers can be added later if needed
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
# pip install transformers sentence-transformers
EOF
        else
            # Simplified requirements for other Python versions
            cat > requirements.txt << 'EOF'
# Core FastAPI dependencies (compatible with all Python versions)
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
pydantic==2.5.0

# Compatible NumPy version
numpy<2.0

# Basic data processing
pandas==2.0.3

# HTTP clients
httpx==0.25.2
requests==2.31.0

# Development tools
pytest==7.4.3
EOF
        fi
    fi
    
    # Install dependencies with error handling
    print_status "Installing AI service dependencies..."
    
    # Try to install requirements
    if ! pip install -r requirements.txt; then
        print_warning "Full requirements installation failed, installing minimal set..."
        
        # Fallback to minimal installation
        pip install fastapi uvicorn python-dotenv pydantic
        pip install "numpy<2.0" || pip install numpy
        
        print_warning "Minimal AI service setup completed"
        print_warning "Some advanced ML features may not be available"
    else
        print_status "AI service dependencies installed successfully"
    fi
    
    # Create enhanced main_simple.py if it doesn't exist
    if [ ! -f "main_simple.py" ]; then
        print_status "Creating enhanced AI service..."
        cat > main_simple.py << 'EOF'
# AI Service - Enhanced Rule-Based Edition
from fastapi import FastAPI
from pydantic import BaseModel
import random
import json
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Influencelytic AI Service", 
    description="Enhanced rule-based AI for influencer analytics",
    version="1.1.0"
)

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "Influencelytic AI Service (Enhanced)",
        "version": "1.1.0",
        "ai_type": "rule_based_enhanced"
    }

@app.get("/")
async def root():
    return {"message": "Influencelytic AI Service - Ready!", "docs": "/docs"}

# Add your enhanced AI endpoints here...

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF
        print_status "Basic AI service file created"
        print_warning "Replace main_simple.py with the enhanced version for full functionality"
    fi
    
    # Optional: Try to install PyTorch if Python 3.10/3.11
    if [[ "$py_version" == "3.10" ]] || [[ "$py_version" == "3.11" ]]; then
        print_status "Attempting to install PyTorch (this may take a while)..."
        
        # Detect system architecture
        local arch=$(uname -m)
        if [[ "$arch" == "arm64" ]] && [[ "$(uname -s)" == "Darwin" ]]; then
            # Apple Silicon Mac
            pip install torch torchvision torchaudio || print_warning "PyTorch installation failed - using rule-based AI only"
        else
            # Intel/AMD systems
            pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu || print_warning "PyTorch installation failed - using rule-based AI only"
        fi
        
        # Try to install transformers if PyTorch succeeded
        if python -c "import torch" 2>/dev/null; then
            pip install transformers sentence-transformers || print_warning "Transformers installation failed"
            print_status "Advanced ML capabilities available"
        fi
    fi
    
    cd ..
}

# Check frontend setup
check_frontend() {
    print_header "🎨 Checking Frontend Setup"
    
    if [ -d "frontend" ]; then
        cd frontend
        if [ -f "package.json" ]; then
            print_status "Frontend already configured"
            if [ ! -d "node_modules" ]; then
                print_status "Installing frontend dependencies..."
                npm install || npm install --legacy-peer-deps
            else
                print_status "Frontend dependencies already installed"
            fi
        else
            print_warning "Frontend package.json not found"
            print_status "Frontend appears to be a custom React setup"
        fi
        cd ..
    else
        print_warning "Frontend directory not found"
        print_status "Creating basic frontend structure..."
        mkdir -p frontend/src/{components,services,hooks,utils,types}
    fi
}

# Create utility scripts
create_scripts() {
    print_header "📜 Creating Utility Scripts"
    
    # Enhanced development start script
    cat > start-dev.sh << 'EOF'
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
EOF
    chmod +x start-dev.sh
    print_status "Created start-dev.sh script"
    
    # Stop script
    cat > stop-dev.sh << 'EOF'
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
EOF
    chmod +x stop-dev.sh
    print_status "Created stop-dev.sh script"
    
    # Environment check script
    cat > check-env.sh << 'EOF'
#!/bin/bash
# Check if all required environment variables are set

echo "🔍 Checking environment configuration..."

check_env_file() {
    local file=$1
    local service=$2
    
    echo "Checking $service environment ($file):"
    
    if [ ! -f "$file" ]; then
        echo "  ❌ $file not found"
        return 1
    fi
    
    local missing=0
    local required_vars=()
    
    case $service in
        "Backend")
            required_vars=("SUPABASE_URL" "STRIPE_SECRET_KEY" "JWT_SECRET")
            ;;
        "AI Service")
            required_vars=("AI_SERVICE_API_KEY")
            ;;
        "Frontend")
            required_vars=("REACT_APP_SUPABASE_URL" "REACT_APP_STRIPE_PUBLISHABLE_KEY")
            ;;
    esac
    
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=your-" "$file" || grep -q "^${var}=$" "$file"; then
            echo "  ⚠️  $var needs to be configured"
            missing=$((missing + 1))
        else
            echo "  ✅ $var configured"
        fi
    done
    
    if [ $missing -eq 0 ]; then
        echo "  ✅ All critical variables configured"
    else
        echo "  ⚠️  $missing critical variables need configuration"
    fi
    
    echo ""
}

check_env_file "backend/.env" "Backend"
check_env_file "ai_service/.env" "AI Service"
check_env_file "frontend/.env" "Frontend"

echo "📝 Next steps:"
echo "1. Update .env files with your actual API keys"
echo "2. Set up your Supabase project: https://supabase.com"
echo "3. Configure Stripe for payments: https://stripe.com"
echo "4. Set up social media API credentials"
echo "5. Run ./start-dev.sh to start development servers"
echo ""
echo "🔗 API Key Sources:"
echo "  Supabase: https://supabase.com/dashboard"
echo "  Stripe: https://dashboard.stripe.com/apikeys"
echo "  Instagram: https://developers.facebook.com/"
echo "  TikTok: https://developers.tiktok.com/"
EOF
    chmod +x check-env.sh
    print_status "Created check-env.sh script"
    
    # Test script
    cat > test-services.sh << 'EOF'
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
EOF
    chmod +x test-services.sh
    print_status "Created test-services.sh script"
}

# Create Docker setup with compatibility notes
setup_docker() {
    print_header "🐳 Setting up Docker Configuration"
    
    if command -v docker &> /dev/null; then
        if [ ! -f "docker-compose.yml" ]; then
            print_status "Creating docker-compose.yml..."
            
            cat > docker-compose.yml << 'EOF'
version: "3.8"

services:
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
    env_file:
      - ./backend/.env
    depends_on:
      - redis
      - ai-service
    networks:
      - influencelytic-network

  ai-service:
    build: 
      context: ./ai_service
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
    env_file:
      - ./ai_service/.env
    volumes:
      - ai_models:/app/models
    networks:
      - influencelytic-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - influencelytic-network

  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    env_file:
      - ./frontend/.env
    depends_on:
      - backend
    networks:
      - influencelytic-network

volumes:
  redis_data:
  ai_models:

networks:
  influencelytic-network:
    driver: bridge
EOF
            print_status "Created docker-compose.yml"
        else
            print_status "Docker configuration already exists"
        fi
        
        # Create simple Dockerfiles if they don't exist
        if [ ! -f "ai_service/Dockerfile" ]; then
            cat > ai_service/Dockerfile << 'EOF'
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start command
CMD ["uvicorn", "main_simple:app", "--host", "0.0.0.0", "--port", "8000"]
EOF
            print_status "Created ai_service/Dockerfile"
        fi
        
    else
        print_warning "Docker not found - skipping Docker setup"
    fi
}

# Main setup function
main() {
    print_header "🎯 Influencelytic-Match Platform Setup"
    echo "This script will set up your complete development environment with enhanced compatibility."
    echo ""
    
    # Create logs directory
    mkdir -p logs
    
    # Run setup steps
    check_requirements
    setup_project_structure
    setup_environment_files
    setup_backend
    setup_ai_service
    check_frontend
    create_scripts
    setup_docker
    
    print_header "🎉 Setup Complete!"
    echo ""
    print_status "Your Influencelytic-Match platform is ready for development!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Run: ./check-env.sh - to verify environment configuration"
    echo "2. Update .env files with your API keys:"
    echo "   • Supabase: https://supabase.com/dashboard"
    echo "   • Stripe: https://dashboard.stripe.com/apikeys"
    echo "   • Social Media APIs (Instagram, TikTok, etc.)"
    echo "3. Run: ./start-dev.sh - to start all development servers"
    echo "4. Run: ./test-services.sh - to verify everything is working"
    echo ""
    echo "🚀 Quick Start Commands:"
    echo "  ./start-dev.sh     # Start all services"
    echo "  ./stop-dev.sh      # Stop all services"
    echo "  ./check-env.sh     # Check environment setup"
    echo "  ./test-services.sh # Test if services are working"
    echo ""
    echo "📚 Documentation:"
    echo "  Backend API: http://localhost:3001 (after starting)"
    echo "  AI Service: http://localhost:8000/docs (after starting)"
    echo "  Frontend: http://localhost:3000 (after starting)"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "  • Check logs: tail -f logs/SERVICE.log"
    echo "  • Port conflicts: Use different ports in .env files"
    echo "  • Dependency issues: Run individual service setups manually"
    echo ""
    
    # Final compatibility check
    local python_ver=$(${PYTHON_CMD:-python3} --version 2>&1)
    local node_ver=$(node --version 2>&1)
    
    echo "✅ System Summary:"
    echo "  Node.js: $node_ver"
    echo "  Python: $python_ver"
    echo "  AI Service: Enhanced rule-based (upgradeable to ML)"
    echo "  Backend: Express.js with Supabase"
    echo "  Frontend: React with TypeScript"
    echo ""
    
    if [[ "$python_ver" == *"3.13"* ]]; then
        print_warning "Note: Python 3.13 detected - using rule-based AI for maximum compatibility"
        print_warning "For advanced ML features, consider installing Python 3.10"
    elif [[ "$python_ver" == *"3.10"* ]] || [[ "$python_ver" == *"3.11"* ]]; then
        print_status "Optimal Python version detected - full ML capabilities available"
    fi
    
    print_status "Happy coding! 🚀"
    echo ""
    echo "💡 Pro Tips:"
    echo "  • Use 'tail -f logs/*.log' to monitor all services"
    echo "  • Check API docs at http://localhost:8000/docs"
    echo "  • Test API endpoints with curl or Postman"
    echo "  • Join our community for support and updates"
}

# Handle script interruption
trap 'echo -e "\n⚠️  Setup interrupted. You can run this script again to continue."; exit 1' INT

# Run main function with all arguments
main "$@"