---
# SkySync

A modern **full-stack application** built with **Spring Boot**, **React**, **PostgreSQL**, and **Docker Compose**.
Features user authentication, task management, file attachments, and a responsive web interface. Database schema is versioned using **Flyway**.
---

## Tech Stack

### Backend

- **Java 17+**
- **Spring Boot 3.x**
  - Spring Web
  - Spring Data JPA
  - Spring Security (JWT)
  - Spring Actuator
  - Spring Boot DevTools (hot reload)
- **PostgreSQL 17** in Docker
- **Flyway** for schema and seed migrations
- **Maven Wrapper**
- **OpenAPI 3** (Swagger) documentation

### Frontend

- **React 19** with TypeScript
- **Material-UI (MUI)** for UI components
- **Vite** for build tooling
- **Axios** for API communication
- **React Resizable Panels** for desktop layout
- **OpenAPI Generator** for type-safe API client
- **Mobile-responsive design** with tab-based navigation

### Infrastructure

- **Docker & Docker Compose**
- **Nginx** reverse proxy
- **JWT** authentication
- **File upload** support (local/S3)

---

## Getting Started

### Prerequisites

- **Docker & Docker Compose** (recommended)
- **Java 17+** (for local development)
- **Node.js 20+** (for local frontend development)
- **Maven** (or use included Maven wrapper)

### Option 1: Docker Compose (Recommended)

Start the entire application with Docker Compose:

```bash
# Start all services (database, backend, frontend) with clean build
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop all services
docker compose -f docker-compose.prod.yml down
```

**Access Points:**

- **Frontend**: http://localhost (via Nginx)
- **Backend API**: http://localhost:8080/api
- **API Documentation**: http://localhost:8080/api/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/api/api-docs

### Option 2: Local Development

For development with hot reload:

#### 1\. Start the database

```bash
docker compose up -d skysync-db
```

This runs PostgreSQL in Docker. The container's `5432` port is mapped to host port `5433` to avoid conflicts.

#### 2\. Run the Spring Boot backend

On macOS/Linux:

```bash
./mvnw spring-boot:run
```

On Windows PowerShell:

```bash
.\mvnw spring-boot:run
```

The backend will be available at `http://localhost:8080`

#### 3\. Run the React frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### 4\. Stop services

```bash
# Stop frontend (Ctrl+C)
# Stop backend (Ctrl+C)
docker compose down
```

### Reset Database

To fully reset the database:

```bash
docker volume rm todo_postgres-data
```

---

## Database & Flyway Migrations

Migrations are located in `src/main/resources/db/migration` and include:

- **V1-V3**: Initial task schema and column updates
- **V4-V6**: Attachment system implementation
- **V7-V8**: User authentication system
- **V9-V11**: Many-to-many task-attachment relationships
- **V12-V14**: Performance indexes, parent tasks, and display ordering

### Key Tables

- **`task`**: Main task table with hierarchical support
- **`attachment`**: File attachment storage
- **`users`**: User authentication
- **`task_attachment`**: Many-to-many relationship between tasks and attachments

### Flyway Setup

Flyway is enabled in `pom.xml` with:

- `flyway-core`
- `flyway-database-postgresql`

On startup, Flyway automatically applies migrations in order.

---

## API Endpoints

### Authentication

- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### Task Management

- `GET /tasks` - List all tasks
- `POST /tasks` - Create new task
- `GET /tasks/id/{taskId}/detail` - Get task details
- `PUT /tasks/id/{taskId}` - Update task
- `DELETE /tasks/id/{taskId}` - Delete task

### File Attachments

- `POST /attachments/upload` - Upload file
- `GET /attachments/{attachmentId}/download` - Download file
- `DELETE /attachments/{attachmentId}` - Delete attachment

### API Documentation

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/api-docs
- **Health Check**: http://localhost:8080/actuator/health

---

## Build & Test

### Backend

Package without tests:

```bash
./mvnw -q -DskipTests package
```

Run tests:

```bash
./mvnw test
```

### Frontend

Install dependencies:

```bash
cd frontend
npm install
```

Build for production:

```bash
npm run build
```

Run development server:

```bash
npm run dev
```

Run linting:

```bash
npm run lint
```

### Full Stack Build (Clean Build)

Build both frontend and backend with clean builds:

```bash
# Build backend (clean build)
./mvnw clean
./mvnw package -DskipTests

# Build frontend (clean build)
cd frontend
npm ci
npm run build
cd ..
```

### Docker Clean Build Commands

For production deployments, always use clean builds:

