# Running the Todo Application

This guide explains how to run the Todo application using Docker Compose with the standardized `.env.production` configuration. Both local development and production use the same Docker Compose file and identical commands.

## Prerequisites

1. **Create your `.env.production` file**:
   ```bash
   cp env.example .env.production
   ```
   Then fill in your actual values.

## Local Development

Run the application locally using Docker Compose.

### Steps:

1. **Run the development environment**:

   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production up --build
   ```

2. **Access the application**:
   - API: http://localhost:8080/api
   - Frontend: http://localhost (via Nginx)
   - API Docs: http://localhost:8080/api/api-docs

### Configuration:

- Database: `todo-db:5432` (internal Docker network)
- Application: Docker container
- Environment: Uses `.env.production` file

## Production Deployment

Deploy to your VPS server using the same Docker Compose approach.

### Steps:

1. **Deploy to production**:

   ```powershell
   .\deploy.ps1
   ```

2. **Access the application**:
   - Your app: https://your-vps-ip
   - API: https://your-vps-ip/api

### Configuration:

- Database: `todo-db:5432` (internal Docker network)
- Application: Docker container
- Environment: Uses `.env.production` file

## Database Configuration

Both local and production environments use the same Docker network configuration:

- Database: `todo-db:5432` (internal Docker network)
- Consistent across all environments

## Environment Variables

All scenarios use the same `.env.production` file with these key variables:

```bash
# Database
DATABASE_URL=jdbc:postgresql://todo-db:5432/todo_prod
DATABASE_USERNAME=todo_prod_user
DATABASE_PASSWORD=YourStrongPassword123!

# JWT
JWT_SECRET=your-64-character-jwt-secret-key-here

# AWS (for S3 storage)
AWS_REGION=us-east-2
AWS_ACCESS_KEY=your-aws-access-key
AWS_SECRET_KEY=your-aws-secret-key
S3_BUCKET_NAME=your-s3-bucket-name
S3_PREFIX=attachments

# Application
SERVER_PORT=8080
STORAGE_TYPE=s3
MAX_FILE_SIZE=25MB
MAX_REQUEST_SIZE=25MB
```

## Quick Start Commands

```bash
# Local development (with clean build)
docker-compose -f docker-compose.prod.yml --env-file .env.production up --build

# Production deployment (with clean build)
.\deploy.ps1

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## Benefits of This Approach

- ✅ **Single Docker Compose file** for all environments
- ✅ **Identical commands** for local and production
- ✅ **Same configuration** across all environments
- ✅ **No environment-specific** database URLs
- ✅ **Consistent Docker networking** everywhere
- ✅ **Simplified deployment** process
- ✅ **Reduced maintenance** overhead
