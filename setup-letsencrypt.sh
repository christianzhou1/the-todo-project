#!/bin/bash

# Let's Encrypt SSL Certificate Setup for Production
# This script sets up SSL certificates using Let's Encrypt with proper domain handling

set -e  # Exit on any error

# Configuration
DOMAIN="${1:-todo.christianzhou.com}"
EMAIL="${2:-admin@christianzhou.com}"
NGINX_CONTAINER="todo-nginx"

echo "🔒 Setting up Let's Encrypt SSL for domain: $DOMAIN"
echo "📧 Email: $EMAIL"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root for security reasons"
   echo "   Please run as a regular user with sudo privileges"
   exit 1
fi

# Check if domain is provided
if [ "$1" = "your-domain.com" ] || [ -z "$1" ]; then
    echo "❌ Please provide your actual domain name as the first argument"
    echo "   Usage: ./setup-letsencrypt.sh yourdomain.com your-email@example.com"
    exit 1
fi

# Check if email is provided
if [ "$2" = "your-email@example.com" ] || [ -z "$2" ]; then
    echo "❌ Please provide your actual email as the second argument"
    echo "   Usage: ./setup-letsencrypt.sh yourdomain.com your-email@example.com"
    exit 1
fi

echo "📋 Prerequisites check..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if nginx container exists
if ! docker ps -a --format "table {{.Names}}" | grep -q "^${NGINX_CONTAINER}$"; then
    echo "❌ Nginx container '${NGINX_CONTAINER}' not found."
    echo "   Please run 'docker-compose -f docker-compose.prod.yml up -d' first."
    exit 1
fi

# Check if domain resolves to this server
echo "🌐 Checking if domain $DOMAIN resolves to this server..."
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    echo "⚠️  Warning: Domain $DOMAIN resolves to $DOMAIN_IP but this server is $SERVER_IP"
    echo "   Make sure your DNS is pointing to this server before continuing."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Prerequisites check passed!"
echo ""

# Create certs directory if it doesn't exist
mkdir -p ./certs

# Stop nginx container temporarily for standalone mode
echo "🔄 Temporarily stopping nginx container..."
docker stop $NGINX_CONTAINER || true

# Install certbot if not already installed
echo "📦 Installing certbot..."
sudo apt update
sudo apt install -y certbot

# Generate certificate using standalone mode
echo "🔐 Generating SSL certificate for $DOMAIN..."
sudo certbot certonly \
    --standalone \
    --preferred-challenges http \
    -d $DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive \
    --expand

# Copy certificates to project directory
echo "📁 Copying certificates to project directory..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./certs/server.crt
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./certs/server.key

# Set proper permissions
sudo chown $USER:$USER ./certs/server.crt ./certs/server.key
chmod 644 ./certs/server.crt
chmod 600 ./certs/server.key

# Update nginx configuration for SSL
echo "⚙️  Updating nginx configuration for SSL..."
if [ -f "nginx.conf" ]; then
    cp nginx.conf nginx.conf.backup
fi

# Use the SSL-enabled nginx configuration
cp nginx-ssl.conf nginx.conf

# Update the domain in nginx.conf
sed -i "s/server_name _;/server_name $DOMAIN;/g" nginx.conf

# Restart nginx container
echo "🔄 Starting nginx container with SSL configuration..."
docker start $NGINX_CONTAINER

# Wait for nginx to start
sleep 5

# Test SSL configuration
echo "🧪 Testing SSL configuration..."
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200\|301\|302"; then
    echo "✅ SSL setup successful!"
    echo ""
    echo "🎉 Your site is now available at: https://$DOMAIN"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Update your .env.production file with:"
    echo "      SSL_ENABLED=true"
    echo "   2. Set up automatic certificate renewal:"
    echo "      sudo crontab -e"
    echo "      Add: 0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'docker restart $NGINX_CONTAINER'"
    echo ""
    echo "🔒 SSL Grade: Check your SSL configuration at https://www.ssllabs.com/ssltest/"
else
    echo "❌ SSL setup failed. Please check the configuration."
    echo "   You can restore the backup with: cp nginx.conf.backup nginx.conf"
    exit 1
fi