```bash
# Clean Docker build (removes cached layers)
docker-compose -f docker-compose.prod.yml build --no-cache

# Clean Docker build and start
docker-compose -f docker-compose.prod.yml --env-file .env.production up --build

# Clean up old Docker images
docker image prune -f
```

---

## Development Notes

### Backend Development

- Use `spring-boot-devtools` for hot reload during local development
- `System.out.println` outputs from controllers/services will appear in the same terminal where you run `mvnw spring-boot:run`
- Flyway migration versions must increment sequentially (V1, V2, V3, ...)
- To seed or adjust schema, create a new migration instead of editing old ones
- JWT tokens are used for authentication - include `Authorization: Bearer <token>` header
- User ID must be provided in `X-User-Id` header for task operations

### Frontend Development

- Frontend uses Material-UI components with dark theme
- API client is auto-generated from OpenAPI spec using `openapi-generator-cli`
- Run `npm run generate:api` to regenerate API client after backend changes
- Use `npm run generate:api:local` for builds when backend is not running
- TypeScript is used for type safety
- React 19 with modern hooks and functional components
- Mobile-responsive design with conditional rendering based on screen size
- Tab-based navigation for mobile/tablet devices

### API Client Generation

- Backend exposes OpenAPI spec at `/api-docs`
- Frontend generates TypeScript client from this spec
- Run `npm run fetch:api-spec` to download the latest API spec
- Generated client is in `frontend/src/generated/api/`

---

## Features

### Implemented

- **User Authentication** - JWT-based login and registration system
- **Task Management** - Create, read, update, delete tasks with hierarchical support
- **File Attachments** - Upload, download, and delete files for tasks (up to 25MB)
- **Responsive UI** - Modern React frontend with Material-UI, optimized for mobile
- **API Documentation** - OpenAPI/Swagger integration
- **Database Migrations** - Flyway schema versioning with 14+ migrations
- **Production Deployment** - Docker containerization with Nginx reverse proxy
- **Type Safety** - TypeScript frontend with auto-generated API client
- **Mobile Support** - Tab-based navigation and mobile-optimized interface

### Future Enhancements

- **Real-time Updates** - WebSocket integration for live task updates
- **Task Categories** - Organize tasks with tags and categories
- **Due Dates** - Add scheduling and deadline management
- **Collaboration** - Share tasks and collaborate with other users
- **Mobile App** - React Native mobile application
- **Advanced Search** - Full-text search across tasks and attachments
- **Email Notifications** - Task reminders and updates
- **Data Export** - Export tasks to various formats (PDF, CSV)

---

## Project Structure

```
skysync/
├── src/main/java/com/todo/          # Backend source code
│   ├── api/                         # API DTOs and mappers
│   ├── config/                      # Configuration classes
│   ├── controller/                  # REST controllers
│   ├── entity/                      # JPA entities
│   ├── repository/                  # Data repositories
│   ├── security/                    # Security configuration
│   ├── service/                     # Business logic
│   └── storage/                     # File storage services
├── src/main/resources/
│   ├── db/migration/                # Flyway migrations (14+ files)
│   └── application.yaml             # Application configuration
├── frontend/                        # React frontend
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── services/                # API services
│   │   ├── generated/api/           # Auto-generated API client
│   │   └── config/                  # Frontend configuration
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.ts               # Vite configuration
├── docker-compose.prod.yml          # Docker setup for production
├── compose.yaml                     # Docker Compose for local development
├── Dockerfile                       # Backend Docker image (multi-stage build)
├── Dockerfile.jar                   # JAR-based Docker image for production
├── frontend/Dockerfile.dev          # Frontend development Docker image
├── nginx.conf                       # Nginx configuration (HTTP)
├── nginx-ssl.conf                   # Nginx SSL configuration (HTTPS)
├── deploy.ps1                       # PowerShell deployment script (main)
├── deploy-remote.sh                 # Remote deployment script (runs on VPS)
├── start-backend-docker.ps1         # Local Docker Compose startup script
├── .env.production                  # Production environment variables
└── README.md                        # This file
```

### Key Components

- **Backend Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and data processing
- **Entities**: Database table mappings
- **Repositories**: Data access layer
- **Security**: JWT authentication and authorization
- **Frontend Components**: React UI components
- **API Client**: Auto-generated TypeScript client
- **Migrations**: Database schema versioning

---

## Production Deployment

This application can be deployed to a VPS using Docker Compose with the following architecture:

### Services

- **PostgreSQL 17**: Database (internal network only)
- **Spring Boot**: Backend API (port 8080, internal)
- **Nginx**: Frontend + Reverse Proxy (ports 80/443)
- **Health Checks**: Proper startup dependencies

