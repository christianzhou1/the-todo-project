# PowerShell script to check .env.production configuration
Write-Host "Checking .env.production configuration..." -ForegroundColor Green
Write-Host ""

if (Test-Path ".env.production") {
    Write-Host "Found .env.production file" -ForegroundColor Green
    
    # Check for common configuration issues
    $content = Get-Content ".env.production"
    
    $issues = @()
    
    foreach ($line in $content) {
        if ($line -match "^DATABASE_USERNAME=(.*)$") {
            $username = $matches[1].Trim()
            if ($username -eq "todo_prod") {
                $issues += "❌ DATABASE_USERNAME should be 'todo_prod_user', not 'todo_prod'"
            } elseif ($username -eq "todo_prod_user") {
                Write-Host "✅ DATABASE_USERNAME is correct: $username" -ForegroundColor Green
            } else {
                $issues += "⚠️  DATABASE_USERNAME is set to: $username (expected: todo_prod_user)"
            }
        }
        
        if ($line -match "^DATABASE_PASSWORD=(.*)$") {
            $password = $matches[1].Trim()
            if ($password -eq "YourStrongPassword123!") {
                Write-Host "✅ DATABASE_PASSWORD is using default value" -ForegroundColor Yellow
            } else {
                Write-Host "✅ DATABASE_PASSWORD is set to custom value" -ForegroundColor Green
            }
        }
        
        if ($line -match "^DATABASE_URL=(.*)$") {
            $url = $matches[1].Trim()
            if ($url -like "*todo-db:5432*") {
                Write-Host "✅ DATABASE_URL is correct for Docker: $url" -ForegroundColor Green
            } else {
                $issues += "⚠️  DATABASE_URL should be 'jdbc:postgresql://todo-db:5432/todo_prod'"
            }
        }
    }
    
    if ($issues.Count -gt 0) {
        Write-Host ""
        Write-Host "Issues found:" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "  $issue" -ForegroundColor Red
        }
        Write-Host ""
        Write-Host "To fix these issues, update your .env.production file with the correct values:" -ForegroundColor Yellow
        Write-Host "  DATABASE_USERNAME=todo_prod_user" -ForegroundColor Cyan
        Write-Host "  DATABASE_PASSWORD=YourStrongPassword123!" -ForegroundColor Cyan
        Write-Host "  DATABASE_URL=jdbc:postgresql://todo-db:5432/todo_prod" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Then run:" -ForegroundColor Yellow
        Write-Host "  docker-compose -f docker-compose.prod.yml --env-file .env.production up" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "✅ All database configuration looks correct!" -ForegroundColor Green
    }
    
} else {
    Write-Host "❌ .env.production file not found!" -ForegroundColor Red
    Write-Host "Create it by copying env.example:" -ForegroundColor Yellow
    Write-Host "  cp env.example .env.production" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
