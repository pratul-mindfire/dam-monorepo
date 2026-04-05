# DAM Monorepo

## Environment Setup

This repo uses a `.env.example` strategy so real secrets do not need to be committed.

### About `.env.example`

The [.env.example] file is a template that documents the required environment variables for local development and Docker Compose.

- it includes all expected keys for the app and infrastructure services
- it uses `TEST_...` placeholder values instead of real secrets or runnable defaults
- it is meant to be copied and edited, not used unchanged

The file is organized into these sections:

- `App`: frontend origin, API base path, and app port
- `MongoDB`: database image and connection string
- `RabbitMQ`: broker image, queue settings, and management ports
- `MinIO`: object storage endpoint, credentials, bucket, and console settings
- `Uploads`: upload size limit and temp directory
- `Auth`: JWT secret and expiry
- `Nginx`: public host/container port mappings

### Local setup

1. Copy the template:

```bash
cp .env.example .env
```

2. Replace placeholder values in `.env`, especially:

- `JWT_SECRET`
- `MINIO_SECRET_KEY`
- `MONGO_URI`
- `RABBITMQ_URL`
- any ports, origins, or service URLs you want to customize

The real `.env` file is ignored by git, while `.env.example` stays committed as setup documentation.

## Testing

### Run all tests

```bash
pnpm test
```

This runs:

- frontend tests with Vitest and React Testing Library
- backend tests with Jest

### Frontend-only test command

```bash
pnpm --filter frontend test
```

### Backend-only test command

```bash
pnpm --filter backend test
```

## Docker

This repo includes a Docker Compose stack for:

- `backend`: Node.js API and asset worker
- `nginx`: serves the React build and reverse proxies `/api`
- `mongo`: MongoDB
- `rabbitmq`: queue broker
- `minio`: object storage

### Run

1. Copy `.env.example` to `.env` if you want to override defaults.
2. Start the stack:

```bash
docker compose up --build
```

### Endpoints

- App: `http://localhost`
- API via Nginx: `http://localhost/api`
- MinIO console: `http://localhost:9002`
- RabbitMQ console: `http://localhost:15673`

Uploaded asset URLs are routed through Nginx using `/storage/...`, so the browser can access MinIO objects without depending on Docker-internal hostnames.
