#!/bin/bash

# Start Spring Boot backend with .env.production
echo "Loading .env.production and starting Spring Boot backend..."

# Load environment variables from .env.production
if [ -f .env.production ]; then
    echo "📋 Loading environment variables from .env.production..."
    set -a  # automatically export all variables
    source .env.production
    set +a  # stop automatically exporting
else
    echo "⚠️  Warning: .env.production file not found!"
    exit 1
fi

# Start Spring Boot
echo "🚀 Starting Spring Boot backend..."
./mvnw spring-boot:run
