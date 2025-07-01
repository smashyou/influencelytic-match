# scripts/deploy.sh - Deployment Script

#!/bin/bash

set -e

ENVIRONMENT=${1:-staging}
echo "🚀 Deploying Influencelytic-Match to $ENVIRONMENT..."

# Function to build Docker images
build_images() {
    echo "🏗️  Building Docker images..."
    
    # Build backend
    docker build -t influencelytic-backend:latest ./backend
    echo "✅ Backend image built"
    
    # Build AI service
    docker build -t influencelytic-ai:latest ./ai_service
    echo "✅ AI service image built"
    
    # Build frontend
    docker build -t influencelytic-frontend:latest ./frontend
    echo "✅ Frontend image built"
}

# Function to deploy to staging
deploy_staging() {
    echo "📦 Deploying to staging environment..."
    
    # Use docker-compose for staging
    docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
    
    echo "✅ Staging deployment completed"
    echo "🔗 Staging URL: https://staging.influencelytic.com"
}

# Function to deploy to production
deploy_production() {
    echo "🚨 Deploying to PRODUCTION environment..."
    
    # Confirmation prompt
    read -p "Are you sure you want to deploy to production? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Production deployment cancelled"
        exit 1
    fi
    
    # Create backup
    echo "💾 Creating backup..."
    timestamp=$(date +"%Y%m%d_%H%M%S")
    kubectl create backup production-backup-$timestamp || true
    
    # Deploy with zero downtime
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale backend=3
    
    echo "✅ Production deployment completed"
    echo "🔗 Production URL: https://influencelytic.com"
}

# Function to run health checks
health_check() {
    echo "🏥 Running post-deployment health checks..."
    
    local base_url
    if [ "$ENVIRONMENT" = "production" ]; then
        base_url="https://influencelytic.com"
    else
        base_url="https://staging.influencelytic.com"
    fi
    
    # Wait for services to be ready
    sleep 30
    
    # Check backend health
    if curl -f $base_url/api/health > /dev/null 2>&1; then
        echo "✅ Backend health check passed"
    else
        echo "❌ Backend health check failed"
        exit 1
    fi
    
    # Check AI service health
    if curl -f $base_url/ai/health > /dev/null 2>&1; then
        echo "✅ AI service health check passed"
    else
        echo "❌ AI service health check failed"
        exit 1
    fi
    
    echo "✅ All health checks passed"
}

# Function to rollback deployment
rollback() {
    echo "🔄 Rolling back deployment..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Rollback production
        kubectl rollout undo deployment/influencelytic-backend
        kubectl rollout undo deployment/influencelytic-ai
        kubectl rollout undo deployment/influencelytic-frontend
    else
        # Rollback staging
        docker-compose -f docker-compose.yml -f docker-compose.staging.yml down
        docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d --scale backend=1
    fi
    
    echo "✅ Rollback completed"
}

# Main deployment function
main() {
    echo "🚀 Starting deployment process..."
    echo "=================================================="
    echo "Environment: $ENVIRONMENT"
    echo "Timestamp: $(date)"
    echo "=================================================="
    
    # Pre-deployment checks
    if [ ! -f "docker-compose.yml" ]; then
        echo "❌ docker-compose.yml not found"
        exit 1
    fi
    
    # Run tests before deployment
    echo "🧪 Running pre-deployment tests..."
    ./scripts/test.sh lint
    
    # Build images
    build_images
    
    # Deploy based on environment
    case "$ENVIRONMENT" in
        "staging")
            deploy_staging
            ;;
        "production")
            deploy_production
            ;;
        *)
            echo "❌ Invalid environment: $ENVIRONMENT"
            echo "Usage: $0 [staging|production]"
            exit 1
            ;;
    esac
    
    # Health checks
    health_check
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "=================================================="
    echo "Environment: $ENVIRONMENT"
    echo "Status: ✅ DEPLOYED"
    echo "Time: $(date)"
    echo ""
}

# Handle rollback command
if [ "$1" = "rollback" ]; then
    rollback
    exit 0
fi

# Run main deployment
main