### Prerequisites

1. **VPS with Ubuntu 24.04+**
2. **Docker and Docker Compose** installed on VPS
3. **SSH access** configured to the VPS
4. **Environment variables** configured in `.env.production`
5. **SSL certificates** (if using HTTPS) in `certs/` directory

### Quick Deployment (Automated)

Use the automated PowerShell deployment script:

```powershell
# Basic deployment (builds frontend and backend)
.\deploy.ps1

# Skip frontend build (if already built)
.\deploy.ps1 -SkipFrontendBuild

# Reset remote database (removes all data)
.\deploy.ps1 -ResetRemoteDatabase

# Reset local database (removes local Docker volumes)
.\deploy.ps1 -ResetLocalDatabase

# Combine flags
.\deploy.ps1 -SkipFrontendBuild -ResetRemoteDatabase
```

**What the script does:**

1. **Loads environment variables** from `.env.production`
2. **Optionally resets local database** (if `-ResetLocalDatabase` flag is used)
3. **Builds backend JAR** using Maven
4. **Builds frontend** (unless `-SkipFrontendBuild` is used)
5. **Prepares deployment package** with all necessary files
6. **Configures SSH** using SSH config or keys from `SSH_DIR`
7. **Uploads files** to VPS via SCP
8. **Deploys on VPS** using `deploy-remote.sh` script
   - Stops existing containers
   - Optionally resets database (if `-ResetRemoteDatabase` flag is used)
   - Builds Docker images
   - Starts all services
   - Verifies deployment and shows diagnostics

### Local Development with Docker Compose

For local testing with Docker Compose:

```powershell
# Start backend with Docker Compose using .env.production
.\start-backend-docker.ps1
```

This script:

- Creates Docker network if needed
- Builds backend Docker image
- Starts database and backend containers
- Follows backend logs

**Access Points (Local):**

- **Backend API**: http://localhost:8080/api
- **Database**: localhost:5433
- **API Docs**: http://localhost:8080/api/api-docs

### Manual Deployment Steps (Alternative)

If you prefer manual deployment:

#### 1. Build Frontend and Backend

```bash
# Build backend JAR (clean build)
./mvnw clean
./mvnw package -DskipTests

# Build frontend (clean build)
cd frontend
npm ci
npm run build
cd ..
```

#### 2. Prepare Files for Upload

Ensure you have these files ready:

- `docker-compose.prod.yml` - Production Docker setup
- `Dockerfile.jar` - JAR-based backend container
- `nginx-ssl.conf` or `nginx.conf` - Nginx configuration (SSL preferred)
- `.env.production` - Environment variables
- `target/todo-0.0.1-SNAPSHOT.jar` - Built backend JAR
- `frontend/dist/` - Built frontend files
- `certs/` - SSL certificates (if using HTTPS)

#### 3. Upload to VPS

```bash
# Upload configuration files
scp docker-compose.prod.yml your-user@your-vps-ip:/opt/skysync-app/
scp Dockerfile.jar your-user@your-vps-ip:/opt/skysync-app/
scp nginx-ssl.conf your-user@your-vps-ip:/opt/skysync-app/nginx.conf
scp .env.production your-user@your-vps-ip:/opt/skysync-app/
scp target/todo-0.0.1-SNAPSHOT.jar your-user@your-vps-ip:/opt/skysync-app/
scp -r frontend/dist your-user@your-vps-ip:/opt/skysync-app/frontend/
scp -r certs your-user@your-vps-ip:/opt/skysync-app/  # If using SSL
```

#### 4. Deploy on VPS

```bash
# SSH into VPS
ssh your-user@your-vps-ip

# Navigate to app directory
cd /opt/skysync-app

# Create Docker network
docker network create skysync-net 2>/dev/null || true

# Stop existing containers
docker compose -f docker-compose.prod.yml --env-file .env.production down

# Fix file permissions
chmod -R 755 frontend/dist/

# Deploy application (with clean build)
docker compose -f docker-compose.prod.yml --env-file .env.production build --no-cache
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Environment Variables

Create `.env.production` with the following variables:

```bash
# Database Configuration
DATABASE_URL=jdbc:postgresql://skysync-db:5432/todo_prod
DATABASE_USERNAME=todo_prod_user
DATABASE_PASSWORD=YourStrongPassword123!

# JWT Configuration
JWT_SECRET=your-64-character-jwt-secret-key-here

# AWS Configuration (if using S3)
AWS_REGION=us-east-2
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name
S3_PREFIX=attachments

