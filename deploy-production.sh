#!/bin/bash

# Todo App Production Deployment Script
# This script deploys the entire application to VPS using JAR approach

set -e

echo "🚀 Starting Todo App Production Deployment..."

# Load environment variables from .env.production
if [ -f .env.production ]; then
    echo "📋 Loading environment variables from .env.production..."
    set -a  # automatically export all variables
    source .env.production
    set +a  # stop automatically exporting
else
    echo "⚠️  Warning: .env.production file not found!"
    echo "   Using default values. Make sure to set VPS_USER, VPS_IP, and APP_DIR environment variables."
fi

# Configuration
VPS_HOST="${VPS_HOST:-digital-ocean}"  # Use SSH config host alias
APP_DIR="${APP_DIR:-/opt/todo-app}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if .env.production exists
if [ ! -f .env.production ]; then
    print_error ".env.production file not found!"
    print_error "Please create .env.production with your environment variables"
    exit 1
fi

print_step "1. Building backend with clean build..."
# Clean build to ensure no cached artifacts
./mvnw clean
./mvnw package -DskipTests

print_step "2. Building frontend..."
echo "Make sure your backend is running on http://localhost:8080 before continuing..."
echo "To start backend with .env.production: source .env.production && ./mvnw spring-boot:run"
read -p "Press Enter when backend is ready..."

cd frontend
npm run build
cd ..

print_step "3. Creating deployment package..."
# Create temporary deployment directory
mkdir -p deployment
cp docker-compose.prod.yml deployment/
cp Dockerfile.jar deployment/

# Copy appropriate nginx config based on SSL setting
if [ "${SSL_ENABLED:-false}" = "true" ]; then
    print_status "SSL enabled - using nginx-ssl.conf"
    cp nginx-ssl.conf deployment/nginx.conf
    # Copy SSL certificates if they exist
    if [ -d "certs" ]; then
        cp -r certs deployment/
    else
        print_warning "SSL enabled but no certs directory found. Make sure SSL certificates are available on the server."
    fi
else
    print_status "SSL disabled - using nginx.conf (HTTP only)"
    cp nginx.conf deployment/
fi

cp .env.production deployment/
cp target/todo-0.0.1-SNAPSHOT.jar deployment/
cp -r frontend/dist deployment/

print_step "4. Uploading files to VPS..."
# Debug SSH config
echo "Debug: VPS_HOST = $VPS_HOST"
echo "Debug: SSH config test:"

# Function to convert Windows paths to Git Bash compatible paths
convert_path() {
    local path="$1"
    # Remove any carriage returns that might be present
    path=$(echo "$path" | tr -d '\r')
    
    # Convert different Windows path formats to Git Bash format
    if [[ "$path" =~ ^/mnt/c/ ]]; then
        # WSL format: /mnt/c/Users/... -> /c/Users/...
        echo "${path#/mnt}"
    elif [[ "$path" =~ ^C:\\ ]]; then
        # Windows format: C:\Users\... -> /c/Users/...
        echo "$path" | sed 's|^C:\\|/c/|' | sed 's|\\|/|g'
    elif [[ "$path" =~ ^C:/ ]]; then
        # Mixed format: C:/Users/... -> /c/Users/...
        echo "$path" | sed 's|^C:/|/c/|'
    else
        echo "$path"
    fi
}

# Try different SSH config paths and fix Windows path issues
SSH_CONFIG=""
SSH_KEY=""

# Use SSH_DIR from .env.production if set, otherwise fall back to default locations
if [ -n "$SSH_DIR" ]; then
    print_status "Using SSH_DIR from .env.production: $SSH_DIR"
    
    # Convert the SSH_DIR path to Git Bash format
    CONVERTED_SSH_DIR=$(convert_path "$SSH_DIR")
    print_status "Converted SSH_DIR path: $CONVERTED_SSH_DIR"
    
    # Check for SSH config in SSH_DIR
    if [ -f "$SSH_DIR/config" ]; then
        SSH_CONFIG="$SSH_DIR/config"
        print_status "Found SSH config at original path: $SSH_CONFIG"
    elif [ -f "$CONVERTED_SSH_DIR/config" ]; then
        SSH_CONFIG="$CONVERTED_SSH_DIR/config"
        print_status "Found SSH config at converted path: $SSH_CONFIG"
    else
        print_warning "SSH config not found in $SSH_DIR or $CONVERTED_SSH_DIR"
    fi
    
    # Check for SSH key in SSH_DIR
    if [ -f "$SSH_DIR/todo-vps-key" ]; then
        SSH_KEY="$SSH_DIR/todo-vps-key"
        print_status "Found SSH key at original path: $SSH_KEY"
    elif [ -f "$CONVERTED_SSH_DIR/todo-vps-key" ]; then
        SSH_KEY="$CONVERTED_SSH_DIR/todo-vps-key"
        print_status "Found SSH key at converted path: $SSH_KEY"
    else
        print_warning "SSH key not found in $SSH_DIR or $CONVERTED_SSH_DIR"
    fi
