#!/bin/bash

echo "Starting Todo Application..."
echo

# Check if .env.production exists
if [ -f .env.production ]; then
    echo "Found .env.production - loading environment variables"
    
    # Load environment variables from .env.production
    set -a  # automatically export all variables
    source .env.production
    set +a  # stop automatically exporting
    
    echo "Environment variables loaded from .env.production"
else
    echo "No .env.production file found - using system environment variables"
fi

echo
echo "Starting Spring Boot application..."

# Start the application
./mvnw spring-boot:run

echo
echo "Application stopped."
