#!/bin/bash

# ============================================
# HDIMS Frontend Terminal Setup
# ============================================

echo "🎨 Starting HDIMS Frontend..."
echo "=================================="

# Check if frontend directory exists
if [ ! -d "../frontend" ] && [ ! -d "frontend" ]; then
    echo "❌ Error: Frontend directory not found."
    echo "   Please ensure your frontend code is in '../frontend' or './frontend' directory."
    exit 1
fi

# Determine frontend directory
FRONTEND_DIR="../frontend"
if [ ! -d "../frontend" ]; then
    FRONTEND_DIR="./frontend"
fi

echo "📁 Frontend directory: $FRONTEND_DIR"

# Navigate to frontend directory
cd "$FRONTEND_DIR"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in frontend directory."
    echo "   Please ensure this is a valid Node.js project."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check if Supabase client is installed
if ! npm list @supabase/supabase-js &> /dev/null; then
    echo "📦 Installing Supabase client..."
    npm install @supabase/supabase-js
fi

echo
echo "🔗 Connecting to HDIMS Backend..."
echo "   Backend URL: https://dkukdrpfbqdfbvptwhuz.supabase.co"
echo "   API Endpoints: https://dkukdrpfbqdfbvptwhuz.supabase.co/rest/v1/"
echo

# Copy configuration files if they don't exist
if [ ! -f "src/config/backend.js" ] && [ -f "../backend/frontend-config.js" ]; then
    echo "📋 Copying backend configuration..."
    mkdir -p src/config
    cp ../backend/frontend-config.js src/config/
    echo "   ✅ Configuration copied to src/config/backend.js"
fi

if [ ! -f "src/lib/supabase.js" ] && [ -f "../backend/frontend-supabase-client.js" ]; then
    echo "📋 Copying Supabase client..."
    mkdir -p src/lib
    cp ../backend/frontend-supabase-client.js src/lib/
    echo "   ✅ Supabase client copied to src/lib/supabase.js"
fi

echo
echo "🎯 HDIMS Frontend is ready!"
echo "=================================="
echo "🔧 Available Commands:"
echo "   - Development server: npm run dev"
echo "   - Build for production: npm run build"
echo "   - Run tests: npm test"
echo "   - Lint code: npm run lint"
echo
echo "🌐 Frontend will be available at:"
echo "   - Development: http://localhost:3000 (or as configured)"
echo "   - Production: After running npm run build"
echo
echo "🔗 Backend Connection:"
echo "   - Supabase URL: https://dkukdrpfbqdfbvptwhuz.supabase.co"
echo "   - Auth: https://dkukdrpfbqdfbvptwhuz.supabase.co/auth/v1/"
echo "   - API: https://dkukdrpfbqdfbvptwhuz.supabase.co/rest/v1/"
echo
echo "📚 Usage Examples:"
echo "   import { supabase, auth, db } from './src/lib/supabase.js';"
echo "   const { user } = await auth.getCurrentUser();"
echo "   const { data } = await db.select('performance_data');"
echo

# Check if there's a dev script
if npm run | grep -q "dev"; then
    echo "🚀 Starting development server..."
    echo "   Press Ctrl+C to stop the frontend server"
    echo "   Keep this terminal open for frontend development"
    echo
    npm run dev
else
    echo "⚠️  No 'dev' script found in package.json"
    echo "   Available scripts:"
    npm run
    echo
    echo "🔧 To start frontend manually:"
    echo "   npm start  (or your framework's start command)"
fi
