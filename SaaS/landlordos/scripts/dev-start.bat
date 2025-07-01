@echo off
echo.
echo ===========================================
echo  🏠 LandlordOS Development Environment
echo ===========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    echo Expected location: c:\Users\rutte\OneDrive\jadaru.co\SaaS\landlordos
    pause
    exit /b 1
)

echo 📦 Installing dependencies (if needed)...
call npm run install:all

echo.
echo 🚀 Starting API Server (Port 5000)...
start "LandlordOS API Server" cmd /k "cd server && npm run dev"

echo.
echo ⏳ Waiting for API server to initialize...
timeout /t 5 /nobreak > nul

echo.
echo 🎨 Starting React Frontend (Port 5173+)...
start "LandlordOS Frontend" cmd /k "cd client && npm run dev"

echo.
echo ✅ Development environment started successfully!
echo.
echo 🌐 Your application will be available at:
echo    Frontend: http://localhost:5173 (or next available port)
echo    Backend:  http://localhost:5000
echo    Health:   http://localhost:5000/health
echo.
echo 🔑 Demo Login:
echo    Email:    demo@landlordos.com
echo    Password: demo123
echo.
echo 📚 Documentation: README.md and HOW_TO_RUN.md
echo.
echo Press any key to close this window...
echo.
echo 📊 API Server: http://localhost:5000
echo 🌐 Frontend: http://localhost:5173  
echo 💾 Prisma Studio: http://localhost:5555
echo.
echo Press any key to continue...
pause > nul
