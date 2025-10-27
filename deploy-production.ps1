# Todo App Production Deployment Script (PowerShell)
# This script deploys the entire application to VPS using JAR approach

param(
    [switch]$SkipFrontendBuild
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "Starting Todo App Production Deployment..." -ForegroundColor Green

# Function to print colored status messages
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor Blue
}

# Load environment variables from .env.production
if (Test-Path ".env.production") {
    Write-Status "Loading environment variables from .env.production..."
    
    # Read and parse .env.production file
    Get-Content ".env.production" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
} else {
    Write-Warning ".env.production file not found!"
    Write-Warning "Using default values. Make sure to set VPS_USER, VPS_IP, and APP_DIR environment variables."
}

# Configuration
$VPS_HOST = if ($env:VPS_HOST) { $env:VPS_HOST } else { "digital-ocean" }
$APP_DIR = if ($env:APP_DIR) { $env:APP_DIR } else { "/opt/todo-app" }
$SSL_ENABLED = if ($env:SSL_ENABLED) { $env:SSL_ENABLED } else { "false" }

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Error ".env.production file not found!"
    Write-Error "Please create .env.production with your environment variables"
    exit 1
}

Write-Step "1. Building backend with clean build..."
# Clean build to ensure no cached artifacts
Write-Status "Running Maven clean..."
& .\mvnw.cmd clean
Write-Status "Running Maven package..."
& .\mvnw.cmd package -DskipTests

if (-not $SkipFrontendBuild) {
    Write-Step "2. Building frontend..."
    Write-Host "Make sure your backend is running on http://localhost:8080 before continuing..." -ForegroundColor Yellow
    Write-Host "To start backend with .env.production: .\mvnw.cmd spring-boot:run" -ForegroundColor Yellow
    Read-Host "Press Enter when backend is ready"

    Set-Location frontend
    Write-Status "Building frontend for production..."
    & npm run build
    Set-Location ..
}

Write-Step "3. Creating deployment package..."
# Create temporary deployment directory
if (Test-Path "deployment") {
    Remove-Item -Recurse -Force "deployment"
}
New-Item -ItemType Directory -Name "deployment" | Out-Null

Copy-Item "docker-compose.prod.yml" "deployment/"
Copy-Item "Dockerfile.jar" "deployment/"

# Copy appropriate nginx config based on SSL setting
if ($SSL_ENABLED -eq "true") {
    Write-Status "SSL enabled - using nginx-ssl.conf"
    Copy-Item "nginx-ssl.conf" "deployment/nginx.conf"
    # Copy SSL certificates if they exist
    if (Test-Path "certs") {
        Copy-Item -Recurse "certs" "deployment/"
    } else {
        Write-Warning "SSL enabled but no certs directory found. Make sure SSL certificates are available on the server."
    }
} else {
    Write-Status "SSL disabled - using nginx.conf (HTTP only)"
    Copy-Item "nginx.conf" "deployment/"
}

Copy-Item ".env.production" "deployment/"
Copy-Item "target/todo-0.0.1-SNAPSHOT.jar" "deployment/"
Copy-Item -Recurse "frontend/dist" "deployment/"

Write-Step "4. Uploading files to VPS..."
Write-Status "VPS_HOST = $VPS_HOST"

# SSH configuration
$SSH_CONFIG = $null
$SSH_KEY = $null
$SSH_OPTS = @()

# Check for SSH config and key in different locations
$SSH_DIR = $env:SSH_DIR
if ($SSH_DIR) {
    Write-Status "Using SSH_DIR from .env.production: $SSH_DIR"
    
    
    $SSH_CONFIG_PATH = Join-Path $SSH_DIR "config"
    $SSH_KEY_PATH = Join-Path $SSH_DIR $VPS_HOST
    
    if (Test-Path $SSH_CONFIG_PATH) {
        $SSH_CONFIG = $SSH_CONFIG_PATH
        Write-Status "Found SSH config: $SSH_CONFIG"
    }
    
    if (Test-Path $SSH_KEY_PATH) {
        $SSH_KEY = $SSH_KEY_PATH
        Write-Status "Found SSH key: $SSH_KEY"
    }
} else {
    Write-Status "SSH_DIR not set, using system default SSH locations"
}

