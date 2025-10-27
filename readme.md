---
# Full-Stack Todo Application

A modern **full-stack Todo application** built with **Spring Boot**, **React**, **PostgreSQL**, and **Docker Compose**.
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
- **React Resizable Panels** for layout
- **OpenAPI Generator** for type-safe API client

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
docker compose up -d todo-db
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

Migrations are located in `src/main/resources/db/migration`.

### V1\_\_initial_schema.sql

Defines the `task` table:

- `id uuid PRIMARY KEY`
- `task_name varchar(255) NOT NULL`
- `task_desc text`
- `created_at timestamptz NOT NULL DEFAULT now()`
- `is_completed boolean NOT NULL DEFAULT false`
- `is_delete boolean NOT NULL DEFAULT false`

Optional extensions for DB-side UUIDs:

- `uuid-ossp` for `uuid_generate_v4()`
- `pgcrypto` for `gen_random_uuid()`

Helpful indexes are created on `created_at`, `is_delete`, and `is_completed`.

### V2\_\_seed_mock.sql

Inserts a starter record:

```sql
INSERT INTO task (id, task_name, task_desc, is_completed, is_delete)
VALUES (gen_random_uuid(), 'First task', 'Hello, world', false, false);
```

This requires the `pgcrypto` extension if using `gen_random_uuid()`.

### Flyway Setup

Flyway is enabled in `pom.xml` with:

- `flyway-core`
- `flyway-database-postgresql`

On startup, Flyway automatically applies migrations in order.

---

## API Endpoints

### Authentication

#### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}
```

#### Get Current User

```bash
GET /auth/me
Authorization: Bearer <jwt-token>
```

### Task Management

#### List Tasks

```bash
GET /tasks
X-User-Id: <user-uuid>
Authorization: Bearer <jwt-token>
```

#### Create Task

```bash
POST /tasks
Content-Type: application/json
X-User-Id: <user-uuid>
Authorization: Bearer <jwt-token>

{
  "title": "New Task",
  "description": "Task description",
  "parentTaskId": null
}
```

#### Get Task Detail

```bash
GET /tasks/id/{taskId}/detail
X-User-Id: <user-uuid>
Authorization: Bearer <jwt-token>
```

#### Update Task

```bash
PUT /tasks/id/{taskId}
Content-Type: application/json
X-User-Id: <user-uuid>
Authorization: Bearer <jwt-token>

{
  "title": "Updated Task",
  "description": "Updated description",
  "completed": true
}
```

### File Attachments

#### Upload File

```bash
POST /attachments/upload
Content-Type: multipart/form-data
X-User-Id: <user-uuid>
Authorization: Bearer <jwt-token>

file: <file-data>
```

#### Download File

```bash
GET /attachments/{attachmentId}/download
X-User-Id: <user-uuid>
Authorization: Bearer <jwt-token>
```

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

### API Client Generation

- Backend exposes OpenAPI spec at `/api-docs`
- Frontend generates TypeScript client from this spec
- Run `npm run fetch:api-spec` to download the latest API spec
- Generated client is in `frontend/src/generated/api/`

---

## Features

### ✅ Implemented

- **User Authentication** - JWT-based login system
- **Task Management** - Create, read, update, delete tasks
- **File Attachments** - Upload and download files for tasks
- **Responsive UI** - Modern React frontend with Material-UI
- **API Documentation** - OpenAPI/Swagger integration
- **Database Migrations** - Flyway schema versioning
- **Production Deployment** - Docker containerization
- **Type Safety** - TypeScript frontend with generated API client

### 🚀 Future Enhancements

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
todo/
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
│   ├── db/migration/                # Flyway migrations
│   └── application.yaml             # Application configuration
├── frontend/                        # React frontend
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── services/                # API services
│   │   ├── generated/api/           # Auto-generated API client
│   │   └── config/                  # Frontend configuration
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.ts               # Vite configuration
├── docker-compose.prod.yml          # Docker setup for all environments
├── Dockerfile                       # Backend Docker image
├── Dockerfile.jar                   # JAR-based Docker image
├── frontend/Dockerfile.dev          # Frontend development Docker image
├── nginx.conf                       # Nginx configuration
├── deploy-production.sh             # Deployment script
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

### Architecture

```
┌─────────────────────────────────────────┐
│            VPS (your-vps-ip)            │
│  ┌─────────┐ ┌─────────┐ ┌─────────────┐│
│  │ Frontend│ │ Backend │ │ PostgreSQL  ││
│  │ (Nginx) │ │(Spring) │ │     17      ││
│  │  :80    │ │ :8080   │ │   :5432     ││
│  └─────────┘ └─────────┘ └─────────────┘│
└─────────────────────────────────────────┘
```

### Services

- **PostgreSQL 17**: Database (internal network only)
- **Spring Boot**: Backend API (port 8080)
- **Nginx**: Frontend + Reverse Proxy (port 80)
- **Health Checks**: Proper startup dependencies

### Prerequisites

1. **VPS with Ubuntu 24.04** (1GB RAM, 25GB disk minimum)
2. **Docker and Docker Compose** installed
3. **SSH access** to the VPS
4. **Environment variables** configured in `.env.production`

### Quick Deployment

Use the automated deployment script:

#### Option 1: PowerShell (Windows - Recommended)

```powershell
# Run PowerShell deployment script
.\deploy.ps1.bat

