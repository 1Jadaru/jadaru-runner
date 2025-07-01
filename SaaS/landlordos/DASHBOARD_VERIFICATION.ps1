# Enhanced Dashboard Verification Script
# Run this script to verify the enhanced dashboard functionality

Write-Host "🚀 LandlordOS Enhanced Dashboard Verification" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Test backend connectivity
Write-Host "`n1. Testing Backend Connectivity..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri 'http://localhost:5000/health' -Method GET -TimeoutSec 5
    Write-Host "✅ Backend server is responding" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server is not responding. Please start the backend server." -ForegroundColor Red
    Write-Host "   Command: Set-Location server; npm run dev" -ForegroundColor Cyan
    exit 1
}

# Test authentication
Write-Host "`n2. Testing Authentication..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = 'demo@landlordos.com'
        password = 'demo123'
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method POST -Body $loginBody -ContentType 'application/json' -TimeoutSec 5
    $token = $loginResponse.token
    $headers = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/json'
    }
    Write-Host "✅ Authentication successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test enhanced dashboard endpoints
Write-Host "`n3. Testing Enhanced Dashboard Endpoints..." -ForegroundColor Yellow

# Test dashboard overview
try {
    $overview = Invoke-RestMethod -Uri 'http://localhost:5000/api/dashboard/overview' -Method GET -Headers $headers -TimeoutSec 5
    Write-Host "✅ Dashboard Overview Endpoint:" -ForegroundColor Green
    Write-Host "   - Total Properties: $($overview.overview.totalProperties)" -ForegroundColor Cyan
    Write-Host "   - Active Leases: $($overview.overview.activeLeases)" -ForegroundColor Cyan
    Write-Host "   - Occupancy Rate: $($overview.overview.occupancyRate)%" -ForegroundColor Cyan
    Write-Host "   - Monthly Net Income: $($overview.overview.monthlyNetIncome)" -ForegroundColor Cyan
    Write-Host "   - Recent Expenses: $($overview.recentExpenses.Count) entries" -ForegroundColor Cyan
    Write-Host "   - Property Performance: $($overview.performanceData.Count) properties" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Dashboard overview endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test financial summary
try {
    $financial = Invoke-RestMethod -Uri 'http://localhost:5000/api/dashboard/financial-summary' -Method GET -Headers $headers -TimeoutSec 5
    Write-Host "✅ Financial Summary Endpoint:" -ForegroundColor Green
    Write-Host "   - Year: $($financial.year)" -ForegroundColor Cyan
    Write-Host "   - Total Annual Income: $($financial.totals.income)" -ForegroundColor Cyan
    Write-Host "   - Total Annual Expenses: $($financial.totals.expenses)" -ForegroundColor Cyan
    Write-Host "   - Monthly Data Points: $($financial.monthlyData.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Financial summary endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test frontend accessibility
Write-Host "`n4. Testing Frontend Accessibility..." -ForegroundColor Yellow
try {
    $frontendTest = Invoke-WebRequest -Uri 'http://localhost:5174' -Method GET -TimeoutSec 5 -UseBasicParsing
    if ($frontendTest.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible at http://localhost:5174" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend is not accessible. Please start the frontend server." -ForegroundColor Red
    Write-Host "   Command: Set-Location client; npm run dev" -ForegroundColor Cyan
}

Write-Host "`n🎉 Enhanced Dashboard Verification Complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "`n📊 Enhanced Features Available:" -ForegroundColor Yellow
Write-Host "   • Interactive financial charts (Recharts)" -ForegroundColor Cyan
Write-Host "   • Property performance pie charts" -ForegroundColor Cyan
Write-Host "   • Real-time activity feeds" -ForegroundColor Cyan
Write-Host "   • Enhanced KPI cards with occupancy rate" -ForegroundColor Cyan
Write-Host "   • Recent expenses and upcoming reminders" -ForegroundColor Cyan
Write-Host "   • Active leases summary with color coding" -ForegroundColor Cyan

Write-Host "`n🌐 Access Your Enhanced Dashboard:" -ForegroundColor Yellow
Write-Host "   URL: http://localhost:5174" -ForegroundColor Cyan
Write-Host "   Email: demo@landlordos.com" -ForegroundColor Cyan
Write-Host "   Password: demo123" -ForegroundColor Cyan
