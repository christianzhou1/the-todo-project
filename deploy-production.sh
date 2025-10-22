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

print_step "1. Building backend..."
./mvnw clean package -DskipTests

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
cp nginx.conf deployment/
cp .env.production deployment/
cp target/todo-0.0.1-SNAPSHOT.jar deployment/
cp -r frontend/dist deployment/

print_step "4. Uploading files to VPS..."
# Upload all files to VPS using SSH config if available
scp deployment/docker-compose.prod.yml $VPS_HOST:$APP_DIR/
scp deployment/Dockerfile.jar $VPS_HOST:$APP_DIR/
scp deployment/nginx.conf $VPS_HOST:$APP_DIR/
scp deployment/.env.production $VPS_HOST:$APP_DIR/
scp deployment/todo-0.0.1-SNAPSHOT.jar $VPS_HOST:$APP_DIR/
scp -r deployment/dist $VPS_HOST:$APP_DIR/frontend/

print_step "5. Deploying on VPS..."
ssh $VPS_HOST << 'EOF'
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
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down || true
    
    # Fix file permissions for frontend
    chmod -R 755 frontend/dist/
    
    # Start the application
    docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
    
    # Wait for services to start
    echo "Waiting for services to start..."
    sleep 10
    
    # Show status
    docker-compose -f docker-compose.prod.yml ps
    
    echo "Deployment complete!"
    echo "Your app should be available at: http://$(curl -s ifconfig.me)"
EOF

# Cleanup
rm -rf deployment

print_status "✅ Deployment completed successfully!"
print_warning "Your Todo App is now running at: http://$VPS_IP"
print_warning "Frontend: http://$VPS_IP"
print_warning "API: http://$VPS_IP/api"
print_warning "API Docs: http://$VPS_IP/api/api-docs"

echo -e "${GREEN}🎉 Production deployment complete!${NC}"