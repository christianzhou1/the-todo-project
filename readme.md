---

# Spring Boot Todo App

A simple **Todo backend** built with **Spring Boot**, **PostgreSQL**, and **Docker Compose**.  
It provides REST APIs for creating and managing tasks. Database schema is versioned using **Flyway**.

---

## Tech Stack

-   **Java 17+**
    
-   **Spring Boot**
    
    -   Spring Web
        
    -   Spring Data JPA
        
    -   Spring Actuator
        
    -   Spring Boot DevTools (hot reload)
        
-   **PostgreSQL 17** in Docker
    
-   **Flyway** for schema and seed migrations
    
-   **Maven Wrapper**
    

---

## Getting Started

### 1\. Create network and volume (first run only)

```bash
docker network create todo-net
```

- this is for if you want to explicitly define the volume - otherwise, do not run this, and check `docker volume ls` after everything's built to see what the current volumes are

```bash
docker volume create postgres-data
```

### 2\. Start the database container

```bash
docker compose up -d todo-db
```

This runs PostgreSQL in Docker. The container’s `5432` port is mapped to host port `5433` to avoid conflicts.  
The Spring Boot app connects using:

```bash
jdbc:postgresql://localhost:5433/todo_db
```

with user `user-todo` and password `todo123`.

### 3\. Run the Spring Boot backend (with hot reload)

On macOS/Linux:

```bash
./mvnw spring-boot:run
```

On Windows PowerShell:

```bash
.\mvnw spring-boot:run
```

The app will be available at `http://localhost:8080/api/tasks`.

### 4\. Stop services

```bash
docker compose down
```

This stops the container but preserves data in the Docker volume.  
To fully reset the database, remove the volume:

```bash
docker volume rm todo_postgres-data
```

---

## Database & Flyway Migrations

Migrations are located in `src/main/resources/db/migration`.

### V1\_\_initial\_schema.sql

Defines the `task` table:

-   `id uuid PRIMARY KEY`
    
-   `task_name varchar(255) NOT NULL`
    
-   `task_desc text`
    
-   `created_at timestamptz NOT NULL DEFAULT now()`
    
-   `is_completed boolean NOT NULL DEFAULT false`
    
-   `is_delete boolean NOT NULL DEFAULT false`
    

Optional extensions for DB-side UUIDs:

-   `uuid-ossp` for `uuid_generate_v4()`
    
-   `pgcrypto` for `gen_random_uuid()`
    

Helpful indexes are created on `created_at`, `is_delete`, and `is_completed`.

### V2\_\_seed\_mock.sql

Inserts a starter record:

```sql
INSERT INTO task (id, task_name, task_desc, is_completed, is_delete)
VALUES (gen_random_uuid(), 'First task', 'Hello, world', false, false);
```

This requires the `pgcrypto` extension if using `gen_random_uuid()`.

### Flyway Setup

Flyway is enabled in `pom.xml` with:

-   `flyway-core`
    
-   `flyway-database-postgresql`
    

On startup, Flyway automatically applies migrations in order.

---

## API Endpoints

### List all tasks

```bash
GET http://localhost:8080/api/tasks
```

### Insert a mock task

PowerShell:

```bash
wget http://localhost:8080/api/tasks/mock -Method POST
```

cURL:

```bash
curl -X POST http://localhost:8080/api/tasks/mock
```

### Example response

```json
{
  "id": "a74e3398-1c49-419c-8818-3d77a1b7f2ec",
  "title": "Mock Task",
  "completed": false,
  "createdAt": "2025-09-19T06:07:08.363421911Z"
}
```

---

## Build & Test

Package without tests:

```bash
./mvnw -q -DskipTests package
```

Run tests:

```bash
./mvnw test
```

---

## Development Notes

-   Use `spring-boot-devtools` for hot reload during local development.
    
-   `System.out.println` outputs from controllers/services will appear in the same terminal where you run `mvnw spring-boot:run`.
    
-   Flyway migration versions must increment sequentially (V1, V2, V3, ...).
    
-   To seed or adjust schema, create a new migration instead of editing old ones.
    

---

## Next Steps

-   Implement full CRUD for tasks (create, update, delete).
    
-   Add request validation and error handling.
    
-   Provide OpenAPI/Swagger documentation for easier API testing.
    
-   Optionally build a simple frontend client.
    

---
