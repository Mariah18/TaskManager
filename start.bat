@echo off
echo Starting Task Manager Application...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ docker-compose is not installed. Please install it and try again.
    pause
    exit /b 1
)

echo Building and starting services...
docker-compose up -d --build

echo Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo Services are running!
    echo.
    echo Access your application:
    echo    Frontend: http://localhost:3000
    echo    Backend API: http://localhost:3001
    echo.
    echo Next steps:
    echo    1. Open http://localhost:3000 in your browser
    echo    2. Create a new account
    echo    3. Start managing your tasks!
    echo.
    echo Useful commands:
    echo    View logs: docker-compose logs -f
    echo    Stop services: docker-compose down
    echo    Restart services: docker-compose restart
) else (
    echo ❌ Some services failed to start. Check logs with: docker-compose logs
)

pause 