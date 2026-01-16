# PowerShell script to remove all Docker volumes
Write-Host "Removing all Docker volumes..." -ForegroundColor Green
Write-Host ""

# Check if Docker is available
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker is not installed or not available in PATH" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Docker is not installed or not available in PATH" -ForegroundColor Red
    exit 1
}

# Get all volumes
$volumes = docker volume ls -q

if ($volumes.Count -eq 0 -or $volumes -eq $null) {
    Write-Host "✅ No volumes found" -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

Write-Host "Found $($volumes.Count) volume(s)" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Warning: This will permanently delete all volumes and their data!" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to cancel, or any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Remove all volumes
$successCount = 0
$failCount = 0

foreach ($volume in $volumes) {
    Write-Host "Removing volume: $volume" -ForegroundColor Yellow
    docker volume rm $volume 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Removed successfully" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "  ❌ Failed to remove volume (may be in use by a container)" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
if ($successCount -gt 0) {
    Write-Host "✅ Successfully removed $successCount volume(s)" -ForegroundColor Green
}
if ($failCount -gt 0) {
    Write-Host "⚠️  Failed to remove $failCount volume(s) (they may be in use)" -ForegroundColor Yellow
    Write-Host "   Try stopping containers first with: .\stop-containers.ps1" -ForegroundColor Cyan
}
Write-Host ""

# Verify volumes are removed
$remaining = docker volume ls -q
if ($remaining.Count -eq 0 -or $remaining -eq $null) {
    Write-Host "✅ Verification: No volumes remain" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: $($remaining.Count) volume(s) still exist" -ForegroundColor Yellow
}



