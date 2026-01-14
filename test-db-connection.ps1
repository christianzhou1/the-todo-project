# Test database connection with credentials from .env.production
Write-Host "Testing database connection..." -ForegroundColor Green

if (Test-Path ".env.production") {
    # Load environment variables
    $envContent = Get-Content ".env.production"
    foreach ($line in $envContent) {
        if ($line -match "^([^#][^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    
    Write-Host "Loaded credentials from .env.production" -ForegroundColor Yellow
    Write-Host "DATABASE_USERNAME: $env:DATABASE_USERNAME" -ForegroundColor Cyan
    Write-Host "DATABASE_PASSWORD: [HIDDEN]" -ForegroundColor Cyan
    Write-Host "DATABASE_URL: $env:DATABASE_URL" -ForegroundColor Cyan
    
    # Extract port from DATABASE_URL if it contains localhost
    $dbPort = "5432"
    if ($env:DATABASE_URL -match "localhost:(\d+)") {
        $dbPort = $matches[1]
    }
    
    Write-Host ""
    Write-Host "Testing connection to localhost:$dbPort..." -ForegroundColor Yellow
    
    # Test with psql if available, or use a simple connection test
    $testResult = docker exec skysync-db psql -U $env:DATABASE_USERNAME -d todo_prod -c "SELECT current_user;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database connection successful!" -ForegroundColor Green
        Write-Host $testResult
    } else {
        Write-Host "✗ Database connection failed!" -ForegroundColor Red
        Write-Host $testResult
        Write-Host ""
        Write-Host "The password in .env.production might not match the database password." -ForegroundColor Yellow
        Write-Host "Database was created with password from docker-compose environment variables." -ForegroundColor Yellow
    }
    } else {
        Write-Host ".env.production file not found!" -ForegroundColor Red
    }
}

