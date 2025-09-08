#!/bin/bash

# Apply Migrations Script for Influencelytic-Match
# This script applies database migrations to Supabase

set -e

echo "🚀 Starting database migration process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI is not installed.${NC}"
    echo "Please install it from: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Directory containing migrations
MIGRATIONS_DIR="./supabase/migrations"

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}❌ Migrations directory not found at $MIGRATIONS_DIR${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will modify your database schema.${NC}"
echo "Make sure you have:"
echo "1. Backed up your database"
echo "2. Set up your Supabase project"
echo "3. Configured your local Supabase CLI"
echo ""
read -p "Do you want to continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 0
fi

# Apply migrations in order
echo -e "${GREEN}📦 Applying migrations...${NC}"

for migration in $(ls $MIGRATIONS_DIR/*.sql | sort); do
    filename=$(basename "$migration")
    echo -e "${YELLOW}→ Applying $filename...${NC}"
    
    # Apply the migration using Supabase CLI
    supabase db push --file "$migration"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $filename applied successfully${NC}"
    else
        echo -e "${RED}❌ Failed to apply $filename${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✨ All migrations applied successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Generate TypeScript types: npm run supabase:types"
echo "2. Test the new tables in Supabase Dashboard"
echo "3. Update your application code to use the new schema"