@echo off
echo.
echo ===========================================
echo  LandlordOS Database Setup Helper
echo ===========================================
echo.
echo Please enter your PostgreSQL password when prompted.
echo This will test the connection and update your .env file.
echo.

set /p DB_PASSWORD="Enter your PostgreSQL password: "

echo.
echo Testing database connection...

"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d landlordos_dev -c "SELECT 'Connection successful!' as status;" 2>nul

if %ERRORLEVEL% == 0 (
    echo ✅ Connection successful!
    echo.
    echo Updating .env file...
    
    REM Update the .env file with the correct password
    powershell -Command "(Get-Content .env) -replace 'postgresql://postgres:yourpassword@localhost:5432/landlordos_dev', 'postgresql://postgres:%DB_PASSWORD%@localhost:5432/landlordos_dev' | Set-Content .env"
    
    echo ✅ Environment file updated!
    echo.
    echo Now running Prisma migration...
    npx prisma migrate dev --name init
    
    if %ERRORLEVEL% == 0 (
        echo.
        echo ✅ Migration completed successfully!
        echo.
        echo Running database seed...
        npm run seed
    )
) else (
    echo ❌ Connection failed. Please check your password and try again.
)

echo.
pause
