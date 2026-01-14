@echo off
REM Batch wrapper to start SkySync Application
echo Starting SkySync Application...
echo.

REM Check if database container is running, start if not
docker ps --filter "name=skysync-db" --format "{{.Names}}" | findstr /C:"skysync-db" >nul 2>&1
if errorlevel 1 (
    echo Database container not running. Starting it...
    docker-compose -f docker-compose.prod.yml --env-file .env.production up -d skysync-db
    timeout /t 5 /nobreak >nul
)

REM Load environment variables and start application
powershell -ExecutionPolicy Bypass -File start-simple.ps1

pause
