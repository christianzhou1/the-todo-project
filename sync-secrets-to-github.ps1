# Sync Secrets from .env.production to GitHub Actions
# Bulk imports environment variables as GitHub Actions secrets in the production environment

param(
    [switch]$Force,
    [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub Secrets Sync Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Validate prerequisites
Write-Host "[1/5] Validating prerequisites..." -ForegroundColor Yellow

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "ERROR: .env.production file not found in current directory!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}
Write-Host "  [OK] .env.production found" -ForegroundColor Green

# Check if GitHub CLI is installed
try {
    $null = gh --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "GitHub CLI not found"
    }
    Write-Host "  [OK] GitHub CLI (gh) is installed" -ForegroundColor Green
} catch {
    Write-Host "ERROR: GitHub CLI (gh) is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please install it from: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Check if GitHub CLI is authenticated
try {
    $null = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not authenticated"
    }
    Write-Host "  [OK] GitHub CLI is authenticated" -ForegroundColor Green
} catch {
    Write-Host "ERROR: GitHub CLI is not authenticated!" -ForegroundColor Red
    Write-Host "Please run: gh auth login" -ForegroundColor Yellow
    exit 1
}

# Check repository context
try {
    $repo = gh repo view --json nameWithOwner -q .nameWithOwner 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not in a GitHub repository"
    }
    Write-Host "  [OK] Repository context: $repo" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Not in a GitHub repository or repository not found!" -ForegroundColor Red
    Write-Host "Please run this script from a GitHub repository directory." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Parse .env.production file
Write-Host "[2/5] Parsing .env.production file..." -ForegroundColor Yellow

$secrets = @{}
$skippedKeys = @("SSH_DIR")  # Keys to skip (Windows-specific, not needed for GitHub Actions)
$warnings = @()

Get-Content ".env.production" | ForEach-Object {
    $line = $_.Trim()
    
    # Skip empty lines and comments
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
        return
    }
    
    # Parse KEY=VALUE pairs
    if ($line -match "^([^#][^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Skip keys that shouldn't be synced
        if ($skippedKeys -contains $key) {
            Write-Host "  - Skipping $key (not needed for GitHub Actions)" -ForegroundColor Gray
            return
        }
        
        $secrets[$key] = $value
    }
}

if ($secrets.Count -eq 0) {
    Write-Host "ERROR: No valid secrets found in .env.production!" -ForegroundColor Red
    exit 1
}

# Auto-fix VPS_HOST if it's an SSH alias and VPS_IP is available
if ($secrets.ContainsKey("VPS_HOST") -and $secrets.ContainsKey("VPS_IP")) {
    $vpsHost = $secrets["VPS_HOST"]
    $vpsIp = $secrets["VPS_IP"]
    
    # Check if VPS_HOST looks like an SSH alias (not an IP or hostname)
    $isAlias = $vpsHost -notmatch "^\d+\.\d+\.\d+\.\d+$" -and $vpsHost -notmatch "^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    
    if ($isAlias) {
        Write-Host "  [INFO] VPS_HOST is set to '$vpsHost' (SSH alias)" -ForegroundColor Yellow
        Write-Host "  [INFO] Automatically using VPS_IP ($vpsIp) for GitHub Actions" -ForegroundColor Yellow
        $secrets["VPS_HOST"] = $vpsIp
        $warnings += "VPS_HOST was automatically changed from '$vpsHost' to '$vpsIp' for GitHub Actions compatibility."
    }
}

Write-Host "  [OK] Found $($secrets.Count) secrets to sync" -ForegroundColor Green

# Show warnings if any
if ($warnings.Count -gt 0) {
    Write-Host ""
    foreach ($warning in $warnings) {
        Write-Host "  WARNING: $warning" -ForegroundColor Yellow
    }
}

Write-Host ""

# Step 3: Show what will be synced
Write-Host "[3/5] Secrets to be synced:" -ForegroundColor Yellow
foreach ($key in $secrets.Keys | Sort-Object) {
    $value = $secrets[$key]
    $displayValue = if ($value.Length -gt 50) { $value.Substring(0, 47) + "..." } else { $value }
    Write-Host "  - $key = $displayValue" -ForegroundColor Gray
}

Write-Host ""

# Step 4: Confirm before proceeding (unless -Force is used)
if (-not $Force) {
    Write-Host "[4/5] Confirmation required" -ForegroundColor Yellow
    Write-Host "This will set/update $($secrets.Count) secrets in the '$Environment' environment." -ForegroundColor White
    Write-Host "Existing secrets with the same name will be overwritten." -ForegroundColor Yellow
    Write-Host ""
    $confirmation = Read-Host "Do you want to continue? (yes/no)"
    
    if ($confirmation -ne "yes" -and $confirmation -ne "y") {
        Write-Host "Operation cancelled." -ForegroundColor Yellow
        exit 0
    }
    Write-Host ""
} else {
    Write-Host "[4/5] Force mode enabled - skipping confirmation" -ForegroundColor Yellow
    Write-Host ""
}

# Step 5: Set secrets using GitHub CLI
Write-Host "[5/5] Syncing secrets to GitHub..." -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$failureCount = 0
$failedSecrets = @()

foreach ($key in $secrets.Keys | Sort-Object) {
    $value = $secrets[$key]
    
    Write-Host "  Setting $key..." -NoNewline -ForegroundColor Gray
    
    try {
        # Use GitHub CLI to set the secret
        # Pipe the value to stdin for proper handling of special characters
        $errorOutput = $value | gh secret set $key --env $Environment 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " [OK]" -ForegroundColor Green
            $successCount++
        } else {
            throw "GitHub CLI returned error code ${LASTEXITCODE}: $errorOutput"
        }
    } catch {
        Write-Host " [FAILED]" -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor Red
        $failureCount++
        $failedSecrets += $key
    }
}

Write-Host ""

# Step 6: Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sync Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Environment: $Environment" -ForegroundColor White
Write-Host "  Successful: $successCount" -ForegroundColor Green
Write-Host "  Failed: $failureCount" -ForegroundColor $(if ($failureCount -eq 0) { "Green" } else { "Red" })

if ($failedSecrets.Count -gt 0) {
    Write-Host ""
    Write-Host "Failed secrets:" -ForegroundColor Red
    foreach ($secret in $failedSecrets) {
        Write-Host "  - $secret" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please check your GitHub permissions and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "All secrets synced successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Note: SSH_PRIVATE_KEY must be set manually if it's stored in a separate file." -ForegroundColor Yellow
Write-Host ""