# Application Configuration
SERVER_PORT=8080
STORAGE_TYPE=s3
MAX_FILE_SIZE=25MB
MAX_REQUEST_SIZE=25MB

# VPS Configuration
VPS_USER=root
VPS_IP=your-server-ip
APP_DIR=/opt/skysync-app/
VPS_HOST=your-ssh-hostname
SSH_DIR=C:\Users\YourName\.ssh  # Windows path to SSH directory
```

**Note:** The `VPS_HOST` can be a hostname from your SSH config file, or an IP address. The script will use SSH config and keys from `SSH_DIR` if specified.

### Access Points

After successful deployment:

- **Frontend (HTTPS)**: https://your-domain.com or https://your-vps-ip
- **Frontend (HTTP)**: http://your-vps-ip
- **API**: https://your-domain.com/api or http://your-vps-ip/api
- **API Docs**: https://your-domain.com/api/api-docs
- **Health Check**: http://your-vps-ip/health

**Note:** If using a domain name with SSL, ensure:

1. DNS A record points to your VPS IP
2. SSL certificates are in `certs/server.crt` and `certs/server.key`
3. `nginx-ssl.conf` is used (automatically selected by deploy script)

### Monitoring and Maintenance

#### Check Container Status

```bash
# View running containers
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f skysync-backend
```

#### Update Deployment

Simply run the deploy script again:

```powershell
# Standard update (rebuilds everything)
.\deploy.ps1

# Quick update (skip frontend build if unchanged)
.\deploy.ps1 -SkipFrontendBuild
```

The script automatically:

- Stops existing containers
- Uploads new files
- Rebuilds Docker images
- Restarts services

**Manual update on VPS:**

```bash
# SSH into VPS
ssh your-user@your-vps-ip
cd /opt/skysync-app

# Stop containers
docker compose -f docker-compose.prod.yml --env-file .env.production down

# Update files (upload new versions)
# ...

# Restart with new files
docker compose -f docker-compose.prod.yml --env-file .env.production build --no-cache
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

#### Backup Database

```bash
# Create database backup
docker exec skysync-db pg_dump -U todo_prod_user todo_prod > backup.sql

# Restore from backup
docker exec -i skysync-db psql -U todo_prod_user todo_prod < backup.sql
```

### Troubleshooting

#### Common Issues

1. **Database Password Authentication Failed**

   ```powershell
   # Reset remote database with correct password
   .\deploy.ps1 -ResetRemoteDatabase
   ```

   Or manually on server:

   ```bash
   cd /opt/skysync-app
   docker compose -f docker-compose.prod.yml --env-file .env.production down
   docker volume rm $(docker volume ls -q | grep postgres-data)
   docker compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```

2. **Site Refuses to Connect**

   - Check if nginx container is running: `docker ps | grep nginx`
   - Check nginx logs: `docker logs skysync-nginx`
   - Verify firewall allows ports 80/443: `sudo ufw status`
   - Check if frontend files exist: `ls -la /opt/skysync-app/frontend/dist/`

3. **Domain Not Working (HTTPS)**

   - Verify SSL certificates exist: `ls -la /opt/skysync-app/certs/`
   - Check nginx config uses SSL: `grep ssl_certificate /opt/skysync-app/nginx.conf`
   - Verify DNS points to server: `dig your-domain.com`
   - Check nginx logs for SSL errors: `docker logs skysync-nginx`

4. **403 Forbidden on Frontend**

   ```bash
   # Fix file permissions
   chmod -R 755 /opt/skysync-app/frontend/dist/
   docker compose -f docker-compose.prod.yml restart skysync-nginx
   ```

5. **SSH Connection Failed**

   - Verify SSH config: Check `~/.ssh/config` or `SSH_DIR/config`
   - Test SSH connection: `ssh your-vps-host "echo 'OK'"`
   - Check SSH key permissions: `chmod 600 ~/.ssh/your-key`

#### File Transfer Issues

If you need to download updated files from VPS:

```bash
# Download configuration files
scp your-user@your-vps-ip:/opt/skysync-app/docker-compose.prod.yml ./
scp your-user@your-vps-ip:/opt/skysync-app/nginx.conf ./
scp your-user@your-vps-ip:/opt/skysync-app/.env.production ./
scp your-user@your-vps-ip:/opt/skysync-app/Dockerfile.jar ./
```

### Security Considerations

- **Strong passwords** for database and JWT secrets
- **Regular updates** of dependencies and base images
- **Firewall configuration** (only ports 80, 443, 22 open)
- **SSL/TLS certificates** for HTTPS (recommended)
- **Regular backups** of database and configuration files

---
