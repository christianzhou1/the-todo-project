#!/bin/bash

# Let's Encrypt Certificate Renewal Script
# This script renews SSL certificates and restarts nginx

set -e

NGINX_CONTAINER="todo-nginx"
DOMAIN="${1:-todo.christianzhou.com}"

echo "🔄 Checking certificate renewal for $DOMAIN..."

# Check if certificate needs renewal (within 30 days)
if certbot certificates | grep -q "$DOMAIN"; then
    echo "📋 Current certificate status:"
    certbot certificates | grep -A 10 "$DOMAIN"
    
    # Attempt renewal
    echo "🔄 Attempting certificate renewal..."
    if sudo certbot renew --quiet; then
        echo "✅ Certificate renewal successful!"
        
        # Copy renewed certificates
        echo "📁 Copying renewed certificates..."
        sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./certs/server.crt
        sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./certs/server.key
        
        # Set proper permissions
        sudo chown $USER:$USER ./certs/server.crt ./certs/server.key
        chmod 644 ./certs/server.crt
        chmod 600 ./certs/server.key
        
        # Restart nginx to load new certificates
        echo "🔄 Restarting nginx container..."
        docker restart $NGINX_CONTAINER
        
        echo "✅ Certificate renewal completed successfully!"
    else
        echo "ℹ️  Certificate does not need renewal yet."
    fi
else
    echo "❌ No certificate found for domain $DOMAIN"
    echo "   Run ./setup-letsencrypt.sh $DOMAIN your-email@example.com first"
    exit 1
fi
