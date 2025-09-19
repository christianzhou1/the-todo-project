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

### Rebuild docker compose:

docker build -t todo-backend . (remember the dot)
docker compose up -d

### Docker logs:

docker compose logs -f todo-backend

### Mock Insert Task:

wget http://localhost:8080/api/tasks/mock -Method POST    
