#!/bin/bash

# Todo App Production Deployment Script
# This script deploys the entire application to VPS using JAR approach

set -e

echo "Starting scp build to VPS..."

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



print_step "1. Uploading files to VPS..."
# Upload all files to VPS using SSH config if available
scp deployment/docker-compose.prod.yml $VPS_HOST:$APP_DIR/
scp deployment/Dockerfile.jar $VPS_HOST:$APP_DIR/
scp deployment/nginx.conf $VPS_HOST:$APP_DIR/
scp deployment/.env.production $VPS_HOST:$APP_DIR/
scp deployment/todo-0.0.1-SNAPSHOT.jar $VPS_HOST:$APP_DIR/
scp -r deployment/dist $VPS_HOST:$APP_DIR/frontend/




print_status "✅ SCP build to VPS completed successfully!"
print_warning "Your Todo App is now running at: https://$VPS_IP"
print_warning "Frontend: https://$VPS_IP"
print_warning "API: https://$VPS_IP/api"
print_warning "API Docs: https://$VPS_IP/api/api-docs"

echo -e "${GREEN}🎉 SCP build to VPS complete!${NC}"