# PowerShell script to reset the database with password from .env.production
# This will DELETE all data in the database!

Write-Host "Resetting database with password from .env.production..." -ForegroundColor Yellow
Write-Host "WARNING: This will DELETE all data in the database!" -ForegroundColor Red
Write-Host ""

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "Error: .env.production file not found!" -ForegroundColor Red
    exit 1
}

# Confirm before proceeding
$confirm = Read-Host "Are you sure you want to reset the database? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Step 1: Stopping and removing database container..." -ForegroundColor Cyan
docker compose down skysync-db

Write-Host ""
Write-Host "Step 2: Removing database volume (this deletes all data)..." -ForegroundColor Cyan
$volumeName = "todo_postgres-data"
$volumes = docker volume ls --format "{{.Name}}" | Select-String "postgres"
if ($volumes -match $volumeName) {
    docker volume rm $volumeName
    Write-Host "  Volume removed: $volumeName" -ForegroundColor Green
} else {
    Write-Host "  Volume not found (may have been already removed)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 3: Creating network if it doesn't exist..." -ForegroundColor Cyan
$networkExists = docker network ls --format "{{.Name}}" | Select-String "skysync-net"
if (-not $networkExists) {
    docker network create skysync-net
    Write-Host "  Network created: skysync-net" -ForegroundColor Green
} else {
    Write-Host "  Network already exists: skysync-net" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 4: Starting database with password from .env.production..." -ForegroundColor Cyan
Write-Host "  Loading DATABASE_PASSWORD from .env.production..." -ForegroundColor Gray

# Start the database container with environment variables from .env.production
docker compose --env-file .env.production up -d skysync-db

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Waiting for database to be ready..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
    
    # Check if database is healthy
    $status = docker ps --filter "name=skysync-db" --format "{{.Status}}"
    Write-Host "  Database status: $status" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "✅ Database reset complete!" -ForegroundColor Green
    Write-Host "  The database password is now set from DATABASE_PASSWORD in .env.production" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run .\start.ps1 to start your application." -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Failed to start database container!" -ForegroundColor Red
    Write-Host "  Check the error messages above." -ForegroundColor Yellow
    exit 1
}