# Or run directly in PowerShell
powershell -ExecutionPolicy Bypass -File deploy-production.ps1
```

#### Option 2: Bash (Linux/macOS/Git Bash)

```bash
# Make script executable
chmod +x deploy-production.sh

# Run deployment
./deploy-production.sh
```

### Manual Deployment Steps

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
- `nginx.conf` - Nginx reverse proxy configuration
- `.env.production` - Environment variables
- `target/todo-0.0.1-SNAPSHOT.jar` - Built backend JAR
- `frontend/dist/` - Built frontend files

#### 3. Upload to VPS

```bash
# Upload configuration files
scp docker-compose.prod.yml your-user@your-vps-ip:/opt/todo-app/
scp Dockerfile.jar your-user@your-vps-ip:/opt/todo-app/
scp nginx.conf your-user@your-vps-ip:/opt/todo-app/
scp .env.production your-user@your-vps-ip:/opt/todo-app/
scp target/todo-0.0.1-SNAPSHOT.jar your-user@your-vps-ip:/opt/todo-app/
scp -r frontend/dist your-user@your-vps-ip:/opt/todo-app/frontend/
```

#### 4. Deploy on VPS

```bash
# SSH into VPS
ssh your-user@your-vps-ip

# Navigate to app directory
cd /opt/todo-app

# Fix file permissions
chmod -R 755 frontend/dist/

# Deploy application (with clean build)
docker-compose -f docker-compose.prod.yml --env-file .env.production build --no-cache
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Environment Variables

Create `.env.production` with the following variables:

```bash
# Database Configuration
DATABASE_URL=jdbc:postgresql://todo-db:5432/todo_prod
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
```

### Access Points

After successful deployment:

- **Frontend**: https://your-vps-ip
- **API**: https://your-vps-ip/api
- **API Docs**: https://your-vps-ip/api/api-docs
- **Health Check**: http://your-vps-ip/health

### Monitoring and Maintenance

#### Check Container Status

```bash
# View running containers
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f todo-backend
```

#### Update Deployment

```bash
# Stop containers
docker-compose -f docker-compose.prod.yml down

# Update files (repeat upload steps)
# ...

# Restart with new files
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

#### Backup Database

```bash
# Create database backup
docker exec todo-db pg_dump -U todo_prod_user todo_prod > backup.sql

# Restore from backup
docker exec -i todo-db psql -U todo_prod_user todo_prod < backup.sql
```

### Troubleshooting

#### Common Issues

1. **403 Forbidden on Frontend**

   ```bash
   # Fix file permissions
   chmod -R 755 /opt/todo-app/frontend/dist/
   docker-compose -f docker-compose.prod.yml restart nginx
   ```

2. **Port 5432 Already in Use**

   ```bash
   # Stop existing PostgreSQL service
   sudo systemctl stop postgresql
   sudo systemctl disable postgresql
   ```

3. **Container Health Check Failed**
   ```bash
   # Check container logs
   docker-compose -f docker-compose.prod.yml logs todo-db
   ```

#### File Transfer Issues

If you need to download updated files from VPS:

```bash
# Download configuration files
scp your-user@your-vps-ip:/opt/todo-app/docker-compose.prod.yml ./
scp your-user@your-vps-ip:/opt/todo-app/nginx.conf ./
scp your-user@your-vps-ip:/opt/todo-app/.env.production ./
scp your-user@your-vps-ip:/opt/todo-app/Dockerfile.jar ./
```

### Security Considerations

- **Strong passwords** for database and JWT secrets
- **Regular updates** of dependencies and base images
- **Firewall configuration** (only ports 80, 443, 22 open)
- **SSL/TLS certificates** for HTTPS (recommended)
- **Regular backups** of database and configuration files

---