# Build SSH options
if ($SSH_CONFIG) {
    $SSH_OPTS += "-F", $SSH_CONFIG
}
if ($SSH_KEY) {
    $SSH_OPTS += "-i", $SSH_KEY
}

# Test SSH connection
Write-Status "Testing SSH connection..."
$sshTestCmd = "ssh"
if ($SSH_OPTS) {
    $sshTestCmd += " " + ($SSH_OPTS -join " ")
}
$sshTestCmd += " -o BatchMode=yes -o ConnectTimeout=5 $VPS_HOST `"echo 'SSH connection test successful'`""

try {
    Invoke-Expression $sshTestCmd | Out-Null
    Write-Status "SSH connection test successful"
} catch {
    Write-Warning "SSH connection test failed - trying without explicit config..."
    $SSH_OPTS = @()
    
    # Try basic connection
    try {
        ssh -o BatchMode=yes -o ConnectTimeout=5 $VPS_HOST "echo 'Basic SSH connection test successful'" | Out-Null
        Write-Status "Basic SSH connection successful"
    } catch {
        Write-Error "SSH connection failed completely!"
        Write-Error "Please check:"
        Write-Error "1. SSH key exists and has correct permissions"
        Write-Error "2. VPS_HOST is correctly set in .env.production"
        Write-Error "3. SSH config is properly configured"
        Write-Error "4. VPS is accessible and SSH service is running"
        exit 1
    }
}

# Upload all files to VPS
Write-Status "Uploading files to VPS..."
$scpCmd = "scp"
if ($SSH_OPTS) {
    $scpCmd += " " + ($SSH_OPTS -join " ")
}

# Upload files
$files = @(
    "deployment/docker-compose.prod.yml",
    "deployment/Dockerfile.jar", 
    "deployment/nginx.conf",
    "deployment/.env.production",
    "deployment/todo-0.0.1-SNAPSHOT.jar"
)

foreach ($file in $files) {
    $target = "$VPS_HOST`:$APP_DIR/$(Split-Path $file -Leaf)"
    $uploadCmd = "$scpCmd `"$file`" `"$target`""
    Write-Status "Uploading $(Split-Path $file -Leaf)..."
    Invoke-Expression $uploadCmd
}

# Upload frontend dist directory
$uploadCmd = "$scpCmd -r `"deployment/dist`" `"$VPS_HOST`:$APP_DIR/frontend/`""
Write-Status "Uploading frontend files..."
Invoke-Expression $uploadCmd

Write-Step "5. Deploying on VPS..."
$sshCmd = "ssh"
if ($SSH_OPTS) {
    $sshCmd += " " + ($SSH_OPTS -join " ")
}

$deployScript = @'
set -e

# Navigate to app directory
cd /opt/todo-app

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker todoapp
    echo "Docker installed. Please log out and back in for group changes to take effect."
    exit 1
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Stop existing containers and clean up
docker-compose -f docker-compose.prod.yml down || true

# Clean up old images to free space
docker image prune -f || true

# Fix file permissions for frontend
chmod -R 755 frontend/dist/

# Build and start the application with clean build
docker-compose -f docker-compose.prod.yml --env-file .env.production build --no-cache
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Show status
docker-compose -f docker-compose.prod.yml ps

echo "Deployment complete!"
echo "Your app should be available at: http://$(curl -s ifconfig.me)"
'@

# Execute deployment script on VPS
# Convert Windows line endings to Unix line endings
$deployScriptUnix = $deployScript -replace "`r`n", "`n" -replace "`r", "`n"
$fullSshCmd = "$sshCmd $VPS_HOST '$deployScriptUnix'"
Invoke-Expression $fullSshCmd

# Cleanup
Remove-Item -Recurse -Force "deployment"

Write-Status "✅ Deployment completed successfully!"
Write-Warning "Your Todo App is now running at: http://$($env:VPS_IP)"
Write-Warning "Frontend: http://$($env:VPS_IP)"
Write-Warning "API: http://$($env:VPS_IP)/api"
Write-Warning "API Docs: http://$($env:VPS_IP)/api/api-docs"

Write-Host "🎉 Production deployment complete!" -ForegroundColor Green
