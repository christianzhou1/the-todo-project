@echo off
echo Starting Todo App Deployment...
echo.

REM Check if Git Bash is available
where bash >nul 2>nul
if %errorlevel% equ 0 (
    echo Using Git Bash...
    echo Converting line endings in .env.production...
    bash -c "dos2unix .env.production 2>/dev/null || sed -i 's/\r$//' .env.production 2>/dev/null || true"
    echo Starting deployment script...
    bash deploy-production.sh
) else (
    echo Git Bash not found. Trying WSL...
    wsl bash -c "dos2unix .env.production 2>/dev/null || sed -i 's/\r$//' .env.production 2>/dev/null || true"
    echo Starting deployment script...
    wsl bash deploy-production.sh
)

echo.
echo Deployment script completed.
pause
