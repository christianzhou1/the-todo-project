# PowerShell script to start Todo Application with .env.production
Write-Host "Starting Todo Application..." -ForegroundColor Green
Write-Host ""

# Check if .env.production exists
if (Test-Path ".env.production") {
    Write-Host "Found .env.production - loading environment variables" -ForegroundColor Yellow
    
    # Load environment variables from .env.production
    Get-Content ".env.production" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "  $key = [HIDDEN]" -ForegroundColor Gray
        }
    }
    Write-Host "Environment variables loaded from .env.production" -ForegroundColor Green
} else {
    Write-Host "No .env.production file found - using system environment variables" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Spring Boot application..." -ForegroundColor Green

# Start the application
& .\mvnw.cmd spring-boot:run -Dspring-boot.run.jvmArguments="-Djava.awt.headless=true"

Write-Host ""
Write-Host "Application stopped. Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
