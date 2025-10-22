@echo off
echo Starting Todo App Deployment...
echo.

REM Check if Git Bash is available
where bash >nul 2>nul
if %errorlevel% equ 0 (
    echo Using Git Bash...
    echo Converting line endings in .env.production...
    bash -c "sed -i 's/\r$//' .env.production 2>/dev/null || true"
    bash deploy-production.sh
) else (
    echo Git Bash not found. Trying WSL...
    wsl bash -c "sed -i 's/\r$//' .env.production 2>/dev/null || true"
    wsl bash deploy-production.sh
)

pause
