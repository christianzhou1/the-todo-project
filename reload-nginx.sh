#!/bin/bash

# SCP the nginx config to server
echo "Uploading nginx.conf to server..."
scp nginx.conf user@your-server:/path/to/your/project/

# SSH into server and reload nginx
echo "Reloading nginx configuration..."
ssh user@your-server "cd /path/to/your/project && docker-compose exec nginx nginx -s reload"

echo "Nginx configuration reloaded successfully!"
echo "Testing maintenance mode..."
curl -I http://todo.christianzhou.com
