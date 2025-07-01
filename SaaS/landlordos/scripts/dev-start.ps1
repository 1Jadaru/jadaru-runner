# LandlordOS Development Environment Launcher
# Run this from the project root directory

Write-Host ""
Write-Host "==========================================="
Write-Host " 🏠 LandlordOS Development Environment"
Write-Host "==========================================="
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "Expected location: c:\Users\rutte\OneDrive\jadaru.co\SaaS\landlordos" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "📦 Installing dependencies (if needed)..." -ForegroundColor Blue
npm run install:all

Write-Host ""
Write-Host "🚀 Starting API Server (Port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "⏳ Waiting for API server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🎨 Starting React Frontend (Port 5173+)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Development environment started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your application will be available at:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173 (or next available port)" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   Health:   http://localhost:5000/health" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Demo Login:" -ForegroundColor Cyan
Write-Host "   Email:    demo@landlordos.com" -ForegroundColor White
Write-Host "   Password: demo123" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation: README.md and HOW_TO_RUN.md" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to close this window"
