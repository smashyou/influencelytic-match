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
