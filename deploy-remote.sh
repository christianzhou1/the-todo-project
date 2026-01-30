#!/bin/bash
set -e

APP_DIR="$1"
RESET_DB="$2"

cd "$APP_DIR" || exit 1

# Aggressively stop and remove all related containers
echo "Stopping and removing all containers..."
docker stop skysync-backend skysync-db skysync-nginx 2>/dev/null || true
docker rm skysync-backend skysync-db skysync-nginx 2>/dev/null || true

# Also stop via docker compose if it exists
docker compose -f docker-compose.prod.yml --env-file .env.production down -v 2>/dev/null || true

# Check if PostgreSQL is running on host and stop it (port 5432 conflict)
echo "Checking for host PostgreSQL service..."
if systemctl is-active --quiet postgresql 2>/dev/null; then
    echo "WARNING: PostgreSQL service is running on host. Stopping it to avoid port conflict..."
    systemctl stop postgresql 2>/dev/null || true
    systemctl disable postgresql 2>/dev/null || true
    echo "Host PostgreSQL stopped"
elif pgrep -x postgres >/dev/null 2>&1; then
    echo "WARNING: PostgreSQL process found. Killing it to avoid port conflict..."
    pkill -9 postgres 2>/dev/null || true
    sleep 2
fi

# Check if port 5432 is still in use
if command -v lsof >/dev/null 2>&1; then
    if lsof -i :5432 >/dev/null 2>&1; then
        echo "WARNING: Port 5432 is still in use. Attempting to free it..."
        lsof -ti :5432 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
elif command -v netstat >/dev/null 2>&1; then
    if netstat -tlnp 2>/dev/null | grep -q ':5432 '; then
        echo "WARNING: Port 5432 is still in use. Attempting to free it..."
        PID=$(netstat -tlnp 2>/dev/null | grep ':5432 ' | awk '{print $7}' | cut -d'/' -f1 | head -1)
        if [ -n "$PID" ]; then
            kill -9 "$PID" 2>/dev/null || true
            sleep 2
        fi
    fi
fi

# Create network if it doesn't exist
docker network create skysync-net 2>/dev/null || true

# Verify .env.production file exists and is readable
echo "Verifying .env.production file..."
if [ ! -f .env.production ]; then
    echo "ERROR: .env.production file not found in current directory"
    echo "Current directory: $(pwd)"
    echo "Files in directory:"
    ls -la
    exit 1
fi

# Verify key environment variables exist
if ! grep -q "^DATABASE_PASSWORD=" .env.production; then
    echo "ERROR: DATABASE_PASSWORD not found in .env.production"
    exit 1
fi

echo "[OK] .env.production file verified"

# Reset database if requested (removes volume to fix password issues)
if [ "$RESET_DB" = "true" ]; then
    echo "Resetting database (removing ALL postgres volumes to fix password authentication)..."
    echo "Listing all volumes:"
    docker volume ls
    
    # Find and remove all postgres-related volumes
    POSTGRES_VOLUMES=$(docker volume ls -q | grep -E '(postgres|skysync|todo)' || echo "")
    if [ -n "$POSTGRES_VOLUMES" ]; then
        echo "Found volumes to remove:"
        echo "$POSTGRES_VOLUMES"
        echo "$POSTGRES_VOLUMES" | xargs -r docker volume rm 2>/dev/null || true
        echo "Database volumes removed. Will be recreated with password from .env.production"
    else
        echo "No postgres-related volumes found to remove"
    fi
    
    # Also try to remove by name patterns
    docker volume rm skysync-app_postgres-data 2>/dev/null || true
    docker volume rm todo_postgres-data 2>/dev/null || true
    docker volume rm postgres-data 2>/dev/null || true
fi

# Build and start services
echo "Building and starting services with .env.production..."
echo "Current directory: $(pwd)"
echo "Files present:"
ls -la

# Verify no old containers are running
echo "Checking for any remaining containers..."
REMAINING=$(docker ps -a --filter "name=skysync" --format "{{.Names}}" 2>/dev/null || echo "")
if [ -n "$REMAINING" ]; then
    echo "WARNING: Found remaining containers, force removing..."
    echo "$REMAINING" | xargs -r docker rm -f 2>/dev/null || true
fi

docker compose -f docker-compose.prod.yml --env-file .env.production build --no-cache
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# Wait a moment for services to start
sleep 10

