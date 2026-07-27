# Polyglot Singer

Polyglot Singer is a SvelteKit app for multilingual song-lyrics analysis and pronunciation learning.

## Requirements

- Node.js 20.x
- npm
- A backend configuration in `.env`

## Quick Start

```bash
npm install
cp env.example .env
```

Edit `.env` with the values for your backend and AI provider. At minimum, set:

- `BACKEND_PROVIDER` to `postgres` or `pocketbase`
- `DATABASE_TYPE=postgres` and `DATABASE_URL=...` for the default Postgres path
- `SESSION_SECRET`
- one AI provider key, such as `DOUBAO_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY`

Then initialize the database and start the app:

```bash
npm run db:setup
npm run dev
```

You can also use the smart startup script:

```bash
npm run start
```

That script checks env config, installs dependencies if needed, runs database setup when required, and starts the dev server.

## Backend Modes

### PostgreSQL / Supabase

This is the default backend mode.

Set:

```bash
BACKEND_PROVIDER=postgres
DATABASE_TYPE=postgres
DATABASE_URL=postgresql://user:password@host:port/database
```

If you are using Supabase, also provide the Supabase variables in `env.example`.

### PocketBase

Set:

```bash
BACKEND_PROVIDER=pocketbase
POCKETBASE_URL=http://127.0.0.1:8090
```

Run PocketBase in another terminal:

```bash
pocketbase serve --migrationsDir=./pb_migrations
```

## Docker Compose (local deployment)

Build and run both the SvelteKit app and PocketBase together:

```bash
cp env.example .env
# Edit .env and add at least SESSION_SECRET, KIMI_API_KEY or MINIMAX_API_KEY, and AI_PROVIDER

npm install
docker compose up -d --build
```

This will:

1. Build the SvelteKit production image with `@sveltejs/adapter-node`.
2. Start PocketBase with `pb_migrations` applied automatically.
3. Start the app on http://localhost:5173 with PocketBase available at http://localhost:8090.

If PocketBase is being initialized for the first time, create a superuser with:

```bash
docker compose exec pocketbase pocketbase superuser upsert admin@example.com yourpassword
```

Stop everything:

```bash
docker compose down
```

### Notes

- `.env` is never committed; keep your API keys there.
- `pb_data/` is stored in a Docker volume and is also ignored by git.
- The `build/` directory is the local production build output and is ignored by git.

## Scripts

| Command                    | Description                            |
| -------------------------- | -------------------------------------- |
| `npm run dev`              | Start the Vite dev server              |
| `npm run dev:lan`          | Start the dev server on `0.0.0.0`      |
| `npm run build`            | Build for production                   |
| `npm run preview`          | Preview the production build           |
| `npm run check`            | Run Svelte type checking               |
| `npm run lint`             | Run Prettier and ESLint checks         |
| `npm run format`           | Format the codebase                    |
| `npm run test`             | Run unit tests with Vitest             |
| `npm run test:integration` | Run Playwright integration tests       |
| `npm run db:setup`         | Generate and apply database migrations |
| `npm run db:generate`      | Generate Drizzle migrations            |
| `npm run db:migrate`       | Apply Drizzle migrations               |
| `npm run db:studio`        | Open Drizzle Studio                    |
| `npm run db:test`          | Test the database connection           |
| `npm run env:check`        | Check `.env` for required variables    |
| `npm run start`            | Run startup checks and launch the app  |

## Notes

- The old `./start.sh` reference is stale; use `npm run start` instead.
- `npm run start:shell` is present in `package.json`, but the referenced shell script is not in this repository.

## Repository Layout

```text
src/
  lib/
    server/        Backend config, auth, database, and services
  routes/          SvelteKit pages and API routes
  styles/          Global styles
  types/           TypeScript definitions
scripts/           Setup and utility scripts
pb_migrations/     PocketBase migrations
drizzle/           Generated SQL migrations
```
