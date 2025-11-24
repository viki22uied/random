# ============================================
# HDIMS Frontend PowerShell Setup
# ============================================

Write-Host "🎨 Starting HDIMS Frontend..." -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Yellow

# Check if frontend directory exists
$frontendDir = "../frontend"
if (-not (Test-Path "../frontend")) {
    $frontendDir = "./frontend"
    if (-not (Test-Path "./frontend")) {
        Write-Host "❌ Error: Frontend directory not found." -ForegroundColor Red
        Write-Host "   Please ensure your frontend code is in '../frontend' or './frontend' directory." -ForegroundColor Red
        exit 1
    }
}

Write-Host "📁 Frontend directory: $frontendDir" -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location $frontendDir

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found in frontend directory." -ForegroundColor Red
    Write-Host "   Please ensure this is a valid Node.js project." -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
    npm install
}

# Check if Supabase client is installed
try {
    $null = npm list @supabase/supabase-js
    Write-Host "✅ Supabase client already installed" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Supabase client..." -ForegroundColor Cyan
    npm install @supabase/supabase-js
}

Write-Host ""
Write-Host "🔗 Connecting to HDIMS Backend..." -ForegroundColor Cyan
Write-Host "   Backend URL: https://dkukdrpfbqdfbvptwhuz.supabase.co" -ForegroundColor White
Write-Host "   API Endpoints: https://dkukdrpfbqdfbvptwhuz.supabase.co/rest/v1/" -ForegroundColor White
Write-Host ""

# Copy configuration files if they don't exist
if (-not (Test-Path "src/config/backend.js") -and (Test-Path "../backend/frontend-config.js")) {
    Write-Host "📋 Copying backend configuration..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path "src/config" | Out-Null
    Copy-Item "../backend/frontend-config.js" "src/config/backend.js"
    Write-Host "   ✅ Configuration copied to src/config/backend.js" -ForegroundColor Green
}

if (-not (Test-Path "src/lib/supabase.js") -and (Test-Path "../backend/frontend-supabase-client.js")) {
    Write-Host "📋 Copying Supabase client..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path "src/lib" | Out-Null
    Copy-Item "../backend/frontend-supabase-client.js" "src/lib/supabase.js"
    Write-Host "   ✅ Supabase client copied to src/lib/supabase.js" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 HDIMS Frontend is ready!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Yellow
Write-Host "🔧 Available Commands:" -ForegroundColor Cyan
Write-Host "   - Development server: npm run dev" -ForegroundColor White
Write-Host "   - Build for production: npm run build" -ForegroundColor White
Write-Host "   - Run tests: npm test" -ForegroundColor White
Write-Host "   - Lint code: npm run lint" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Frontend will be available at:" -ForegroundColor Cyan
Write-Host "   - Development: http://localhost:3000 (or as configured)" -ForegroundColor White
Write-Host "   - Production: After running npm run build" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Backend Connection:" -ForegroundColor Cyan
Write-Host "   - Supabase URL: https://dkukdrpfbqdfbvptwhuz.supabase.co" -ForegroundColor White
Write-Host "   - Auth: https://dkukdrpfbqdfbvptwhuz.supabase.co/auth/v1/" -ForegroundColor White
Write-Host "   - API: https://dkukdrpfbqdfbvptwhuz.supabase.co/rest/v1/" -ForegroundColor White
Write-Host ""
Write-Host "📚 Usage Examples:" -ForegroundColor Cyan
Write-Host "   import { supabase, auth, db } from './src/lib/supabase.js';" -ForegroundColor Gray
Write-Host "   const { user } = await auth.getCurrentUser();" -ForegroundColor Gray
Write-Host "   const { data } = await db.select('performance_data');" -ForegroundColor Gray
Write-Host ""

# Check if there's a dev script
$packageJson = Get-Content "package.json" | ConvertFrom-Json
if ($packageJson.scripts.PSObject.Properties.Name -contains "dev") {
    Write-Host "🚀 Starting development server..." -ForegroundColor Green
    Write-Host "   Press Ctrl+C to stop the frontend server" -ForegroundColor Yellow
    Write-Host "   Keep this terminal open for frontend development" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
} else {
    Write-Host "⚠️  No 'dev' script found in package.json" -ForegroundColor Yellow
    Write-Host "   Available scripts:" -ForegroundColor Cyan
    npm run
    Write-Host ""
    Write-Host "🔧 To start frontend manually:" -ForegroundColor Cyan
    Write-Host "   npm start  (or your framework's start command)" -ForegroundColor White
}