# Check if backend started successfully
BACKEND_STATUS=$(docker ps --filter "name=skysync-backend" --format "{{.Status}}")
if echo "$BACKEND_STATUS" | grep -q "Exited"; then
    echo ""
    echo "WARNING: Backend container exited. Checking logs..."
    docker logs skysync-backend --tail 20
    echo ""
    echo "If you see 'password authentication failed', the database password doesn't match."
    echo "To fix: Remove the database volume and redeploy:"
    echo "  docker compose -f docker-compose.prod.yml --env-file .env.production down"
    echo "  docker volume rm \$(docker volume ls -q | grep 'postgres-data')"
    echo "  docker compose -f docker-compose.prod.yml --env-file .env.production up -d"
fi

# Show status
echo ""
echo "Container status:"
docker compose -f docker-compose.prod.yml ps

# Check if nginx is running
echo ""
echo "Checking nginx container..."
NGINX_STATUS=$(docker ps --filter "name=skysync-nginx" --format "{{.Status}}" 2>/dev/null || echo "")
if [ -z "$NGINX_STATUS" ]; then
    echo "WARNING: Nginx container is not running!"
    echo "Checking nginx logs..."
    docker logs skysync-nginx --tail 20 2>/dev/null || echo "Cannot access nginx logs"
else
    echo "[OK] Nginx is running: $NGINX_STATUS"
fi

# Check if frontend files exist
echo ""
echo "Checking frontend files..."
if [ -d "frontend/dist" ]; then
    FILE_COUNT=$(find frontend/dist -type f | wc -l)
    echo "[OK] Frontend dist directory exists with $FILE_COUNT files"
    if [ "$FILE_COUNT" -eq 0 ]; then
        echo "WARNING: Frontend dist directory is empty!"
    fi
else
    echo "ERROR: Frontend dist directory not found!"
    echo "This will cause nginx to fail. Make sure frontend was built and uploaded."
fi

# Check SSL certificates if nginx-ssl.conf is being used
echo ""
echo "Checking nginx configuration..."
if grep -q "ssl_certificate" nginx.conf 2>/dev/null; then
    echo "Nginx is configured for HTTPS (SSL)"
    if [ -f "certs/server.crt" ] && [ -f "certs/server.key" ]; then
        echo "[OK] SSL certificates found"
        # Check certificate validity
        if command -v openssl >/dev/null 2>&1; then
            CERT_SUBJECT=$(openssl x509 -in certs/server.crt -noout -subject 2>/dev/null | cut -d'=' -f2-)
            CERT_EXPIRY=$(openssl x509 -in certs/server.crt -noout -enddate 2>/dev/null | cut -d'=' -f2-)
            echo "  Certificate subject: $CERT_SUBJECT"
            echo "  Certificate expires: $CERT_EXPIRY"
        fi
    else
        echo "ERROR: SSL certificates not found!"
        echo "  Expected: certs/server.crt and certs/server.key"
        echo "  HTTPS will not work without certificates."
    fi
else
    echo "Nginx is configured for HTTP only"
fi

# Check port accessibility
echo ""
echo "Checking if ports are accessible..."
echo "Port 80 (HTTP):"
docker port skysync-nginx 2>/dev/null | grep 80 || echo "  Port 80 not mapped"
echo "Port 443 (HTTPS):"
docker port skysync-nginx 2>/dev/null | grep 443 || echo "  Port 443 not mapped"

# Check if ports are listening
echo ""
echo "Checking if ports are listening on host..."
if command -v netstat >/dev/null 2>&1; then
    netstat -tlnp 2>/dev/null | grep ':80 ' || echo "  Port 80 not listening"
    netstat -tlnp 2>/dev/null | grep ':443 ' || echo "  Port 443 not listening"
elif command -v ss >/dev/null 2>&1; then
    ss -tlnp 2>/dev/null | grep ':80 ' || echo "  Port 80 not listening"
    ss -tlnp 2>/dev/null | grep ':443 ' || echo "  Port 443 not listening"
fi

# Check firewall status (if ufw is installed)
if command -v ufw >/dev/null 2>&1; then
    echo ""
    echo "Checking firewall (ufw) status:"
    ufw status | head -5
    echo ""
    echo "If ports 80/443 are blocked, run: sudo ufw allow 80/tcp && sudo ufw allow 443/tcp"
fi

echo ""
echo "Deployment complete!"
echo ""
echo "Troubleshooting tips:"
echo "1. Check nginx logs: docker logs skysync-nginx"
echo "2. Check backend logs: docker logs skysync-backend"
echo "3. Verify firewall allows ports 80 and 443"
echo "4. If using IP address, nginx server_name might need to be '_' instead of domain name"

