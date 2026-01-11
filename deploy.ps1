# Simple Production Deployment Script
# Deploys Spring Boot backend to VPS using Docker Compose

param(
    [switch]$SkipFrontendBuild,
    [switch]$ResetLocalDatabase,
    [switch]$ResetRemoteDatabase
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SkySync Production Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
if ($ResetLocalDatabase) {
    Write-Host "WARNING: Local database will be reset (all data will be lost!)" -ForegroundColor Yellow
}
if ($ResetRemoteDatabase) {
    Write-Host "WARNING: Remote database will be reset (all data will be lost!)" -ForegroundColor Yellow
}
Write-Host ""

# Load environment variables from .env.production
if (-not (Test-Path ".env.production")) {
    Write-Host "ERROR: .env.production file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "[1/7] Loading environment variables..." -ForegroundColor Yellow
Get-Content ".env.production" | ForEach-Object {
    if ($_ -match "^([^#][^=]+)=(.*)$") {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

$VPS_HOST = $env:VPS_HOST
$APP_DIR = $env:APP_DIR
$SSH_DIR = $env:SSH_DIR

if (-not $VPS_HOST -or -not $APP_DIR) {
    Write-Host "ERROR: VPS_HOST and APP_DIR must be set in .env.production" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Environment loaded (VPS_HOST: $VPS_HOST, APP_DIR: $APP_DIR)" -ForegroundColor Green
Write-Host ""

# Step 0: Reset local database if requested
if ($ResetLocalDatabase) {
    Write-Host "[0/6] Resetting local database..." -ForegroundColor Yellow
    
    # Stop local containers
    Write-Host "  Stopping local containers..." -ForegroundColor Gray
    docker compose --env-file .env.production -f compose.yaml down 2>&1 | Out-Null
    
    # Remove local postgres volumes
    Write-Host "  Removing local database volumes..." -ForegroundColor Gray
    $localVolumes = docker volume ls -q 2>&1 | Select-String -Pattern "(postgres|skysync|todo)" 
    if ($localVolumes) {
        $localVolumes | ForEach-Object {
            docker volume rm $_ 2>&1 | Out-Null
            Write-Host "    Removed volume: $_" -ForegroundColor Gray
        }
    }
    
    # Try common volume names
    @("skysync-app_postgres-data", "todo_postgres-data", "postgres-data") | ForEach-Object {
        docker volume rm $_ 2>&1 | Out-Null
    }
    
    Write-Host "[OK] Local database reset complete" -ForegroundColor Green
    Write-Host ""
}

# Step 1: Build backend JAR
Write-Host "[2/7] Building backend JAR..." -ForegroundColor Yellow
& .\mvnw.cmd clean package -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Maven build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Backend JAR built successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Build frontend (optional)
if (-not $SkipFrontendBuild) {
    Write-Host "[3/7] Building frontend..." -ForegroundColor Yellow
    Set-Location frontend
    & npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Frontend build failed!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Set-Location ..
    Write-Host "[OK] Frontend built successfully" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[3/7] Skipping frontend build" -ForegroundColor Yellow
    Write-Host ""
}

# Step 3: Prepare deployment files
Write-Host "[4/7] Preparing deployment package..." -ForegroundColor Yellow
if (Test-Path "deployment") {
    Remove-Item -Recurse -Force "deployment"
}
New-Item -ItemType Directory -Name "deployment" | Out-Null

# Copy required files
Copy-Item "docker-compose.prod.yml" "deployment/"
Copy-Item "Dockerfile.jar" "deployment/"
Copy-Item ".env.production" "deployment/"
Copy-Item "target/todo-0.0.1-SNAPSHOT.jar" "deployment/"

# Copy frontend if built
if (Test-Path "frontend/dist") {
    Copy-Item -Recurse "frontend/dist" "deployment/frontend/"
    Write-Host "[OK] Frontend files included" -ForegroundColor Green
}

# Copy nginx config - prefer SSL config if it exists, otherwise use regular config
if (Test-Path "nginx-ssl.conf") {
    Write-Host "  Using nginx-ssl.conf for HTTPS support" -ForegroundColor Gray
    Copy-Item "nginx-ssl.conf" "deployment/nginx.conf"
    
    # Verify SSL certificates exist
    if (-not (Test-Path "certs/server.crt") -or -not (Test-Path "certs/server.key")) {
        Write-Host "  WARNING: SSL certificates not found in certs/ directory!" -ForegroundColor Yellow
        Write-Host "  HTTPS will not work without certificates." -ForegroundColor Yellow
        Write-Host "  Certificates should be at: certs/server.crt and certs/server.key" -ForegroundColor Yellow
    } else {
        Write-Host "  SSL certificates found" -ForegroundColor Gray
    }
} elseif (Test-Path "nginx.conf") {
    Write-Host "  Using nginx.conf (HTTP only)" -ForegroundColor Gray
    Copy-Item "nginx.conf" "deployment/"
} else {
    Write-Host "  WARNING: No nginx config found!" -ForegroundColor Yellow
}

# Copy SSL certificates if they exist
if (Test-Path "certs") {
    Copy-Item -Recurse "certs" "deployment/"
}

Write-Host "[OK] Deployment package prepared" -ForegroundColor Green
Write-Host ""

# Step 4: Setup SSH options
Write-Host "[5/7] Configuring SSH..." -ForegroundColor Yellow
$SSH_OPTS = @()

if ($SSH_DIR) {
    $SSH_CONFIG = Join-Path $SSH_DIR "config"
    $SSH_KEY = Join-Path $SSH_DIR $VPS_HOST
    
    if (Test-Path $SSH_CONFIG) {
        $SSH_OPTS += "-F", $SSH_CONFIG
    }
    if (Test-Path $SSH_KEY) {
        $SSH_OPTS += "-i", $SSH_KEY
    }
}

# Test SSH connection
$sshTestCmd = "ssh"
if ($SSH_OPTS.Count -gt 0) {
    $sshTestCmd += " " + ($SSH_OPTS -join " ")
}
$sshTestCmd += " -o BatchMode=yes -o ConnectTimeout=5 $VPS_HOST `"echo 'OK'`""

$testResult = Invoke-Expression $sshTestCmd 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: SSH connection failed!" -ForegroundColor Red
    Write-Host "Please check your SSH configuration and VPS_HOST" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] SSH connection successful" -ForegroundColor Green
Write-Host ""

# Step 5: Upload files to VPS
Write-Host "[6/7] Uploading files to VPS..." -ForegroundColor Yellow

# Create app directory on VPS
$setupCmd = "ssh"
if ($SSH_OPTS.Count -gt 0) {
    $setupCmd += " " + ($SSH_OPTS -join " ")
}
$setupCmd += " $VPS_HOST `"sudo mkdir -p $APP_DIR && sudo chown `$(whoami):`$(whoami) $APP_DIR`""
Invoke-Expression $setupCmd | Out-Null

# Upload files using SCP
$scpCmd = "scp"
if ($SSH_OPTS.Count -gt 0) {
    $scpCmd += " " + ($SSH_OPTS -join " ")
}

# Upload individual files
$files = @(
    "deployment/docker-compose.prod.yml",
    "deployment/Dockerfile.jar",
    "deployment/.env.production",
    "deployment/todo-0.0.1-SNAPSHOT.jar"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $target = "$VPS_HOST`:$APP_DIR/$(Split-Path $file -Leaf)"
        Write-Host "  Uploading $(Split-Path $file -Leaf)..." -ForegroundColor Gray
        $uploadCmd = "$scpCmd `"$file`" `"$target`""
        Invoke-Expression $uploadCmd 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Failed to upload $(Split-Path $file -Leaf)" -ForegroundColor Red
            exit 1
        }
    }
}

# Upload frontend directory if it exists
if (Test-Path "deployment/frontend") {
    Write-Host "  Uploading frontend files..." -ForegroundColor Gray
    $uploadCmd = "$scpCmd -r `"deployment/frontend`" `"$VPS_HOST`:$APP_DIR/`""
    Invoke-Expression $uploadCmd 2>&1 | Out-Null
}

# Upload nginx.conf if it exists
if (Test-Path "deployment/nginx.conf") {
    Write-Host "  Uploading nginx.conf..." -ForegroundColor Gray
    $uploadCmd = "$scpCmd `"deployment/nginx.conf`" `"$VPS_HOST`:$APP_DIR/`""
    Invoke-Expression $uploadCmd 2>&1 | Out-Null
}

# Upload certs if they exist
if (Test-Path "deployment/certs") {
    Write-Host "  Uploading SSL certificates..." -ForegroundColor Gray
    $uploadCmd = "$scpCmd -r `"deployment/certs`" `"$VPS_HOST`:$APP_DIR/`""
    Invoke-Expression $uploadCmd 2>&1 | Out-Null
}

Write-Host "[OK] Files uploaded successfully" -ForegroundColor Green
Write-Host ""

# Step 7: Deploy on VPS
Write-Host "[7/7] Deploying on VPS..." -ForegroundColor Yellow

# Set reset flag for remote deploy script
$resetDbFlag = if ($ResetRemoteDatabase) { "true" } else { "false" }

# Check if deploy-remote.sh exists, if not create it
if (-not (Test-Path "deploy-remote.sh")) {
    Write-Host "ERROR: deploy-remote.sh not found!" -ForegroundColor Red
    Write-Host "Please ensure deploy-remote.sh exists in the project root." -ForegroundColor Yellow
    exit 1
}

# Upload the bash script to VPS
$remoteScript = "/tmp/deploy-$(Get-Random).sh"
Write-Host "  Uploading deploy script..." -ForegroundColor Gray
$scpScriptCmd = "$scpCmd `"deploy-remote.sh`" `"$VPS_HOST`:$remoteScript`""
Invoke-Expression $scpScriptCmd | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to upload deploy script!" -ForegroundColor Red
    exit 1
}

# Execute the script on VPS with APP_DIR and RESET_DB as arguments
$sshDeployCmd = "ssh"
if ($SSH_OPTS.Count -gt 0) {
    $sshDeployCmd += " " + ($SSH_OPTS -join " ")
}
$sshDeployCmd += " $VPS_HOST `"chmod +x $remoteScript && $remoteScript '$APP_DIR' '$resetDbFlag' && rm $remoteScript`""
Invoke-Expression $sshDeployCmd

# Cleanup
Remove-Item -Recurse -Force "deployment"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your application should be available at:" -ForegroundColor Yellow
Write-Host "  http://$($env:VPS_IP)" -ForegroundColor White
Write-Host ""

