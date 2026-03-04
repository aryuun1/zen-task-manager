# Task Tracker API

A RESTful Task Tracker backend built with Node.js, TypeScript, Express, MongoDB, and Redis.

---

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **Database:** MongoDB (via Mongoose)
- **Cache:** Redis
- **Auth:** JWT + bcryptjs
- **Testing:** Jest + Supertest + mongodb-memory-server

---

## Prerequisite

Make sure you have the following installed/running:

- Node.js >= 18
- MongoDB (running on port `27017`)
- Redis (running on port `6379`)

> If using Docker, see the [Docker Setup](#docker-setup) section below.

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd task-back
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values (see [Environment Variables](#environment-variables) below).

### 4. Start the development server

```bash
npm run dev
```

You should see:

```text
MongoDB connected
Redis connected
Server running on port 3000
```

---

## Environment Variables

| Variable         | Description                        | Example                                 |
|------------------|------------------------------------|-----------------------------------------|
| `PORT`           | Port the server listens on         | `3000`                                  |
| `MONGO_URI`      | MongoDB connection string          | `mongodb://localhost:27017/tasktracker` |
| `REDIS_URL`      | Redis connection URL               | `redis://localhost:6379`                |
| `JWT_SECRET`     | Secret key for signing JWT tokens  | `change_this_to_a_long_random_string`   |
| `JWT_EXPIRES_IN` | JWT token expiry duration          | `7d`                                    |

See `.env.example` for a template.

---

## Scripts

| Command                  | Description                          |
|--------------------------|--------------------------------------|
| `npm run dev`            | Start dev server with hot reload     |
| `npm run build`          | Compile TypeScript to `dist/`        |
| `npm start`              | Run compiled production build        |
| `npm test`               | Run all tests                        |
| `npm run test:coverage`  | Run tests with coverage report       |

---

## API Reference

### Auth

| Method | Endpoint            | Description         | Auth Required |
|--------|---------------------|---------------------|---------------|
| POST   | `/api/auth/signup`  | Register a new user | No            |
| POST   | `/api/auth/login`   | Login, returns JWT  | No            |

#### POST `/api/auth/signup`

**Request body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `201`:**

```json
{
  "token": "<jwt>",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }
}
```

---

#### POST `/api/auth/login`

**Request body:**

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `200`:**

```json
{
  "token": "<jwt>",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }
}
```

---

### Tasks

All task endpoints require the `Authorization: Bearer <token>` header.

| Method | Endpoint           | Description                      |
|--------|--------------------|----------------------------------|
| GET    | `/api/tasks`       | Get all tasks for logged-in user |
| POST   | `/api/tasks`       | Create a new task                |
| PUT    | `/api/tasks/:id`   | Update a task by ID              |
| DELETE | `/api/tasks/:id`   | Delete a task by ID              |

#### Query Parameters for `GET /api/tasks`

| Param     | Type   | Description                        |
|-----------|--------|------------------------------------|
| `status`  | string | Filter by `pending` or `completed` |
| `dueDate` | string | Filter by due date (`YYYY-MM-DD`)  |

**Example:** `GET /api/tasks?status=pending`

---

#### POST `/api/tasks`

**Request body:**

```json
{
  "title": "Finish assignment",
  "description": "Complete the task tracker API",
  "status": "pending",
  "dueDate": "2026-03-10"
}
```

**Response `201`:**

```json
{
  "_id": "...",
  "title": "Finish assignment",
  "description": "Complete the task tracker API",
  "status": "pending",
  "dueDate": "2026-03-10T00:00:00.000Z",
  "owner": "...",
  "createdAt": "..."
}
```

---

## Redis Caching Strategy

- `GET /api/tasks` results are cached per user with key `tasks:<userId>`
- Cache TTL: **60 seconds**
- Cache is **invalidated** on every `POST`, `PUT`, or `DELETE` task operation
- This ensures users always get fresh data after any mutation

---

## Project Structure

```text
src/
├── config/         # DB and Redis connection setup
├── controllers/    # Route handler logic
├── middleware/     # JWT auth middleware
├── models/         # Mongoose schemas
├── routes/         # Express route definitions
├── types/          # TypeScript type extensions
├── app.ts          # Express app setup
└── server.ts       # Server entry point
tests/              # Jest unit + integration tests
```

---

## Docker Setup

Spin up MongoDB and Redis using Docker Compose:

```bash
docker-compose up -d
```

This starts:

- MongoDB on port `27017`
- Redis on port `6379`
- API server on port `3000`

---

## Running Tests

```bash
# Run all tests
npm test

# With coverage report
npm run test:coverage
```

Tests use `mongodb-memory-server` (in-memory MongoDB) and mock Redis — no real DB connections needed.

---
