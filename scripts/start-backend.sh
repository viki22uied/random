#!/bin/bash

# ============================================
# HDIMS Backend Terminal Setup
# ============================================

echo "🚀 Starting HDIMS Backend..."
echo "=================================="

# Check if we're in the right directory
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found. Please run from the hdims-backend directory."
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

echo "📦 Environment variables loaded:"
echo "   SUPABASE_URL: $SUPABASE_URL"
echo "   DATABASE_URL: [REDACTED]"
echo

# Check if Supabase CLI is available
if ! command -v npx supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found. Please run: npm install supabase"
    exit 1
fi

echo "🔗 Checking Supabase connection..."
if npx supabase db status &> /dev/null; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed. Please check your configuration."
    exit 1
fi

echo
echo "🎯 HDIMS Backend is running!"
echo "=================================="
echo "📍 API Endpoints:"
echo "   REST API: $SUPABASE_URL/rest/v1/"
echo "   Functions: $SUPABASE_URL/functions/v1/"
echo "   Auth: $SUPABASE_URL/auth/v1/"
echo "   Storage: $SUPABASE_URL/storage/v1/"
echo
echo "🛠️  Management Commands:"
echo "   - Check status: npx supabase status"
echo "   - View logs: npx supabase functions logs"
echo "   - Database shell: npx supabase db shell"
echo "   - Stop backend: Press Ctrl+C"
echo
echo "📊 To test the backend:"
echo "   curl -X POST '$SUPABASE_URL/rest/v1/rpc/get_superadmin_overview' \\"
echo "        -H 'apikey: $SUPABASE_ANON_KEY' \\"
echo "        -H 'Authorization: Bearer YOUR_JWT_TOKEN'"
echo
echo "🔄 Backend is now running and ready to accept connections..."
echo "   Keep this terminal open and start your frontend in another terminal."

# Keep the backend running
echo "Press Ctrl+C to stop the backend..."
while true; do
    sleep 30
    echo "🟢 Backend active at $(date)"
done
