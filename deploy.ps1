# Todo App Deployment Script for Windows
Write-Host "Starting Todo App Deployment..." -ForegroundColor Green
Write-Host ""

# Check if Git Bash is available
$gitBash = Get-Command bash -ErrorAction SilentlyContinue
if ($gitBash) {
    Write-Host "Using Git Bash..." -ForegroundColor Yellow
    & bash deploy-production.sh
} else {
    Write-Host "Git Bash not found. Trying WSL..." -ForegroundColor Yellow
    & wsl bash deploy-production.sh
}

Write-Host ""
Write-Host "Deployment completed. Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
