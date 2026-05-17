# TaskFlow API

A production-grade multi-tenant task management REST API built with 
Node.js, TypeScript, Express, PostgreSQL, and Prisma.

🔗 **Live API:** Coming soon
📚 **API Docs:**  Coming soon


## Why This Project

TaskFlow demonstrates the architecture patterns I use when building 
backend services for production: clean modular structure, JWT auth 
with refresh token rotation, role-based access control, validated 
inputs, structured error handling, rate limiting, comprehensive API 
documentation, and Docker-based local development.

## Features

- 🔐 JWT authentication with refresh token rotation
- 🏢 Multi-tenant workspaces with role-based access (OWNER, ADMIN, MEMBER)
- 📋 Projects and tasks with status workflow
- 💬 Comments on tasks
- 🔍 Filtering, sorting, pagination on list endpoints
- ⚡ Rate limiting and security headers
- 📖 Swagger documentation
- 🐳 Dockerized for one-command local setup
 

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 24 |
| Language | TypeScript |
| Framework | Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Logging | Pino |
| Docs | Swagger  |


## Architecture

The codebase follows a **modular/feature-based** structure where 
each domain (auth, workspace, project, task) owns its routes, 
controller, service, and schemas. This scales better than 
type-based folders as the API grows.

## Quick Start

```bash
git clone https://github.com/MunawarJamil/taskflow-api
cd taskflow-api
cp .env.example .env
docker-compose up -d
npm install
npx prisma migrate dev
npm run dev
```
 



## Future Plane

- Real-time updates via WebSockets
- Email notifications via background jobs
- Audit log for sensitive actions
- API key auth for service-to-service calls
