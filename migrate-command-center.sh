#!/bin/bash

# Migration script for Command Center APIs
# Run this once database connection is available

set -e

echo "🔧 Command Center Database Migration"
echo "======================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set in environment"
  echo "   Loading from .env file..."
  export $(cat .env | grep DATABASE_URL | xargs)
fi

echo "📊 Database: ${DATABASE_URL%\?*}"  # Hide connection params
echo ""

# Test database connection
echo "🔌 Testing database connection..."
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
  echo "✅ Database connection successful"
else
  echo "❌ Cannot connect to database"
  echo ""
  echo "Options:"
  echo "  1. Verify DATABASE_URL in .env or your shell"
  echo "  2. Run locally: npx prisma migrate dev"
  echo "  3. Deploy to Vercel after the database is reachable from production"
  exit 1
fi

echo ""
echo "🚀 Running migration..."
npx prisma migrate dev --name add_command_center_models

echo ""
echo "✅ Migration complete!"
echo ""
echo "📝 New tables created:"
echo "   - ActivityEvent (agent activity tracking)"
echo "   - ActiveWork (current tasks/builds)"
echo ""
echo "🧪 Test the endpoints:"
echo "   npm run dev"
echo "   curl http://localhost:3000/api/activity/stream"
echo "   curl http://localhost:3000/api/command/execute -X POST -H 'Content-Type: application/json' -d '{\"command\":\"test\"}'"
echo "   curl http://localhost:3000/api/work/active"