else
    print_status "SSH_DIR not set, using default SSH locations"
    
    # Check for SSH config in different locations
    if [ -f ~/.ssh/config ]; then
        SSH_CONFIG=~/.ssh/config
    elif [ -f /c/Users/Christian/.ssh/config ]; then
        SSH_CONFIG=/c/Users/Christian/.ssh/config
    elif [ -f /mnt/c/Users/Christian/.ssh/config ]; then
        SSH_CONFIG=$(convert_path /mnt/c/Users/Christian/.ssh/config)
    fi

    # Check for SSH key in different locations
    if [ -f ~/.ssh/todo-vps-key ]; then
        SSH_KEY=~/.ssh/todo-vps-key
    elif [ -f /c/Users/Christian/.ssh/todo-vps-key ]; then
        SSH_KEY=/c/Users/Christian/.ssh/todo-vps-key
    elif [ -f /mnt/c/Users/Christian/.ssh/todo-vps-key ]; then
        SSH_KEY=$(convert_path /mnt/c/Users/Christian/.ssh/todo-vps-key)
    fi
fi

# Build SSH options
SSH_OPTS=""
if [ -n "$SSH_CONFIG" ]; then
    SSH_OPTS="$SSH_OPTS -F $SSH_CONFIG"
    echo "Using SSH config: $SSH_CONFIG"
    # Verify the config file exists and is readable
    if [ ! -r "$SSH_CONFIG" ]; then
        print_warning "SSH config file exists but is not readable: $SSH_CONFIG"
    fi
fi

if [ -n "$SSH_KEY" ]; then
    SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
    echo "Using SSH key: $SSH_KEY"
    # Verify the key file exists and is readable
    if [ ! -r "$SSH_KEY" ]; then
        print_warning "SSH key file exists but is not readable: $SSH_KEY"
    fi
fi

# Test SSH connection
echo "Testing SSH connection..."
if ssh $SSH_OPTS -o BatchMode=yes -o ConnectTimeout=5 $VPS_HOST "echo 'SSH connection test successful'" 2>/dev/null; then
    echo "SSH connection test successful"
else
    echo "SSH connection test failed - trying without explicit config..."
    SSH_OPTS=""
    
    # Try one more time with basic connection
    echo "Trying basic SSH connection..."
    if ssh -o BatchMode=yes -o ConnectTimeout=5 $VPS_HOST "echo 'Basic SSH connection test successful'" 2>/dev/null; then
        echo "Basic SSH connection successful"
    else
        print_error "SSH connection failed completely!"
        print_error "Please check:"
        print_error "1. SSH key exists and has correct permissions"
        print_error "2. VPS_HOST is correctly set in .env.production"
        print_error "3. SSH config is properly configured"
        print_error "4. VPS is accessible and SSH service is running"
        exit 1
    fi
fi

# Upload all files to VPS
print_status "Uploading files to VPS..."
scp $SSH_OPTS deployment/docker-compose.prod.yml $VPS_HOST:$APP_DIR/
scp $SSH_OPTS deployment/Dockerfile.jar $VPS_HOST:$APP_DIR/
scp $SSH_OPTS deployment/nginx.conf $VPS_HOST:$APP_DIR/
scp $SSH_OPTS deployment/.env.production $VPS_HOST:$APP_DIR/
scp $SSH_OPTS deployment/todo-0.0.1-SNAPSHOT.jar $VPS_HOST:$APP_DIR/
scp $SSH_OPTS -r deployment/dist $VPS_HOST:$APP_DIR/frontend/

print_step "5. Deploying on VPS..."
ssh $SSH_OPTS $VPS_HOST << 'EOF'
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
    echo "Your app should be available at: https://$(curl -s ifconfig.me)"
EOF

# Cleanup
rm -rf deployment

print_status "✅ Deployment completed successfully!"
print_warning "Your Todo App is now running at: https://$VPS_IP"
print_warning "Frontend: https://$VPS_IP"
print_warning "API: https://$VPS_IP/api"
print_warning "API Docs: https://$VPS_IP/api/api-docs"

echo -e "${GREEN}🎉 Production deployment complete!${NC}"