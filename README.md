# Apoco Backend Challenge

Production-style REST API for a Pokemon catalog built with Fastify, TypeScript, PostgreSQL, and MikroORM.

## Stack

- Node.js 24
- Fastify
- PostgreSQL
- MikroORM
- Vitest
- Swagger / OpenAPI
- Docker Compose

## Implemented

- Bearer token authentication
- Pokemon listing with:
  - pagination
  - name search
  - type filtering
  - favorites filtering
- Get Pokemon by ID
- Get Pokemon by name
- Get available Pokemon types
- Set / unset favorite Pokemon
- PostgreSQL migrations and seeding
- OpenAPI documentation
- Dockerized setup with DB bootstrap and seeding
- Integration tests for auth, Pokemon queries, and favorites

## Pending

- AI-powered feature
- Final README section for AI provider selection and configuration

## Run With Docker

```bash
docker compose up --build
```

This starts:

- PostgreSQL
- database initialization + migrations
- Pokemon seeding
- API server

## API URLs

When the app starts, it prints:

- API base URL: `http://127.0.0.1:8080/api/v1`
- Swagger UI: `http://127.0.0.1:8080/documentation`
- OpenAPI spec: `http://127.0.0.1:8080/documentation/json`

## Authentication Flow

1. Register a user:

```bash
curl -X POST http://127.0.0.1:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"ash@example.com","password":"password123"}'
```

2. Use the returned bearer token for protected endpoints.

## Main Endpoints

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Pokemon

- `GET /api/v1/pokemon`
- `GET /api/v1/pokemon/:id`
- `GET /api/v1/pokemon/name/:name`
- `GET /api/v1/pokemon/types`

### Favorites

- `POST /api/v1/user/set-favorite-pokemon/:id`
- `POST /api/v1/user/unset-favorite-pokemon/:id`

## Pokemon List Query Params

`GET /api/v1/pokemon`

Supported query params:

- `page`
- `limit`
- `name`
- `types`
- `favorites`

Examples:

- `GET /api/v1/pokemon?page=2&limit=10`
- `GET /api/v1/pokemon?name=saur`
- `GET /api/v1/pokemon?types=GRASS&types=POISON`
- `GET /api/v1/pokemon?favorites=true`

## Run Integration Tests

```bash
yarn test
```

Note: tests use Docker to start a PostgreSQL container. For a project of this size it seemed suitable to use only integration tests that cover the whole scope of the project.