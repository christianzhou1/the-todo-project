# 📝 Spring Boot Todo App

A simple **Todo backend** built with **Spring Boot**, **PostgreSQL**, and **Docker Compose**.  
It provides REST APIs for creating and managing tasks.

---

## 📦 Tech Stack

- **Java 17+**
- **Spring Boot**
  - Spring Web
  - Spring Data JPA
- **PostgreSQL 17**
- **Docker / Docker Compose**
- **Maven**

---

## 🚀 Getting Started

### Build docker compose:

```bash
docker build -t todo-backend . 
```
(remember the dot)

```bash
docker compose up -d
```

### Docker logs:

```bash
docker compose logs -f todo-backend
```

### Hot reload:

```bash
.\mvnw spring-boot:run
```

### Mock Insert Task:

```bash
wget http://localhost:8080/api/tasks/mock -Method POST    
```
