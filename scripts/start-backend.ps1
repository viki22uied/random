# ============================================
# HDIMS Backend PowerShell Setup
# ============================================

Write-Host "🚀 Starting HDIMS Backend..." -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Yellow

# Check if we're in the right directory
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found. Please run from the hdims-backend directory." -ForegroundColor Red
    exit 1
}

# Load environment variables
Get-Content ".env" | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

Write-Host "📦 Environment variables loaded:" -ForegroundColor Cyan
Write-Host "   SUPABASE_URL: $env:SUPABASE_URL" -ForegroundColor White
Write-Host "   DATABASE_URL: [REDACTED]" -ForegroundColor White
Write-Host ""

# Check if Supabase CLI is available
try {
    $null = npx supabase --version
    Write-Host "✅ Supabase CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Supabase CLI not found. Please run: npm install supabase" -ForegroundColor Red
    exit 1
}

Write-Host "🔗 Checking Supabase connection..." -ForegroundColor Cyan
try {
    $null = npx supabase db status
    Write-Host "✅ Database connection successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Database connection failed. Please check your configuration." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎯 HDIMS Backend is running!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Yellow
Write-Host "📍 API Endpoints:" -ForegroundColor Cyan
Write-Host "   REST API: $env:SUPABASE_URL/rest/v1/" -ForegroundColor White
Write-Host "   Functions: $env:SUPABASE_URL/functions/v1/" -ForegroundColor White
Write-Host "   Auth: $env:SUPABASE_URL/auth/v1/" -ForegroundColor White
Write-Host "   Storage: $env:SUPABASE_URL/storage/v1/" -ForegroundColor White
Write-Host ""
Write-Host "🛠️  Management Commands:" -ForegroundColor Cyan
Write-Host "   - Check status: npx supabase status" -ForegroundColor White
Write-Host "   - View logs: npx supabase functions logs" -ForegroundColor White
Write-Host "   - Database shell: npx supabase db shell" -ForegroundColor White
Write-Host "   - Stop backend: Press Ctrl+C" -ForegroundColor White
Write-Host ""
Write-Host "📊 To test the backend:" -ForegroundColor Cyan
Write-Host "   curl -X POST '$env:SUPABASE_URL/rest/v1/rpc/get_superadmin_overview' \" -ForegroundColor Gray
Write-Host "        -H 'apikey: $env:SUPABASE_ANON_KEY' \" -ForegroundColor Gray
Write-Host "        -H 'Authorization: Bearer YOUR_JWT_TOKEN'" -ForegroundColor Gray
Write-Host ""
Write-Host "🔄 Backend is now running and ready to accept connections..." -ForegroundColor Green
Write-Host "   Keep this terminal open and start your frontend in another terminal." -ForegroundColor Yellow

# Keep the backend running with status updates
Write-Host "Press Ctrl+C to stop the backend..." -ForegroundColor Yellow
while ($true) {
    Write-Host "🟢 Backend active at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
    Start-Sleep -Seconds 30
}
