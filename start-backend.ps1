# Start Spring Boot backend with .env.production
Write-Host "Loading .env.production and starting Spring Boot backend..." -ForegroundColor Green

# Load environment variables from .env.production
if (Test-Path .env.production) {
    Write-Host "📋 Loading environment variables from .env.production..." -ForegroundColor Yellow
    
    Get-Content .env.production | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, 'Process')
            Write-Host "Set $name" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "⚠️  Warning: .env.production file not found!" -ForegroundColor Red
    exit 1
}

# Start Spring Boot
Write-Host "🚀 Starting Spring Boot backend..." -ForegroundColor Green
.\mvnw spring-boot:run
