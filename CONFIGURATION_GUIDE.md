# Configuration Guide

This document explains the standardized configuration setup for the Todo application, which now uses a single `.env.production` file for both local development and production deployment.

## Environment Variables

All configuration is now centralized in the `.env.production` file. Copy `env.example` to `.env.production` and fill in your actual values.

### Required Environment Variables

#### Database Configuration (REQUIRED)

- `DATABASE_URL`: PostgreSQL connection URL (e.g., `jdbc:postgresql://todo-db:5432/todo_prod`)
- `DATABASE_USERNAME`: Database username (e.g., `todo_prod_user`)
- `DATABASE_PASSWORD`: Database password (e.g., `YourStrongPassword123!`)

**⚠️ SECURITY WARNING**: These values have NO fallbacks. The application will crash if not set.

#### JWT Configuration (REQUIRED)

- `JWT_SECRET`: 64-character secret key for JWT token signing

**⚠️ SECURITY WARNING**: This value has NO fallback. The application will crash if not set.

#### AWS Configuration (REQUIRED for S3 storage)

- `AWS_REGION`: AWS region (default: `us-east-2`)
- `AWS_ACCESS_KEY`: AWS access key ID
- `AWS_SECRET_KEY`: AWS secret access key
- `S3_BUCKET_NAME`: S3 bucket name for file storage
- `S3_PREFIX`: S3 key prefix (default: `attachments`)

**⚠️ SECURITY WARNING**: AWS credentials have NO fallbacks. The application will crash if not set.

#### Application Configuration

- `SERVER_PORT`: Server port (default: `8080`)
- `STORAGE_TYPE`: Storage type - use `s3` for both local and production
- `MAX_FILE_SIZE`: Maximum file upload size (default: `25MB`)
- `MAX_REQUEST_SIZE`: Maximum request size (default: `25MB`)

#### VPS Deployment Configuration

- `VPS_USER`: VPS username for deployment
- `VPS_IP`: VPS IP address
- `VPS_HOST`: SSH config host alias (default: `digital-ocean`)
- `APP_DIR`: Application directory on VPS (default: `/opt/todo-app`)

#### Frontend Configuration

- `VITE_API_BASE_URL`: Frontend API base URL (default: `http://localhost:8080/api`)

## Configuration Consistency

### What Changed

1. **Standardized Environment Variable Names**: All configurations now use consistent variable names:

   - `DATABASE_URL` instead of `SPRING_DATASOURCE_URL`
   - `DATABASE_USERNAME` instead of `SPRING_DATASOURCE_USERNAME`
   - `DATABASE_PASSWORD` instead of `SPRING_DATASOURCE_PASSWORD`

2. **Unified Database Configuration**: Both local and production now use:

   - Database name: `todo_prod`
   - Username: `todo_prod_user`
   - Password: `YourStrongPassword123!`

3. **Consistent Storage Type**: Both environments default to S3 storage (`STORAGE_TYPE=s3`)

4. **Single Environment File**: All scripts and configurations now reference `.env.production`

### Files Updated

- `src/main/resources/application.yaml`: Updated to use standardized environment variable names
- `docker-compose.prod.yml`: Updated environment variable names and defaults
- `compose.yaml`: Updated environment variable names and defaults
- `start.ps1`: Updated to load from `.env.production`
- `env.example`: Updated with all required variables and consistent defaults

## Usage

### Local Development

1. Copy `env.example` to `.env.production`
2. Fill in your actual values (especially AWS credentials and JWT secret)
3. **CRITICAL**: Ensure all required variables are set - the app will crash if any are missing
4. Run the application using Docker Compose:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production up --build
   ```

### Production Deployment

1. Ensure your `.env.production` file has all production values
2. Run the deployment script:

#### Option 1: PowerShell (Windows - Recommended)

```powershell
# Run via batch wrapper
.\deploy.ps1.bat

# Or run directly in PowerShell
powershell -ExecutionPolicy Bypass -File deploy-production.ps1
```

#### Option 2: Bash (Linux/macOS/Git Bash)

```bash
# Make executable and run
chmod +x deploy-production.sh
./deploy-production.sh
```

### Docker Compose

Both development and production use the same Docker Compose file (`docker-compose.prod.yml`) with identical commands and environment variable names, ensuring complete consistency across environments.

## Benefits

- **Consistency**: Same configuration structure for local and production
- **Simplicity**: Single environment file to manage
- **Maintainability**: Easier to keep configurations in sync
- **Deployment**: Reduced configuration drift between environments
