@echo off
echo Starting Todo App Deployment (PowerShell)...
echo.

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>nul
if %errorlevel% equ 0 (
    echo Using PowerShell...
    powershell -ExecutionPolicy Bypass -File deploy-production.ps1
) else (
    echo PowerShell not found. Please install PowerShell or use deploy.bat instead.
    pause
    exit 1
)

echo.
echo Deployment completed.
pause
