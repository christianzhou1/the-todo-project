#!/bin/bash

# Let's Encrypt SSL Certificate Setup for Production
# This script sets up SSL certificates using Let's Encrypt

DOMAIN="${1:-your-domain.com}"
EMAIL="${2:-your-email@example.com}"

echo "Setting up Let's Encrypt SSL for domain: $DOMAIN"
echo "Email: $EMAIL"

# Install certbot
sudo apt update
sudo apt install -y certbot

# Generate certificate
sudo certbot certonly --standalone -d $DOMAIN --email $EMAIL --agree-tos --non-interactive

# Copy certificates to project directory
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./certs/server.crt
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./certs/server.key

# Set proper permissions
sudo chown $USER:$USER ./certs/server.crt ./certs/server.key
chmod 644 ./certs/server.crt
chmod 600 ./certs/server.key

echo "Let's Encrypt certificates installed!"
echo "Update your .env.production with:"
echo "SSL_ENABLED=true"
