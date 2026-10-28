# Delivery Agent Management System

A full-stack CRUD application for managing delivery agents.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL 8
- Cache: Redis
- Validation: express-validator
- Tests: Node.js built-in test runner + Supertest

## Features
- Create, list, view, update, and delete delivery agents
- Search agents by name, email, phone, or service area
- Filter by active/inactive status
- Pagination and summary statistics
- Input validation and consistent JSON errors
- Redis caching for agent list and individual agent details
- Cache invalidation after create/update/delete
- Responsive dashboard UI
- API tests

## Requirements
- Node.js 20+
- npm
- Docker Desktop (recommended), or local MySQL 8 and Redis 7

## 1. Start MySQL and Redis
From the project root:

```bash
docker compose up -d
```

MySQL is exposed on port `3306`; Redis on `6379`. The Compose file creates the `delivery_agents` database and a development user.

## 2. Configure backend
```bash
cd backend
cp .env.example .env
npm install
npm run db:init
npm run dev
```

Windows PowerShell users can copy the environment file with:
```powershell
Copy-Item .env.example .env
```

Backend: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`
API base: `http://localhost:5000/api/agents`

## 3. Start frontend
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

Optional frontend environment variable: copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` if the backend is not running at `http://localhost:5000/api`.

## Environment variables
See `backend/.env.example`. Do not commit `.env` or production secrets. For production, use a strong database password, TLS, a managed secret store, and HTTPS/WSS-capable hosting.

## Database setup
The schema is in `backend/sql/schema.sql`. `npm run db:init` creates the database table if it does not exist. IDs are auto-incrementing; timestamps are managed by MySQL.

## API endpoints
All responses are JSON. Agent IDs are integers.

| Method | Endpoint | Description | Success |
|---|---|---|---|
| GET | `/api/agents` | List agents; supports `page`, `limit`, `search`, `status` | 200 |
| GET | `/api/agents/:id` | Agent details | 200 |
| POST | `/api/agents` | Create an agent | 201 |
| PUT | `/api/agents/:id` | Replace editable agent fields | 200 |
| PATCH | `/api/agents/:id` | Update supplied editable fields | 200 |
| DELETE | `/api/agents/:id` | Delete an agent | 204 |
| GET | `/api/health` | Service and dependency health | 200 / 503 |

Example create request:
```bash
curl -X POST http://localhost:5000/api/agents \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Aman Verma","phone":"9876543210","email":"aman@example.com","serviceArea":"South Delhi","status":"active"}'
```

Example list:
```bash
curl "http://localhost:5000/api/agents?page=1&limit=10&search=Delhi&status=active"
```

Example update:
```bash
curl -X PATCH http://localhost:5000/api/agents/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"inactive"}'
```

## Redis caching strategy
- `GET /api/agents` caches each normalized query (page, limit, search, status) for 60 seconds.
- `GET /api/agents/:id` caches an individual agent for 120 seconds.
- A Redis outage does not take down normal database reads/writes; cache reads/writes gracefully fall back to MySQL.
- On create, update, or delete, the app clears the `agents:list:*` and `agents:item:*` cache key namespaces so list/detail results cannot remain stale.
- Cache invalidation runs after successful database writes. TTL is an additional safety net.
- Redis keys are namespaced with `delivery-agents:`.

## Tests
```bash
cd backend
npm install
npm test
```
Tests use an isolated in-memory fake for the service/cache layer and do not require a running MySQL or Redis instance. For full integration testing, start services with Docker and follow the API examples above.

## Production checklist
- Set `NODE_ENV=production`, secure credentials, and configure CORS for the actual frontend origin.
- Use HTTPS and a private network for MySQL/Redis.
- Add authentication/authorization before exposing write operations publicly.
- Add structured logging/monitoring and backups.
