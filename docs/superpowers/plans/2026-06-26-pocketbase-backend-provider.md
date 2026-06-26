# PocketBase Backend Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `BACKEND_PROVIDER=pocketbase` while preserving the current Supabase auth plus Drizzle/Postgres provider.

**Architecture:** Introduce provider-neutral auth and repository interfaces. Keep current Supabase/Drizzle behavior behind a `postgres` provider, and add a PocketBase provider using the official JavaScript SDK, request-scoped auth clients, and a server-only superuser client for migrations/cache writes.

**Tech Stack:** SvelteKit, TypeScript, Vitest, Drizzle/Postgres, Supabase JS, PocketBase JS SDK, PocketBase JavaScript migrations.

---

## File Structure

- Create `src/lib/types/auth.ts`: provider-neutral `AppUser` type.
- Create `src/lib/server/backend/config.ts`: reads and validates `BACKEND_PROVIDER`, `POCKETBASE_URL`, and PocketBase superuser env vars.
- Create `src/lib/server/backend/types.ts`: auth provider and repository interfaces plus shared DTOs.
- Create `src/lib/server/backend/json.ts`: JSON field serialization/deserialization helpers for Postgres text and PocketBase json fields.
- Create `src/lib/server/backend/index.ts`: provider factory used by routes and hooks.
- Create `src/lib/server/backend/postgres/*`: adapters wrapping existing Supabase/Drizzle behavior.
- Create `src/lib/server/backend/pocketbase/*`: PocketBase client creation, auth, repositories, and error mapping.
- Create `pb_migrations/*_polyglot_singer_collections.js`: PocketBase collections/rules/indexes.
- Modify `src/hooks.server.ts`: delegate auth session loading to selected provider.
- Modify `src/app.d.ts`: use `AppUser` and add optional `pb` only if needed internally.
- Modify auth routes/components: replace direct browser Supabase calls with provider-neutral endpoints/actions.
- Modify API routes under `src/routes/api/*`: use repositories instead of `db/schema` directly.
- Modify `src/lib/server/services/word-grammar-service.ts`: use `wordGrammarRepository`.
- Modify `src/lib/components/Navigation.svelte`: remove direct Supabase client dependency.
- Modify docs/env: `env.example`, `README.md`, and setup docs for provider configuration.
- Add tests under `src/lib/server/backend/**/__tests__` and targeted route/service tests where practical.

## Task 1: Backend Config and Shared Contracts

**Files:**
- Create: `src/lib/types/auth.ts`
- Create: `src/lib/server/backend/config.ts`
- Create: `src/lib/server/backend/types.ts`
- Create: `src/lib/server/backend/json.ts`
- Test: `src/lib/server/backend/__tests__/config.test.ts`
- Test: `src/lib/server/backend/__tests__/json.test.ts`

- [ ] **Step 1: Write config and JSON helper tests**

Test cases:

- default provider is `postgres`
- `BACKEND_PROVIDER=pocketbase` requires `POCKETBASE_URL`
- invalid provider throws a clear error
- JSON helpers parse Postgres text and accept PocketBase objects
- cache-write JSON helper tolerates `null`/`undefined` optional fields

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/lib/server/backend/__tests__/config.test.ts src/lib/server/backend/__tests__/json.test.ts`

Expected: fail because files/functions do not exist.

- [ ] **Step 3: Implement shared types and helpers**

Implement:

- `AppUser`
- `BackendProviderName = 'postgres' | 'pocketbase'`
- `getBackendConfig()`
- repository interfaces for analysis, preferences, and word grammar
- JSON helpers such as `parseJsonField<T>()` and `toJsonField()`

- [ ] **Step 4: Run tests**

Run: `npm run test -- src/lib/server/backend/__tests__/config.test.ts src/lib/server/backend/__tests__/json.test.ts`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/types/auth.ts src/lib/server/backend
git commit -m "Add backend provider contracts"
```

## Task 2: Postgres Provider Adapter

**Files:**
- Create: `src/lib/server/backend/postgres/auth.ts`
- Create: `src/lib/server/backend/postgres/analysis-repository.ts`
- Create: `src/lib/server/backend/postgres/preferences-repository.ts`
- Create: `src/lib/server/backend/postgres/word-grammar-repository.ts`
- Create: `src/lib/server/backend/postgres/index.ts`
- Modify: `src/lib/server/services/word-grammar-service.ts`
- Test: `src/lib/server/backend/postgres/__tests__/mapping.test.ts`

- [ ] **Step 1: Write mapping tests**

Test cases:

- Supabase user-like object maps to `AppUser`
- analyzed lyrics DB rows map to existing route response shapes
- word grammar DB rows parse JSON fields correctly
- cache save failure is swallowed and logged, matching current behavior

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/lib/server/backend/postgres/__tests__/mapping.test.ts`

Expected: fail because adapter files do not exist.

- [ ] **Step 3: Move current Drizzle behavior behind repositories**

Keep behavior equivalent:

- `analysisRepository.create()` uses `returning()` for Postgres/Supabase.
- history queries still filter by owner.
- detail access still allows public records and owner private records.
- public toggle and voice update still require ownership.
- preferences still upsert by user id.
- word grammar repository uses the existing table and preserves fallback behavior.

- [ ] **Step 4: Run tests**

Run: `npm run test -- src/lib/server/backend/postgres/__tests__/mapping.test.ts`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/backend/postgres src/lib/server/services/word-grammar-service.ts
git commit -m "Wrap Postgres backend in repositories"
```

## Task 3: PocketBase Provider Adapter and Migrations

**Files:**
- Create: `src/lib/server/backend/pocketbase/client.ts`
- Create: `src/lib/server/backend/pocketbase/auth.ts`
- Create: `src/lib/server/backend/pocketbase/analysis-repository.ts`
- Create: `src/lib/server/backend/pocketbase/preferences-repository.ts`
- Create: `src/lib/server/backend/pocketbase/word-grammar-repository.ts`
- Create: `src/lib/server/backend/pocketbase/errors.ts`
- Create: `src/lib/server/backend/pocketbase/index.ts`
- Create: `pb_migrations/20260626000000_polyglot_singer_collections.js`
- Modify: `package.json`
- Test: `src/lib/server/backend/pocketbase/__tests__/mapping.test.ts`

- [ ] **Step 1: Add dependency**

Run: `npm install pocketbase`

Expected: `package.json` updates and, if npm creates one, `package-lock.json` is added.

- [ ] **Step 2: Write PocketBase mapping tests**

Test cases:

- PocketBase auth record maps to `AppUser`
- analysis records map to existing API response shape
- create payload sets `user` to the current authenticated user id
- public/private filters are generated consistently
- word grammar write failure does not throw
- PocketBase SDK auth failures map to `401`
- missing or inaccessible records map to `404`
- validation failures map to `400`
- distinguishable backend/network outages map to `503`
- unexpected provider errors map to `500`

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm run test -- src/lib/server/backend/pocketbase/__tests__/mapping.test.ts`

Expected: fail because adapter files do not exist.

- [ ] **Step 4: Implement PocketBase clients**

Implement:

- request client from `POCKETBASE_URL`
- `loadFromCookie`, `authRefresh`, and `exportToCookie` helpers
- server-only superuser client using `POCKETBASE_SUPERUSER_EMAIL` and `POCKETBASE_SUPERUSER_PASSWORD`
- clear error for missing `POCKETBASE_URL`
- degraded cache-write behavior for missing superuser credentials

- [ ] **Step 5: Implement PocketBase error mapping**

Implement `src/lib/server/backend/pocketbase/errors.ts` so adapters and routes can translate provider failures into project-level errors:

- auth failure: `401 Unauthorized`
- validation failure: `400 Validation failed`
- missing/inaccessible record: `404 Not found`
- distinguishable backend/network outage: `503 Backend unavailable`
- unexpected error: `500`

- [ ] **Step 6: Implement PocketBase repositories**

Implement collection operations:

- `users` auth collection via PocketBase auth methods
- `analyzed_lyrics` CRUD and gallery filtering
- `user_preferences` get/upsert by `user`
- `word_grammar_analysis` read by normalized `(word, language)` and create-or-update via superuser

- [ ] **Step 7: Add PocketBase migration**

Define:

- `users` auth collection fields `username`, `displayName`
- `analyzed_lyrics` with rules from the spec
- `user_preferences` with owner-only rules
- `word_grammar_analysis` with public read, superuser-only write, and unique `(word, language)` index

- [ ] **Step 8: Run tests**

Run: `npm run test -- src/lib/server/backend/pocketbase/__tests__/mapping.test.ts`

Expected: pass.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json pb_migrations src/lib/server/backend/pocketbase
git commit -m "Add PocketBase backend provider"
```

If there is no `package-lock.json`, omit it from `git add`.

## Task 4: Provider Factory, Hooks, and Auth UI

**Files:**
- Create: `src/lib/server/backend/index.ts`
- Modify: `src/hooks.server.ts`
- Modify: `src/app.d.ts`
- Modify: `src/routes/+layout.server.ts`
- Modify: `src/routes/auth/+page.svelte`
- Modify: `src/routes/auth/logout/+page.svelte`
- Modify: `src/lib/components/Navigation.svelte`
- Create: `src/routes/api/auth/login/+server.ts`
- Create: `src/routes/api/auth/register/+server.ts`
- Create: `src/routes/api/auth/logout/+server.ts`

- [ ] **Step 1: Write auth flow tests or lightweight unit tests**

At minimum test:

- selected provider returns the correct adapter
- hook helper normalizes anonymous user to `null`
- logout clears provider session state

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/lib/server/backend`

Expected: fail until provider factory/hook helpers exist.

- [ ] **Step 3: Implement provider factory**

Expose:

- `getBackend()`
- `getRequestBackend(event)` if request state is needed
- `handleAuth(event, resolve)` or provider-specific hook helpers

- [ ] **Step 4: Update `hooks.server.ts`**

Behavior:

- `postgres`: keep Supabase token validation and user sync behavior.
- `pocketbase`: load/refresh `pb_auth`, normalize `locals.user`, append updated cookie.

- [ ] **Step 5: Add provider-neutral auth endpoints**

Create mandatory server endpoints:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`

They call the selected `authProvider` and write or clear the correct provider cookie. In Postgres mode they preserve the current Supabase token-cookie behavior; in PocketBase mode they issue or clear `pb_auth`.

- [ ] **Step 6: Update auth UI**

Replace direct `supabase.auth.*` calls with provider-neutral `/api/auth/login`, `/api/auth/register`, and `/api/auth/logout` endpoints.

Preserve current visible behavior:

- login/register modes
- redirect to `/library` after login
- logout redirects to `/auth`

- [ ] **Step 7: Update navigation**

Remove direct Supabase browser call. Use passed layout `user` only, and call provider-neutral logout.

- [ ] **Step 8: Run checks**

Run:

```bash
npm run test -- src/lib/server/backend
npm run check
```

Expected: pass.

- [ ] **Step 9: Commit**

```bash
git add src/hooks.server.ts src/app.d.ts src/routes/+layout.server.ts src/routes/auth src/routes/api/auth src/lib/components/Navigation.svelte src/lib/server/backend/index.ts
git commit -m "Use provider-neutral authentication"
```

## Task 5: Route Migration to Repositories

**Files:**
- Modify: `src/routes/api/analyze/+server.ts`
- Modify: `src/routes/api/analyze/history/+server.ts`
- Modify: `src/routes/api/analyze/history/[id]/+server.ts`
- Modify: `src/routes/api/analyze/history/[id]/public/+server.ts`
- Modify: `src/routes/api/analyze/history/[id]/voice/+server.ts`
- Modify: `src/routes/api/gallery/+server.ts`
- Modify: `src/routes/api/user/preferences/+server.ts`
- Modify: `src/routes/api/word/grammar/+server.ts`
- Modify: `src/lib/server/services/word-grammar-service.ts`

- [ ] **Step 1: Write route/service tests for provider-neutral behavior**

Focus on pure route helpers or repository calls where full SvelteKit route tests are too expensive:

- auth required for analyze/history/preferences
- public/private detail access behavior
- owner-only public toggle and voice update
- gallery returns public records
- word grammar route remains anonymous and survives cache write failure

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/routes/api src/lib/server/services`

Expected: fail until routes use repositories.

- [ ] **Step 3: Update routes to use repositories**

Remove direct route imports of:

- `db`
- `schema`
- Drizzle query helpers where the repository now owns them
- direct Supabase SDK usage

- [ ] **Step 4: Update word grammar service**

Make `WordGrammarService` depend on `wordGrammarRepository` for persistent cache, while keeping in-memory cache behavior.

Cache write failures must be logged but not thrown after successful AI analysis.

- [ ] **Step 5: Run route/service tests**

Run: `npm run test -- src/routes/api src/lib/server/services`

Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add src/routes/api src/lib/server/services/word-grammar-service.ts
git commit -m "Route API data access through backend repositories"
```

## Task 6: Documentation and Environment Setup

**Files:**
- Modify: `env.example`
- Modify: `README.md`
- Modify: `docs/SETUP.md`
- Modify: `docs/SCRIPTS_USAGE.md`
- Optional create: `docs/POCKETBASE_SETUP.md`
- Modify: `scripts/check-env.js`
- Modify: `scripts/start.js`

- [ ] **Step 1: Update environment docs**

Document:

- `BACKEND_PROVIDER=postgres|pocketbase`
- PocketBase local URL
- PocketBase superuser credentials
- how to run PocketBase with checked-in migrations
- Postgres remains default

- [ ] **Step 2: Update env checks**

Make scripts warn clearly when:

- PocketBase provider is selected without `POCKETBASE_URL`
- PocketBase migrations/cache writes need superuser credentials
- Postgres provider is selected without existing DB/Supabase values

- [ ] **Step 3: Run docs/script checks**

Run:

```bash
npm run env:check
npm run check
```

Expected: no TypeScript errors; env check should not corrupt `.env`.

- [ ] **Step 4: Commit**

```bash
git add env.example README.md docs scripts
git commit -m "Document PocketBase provider setup"
```

## Task 7: Full Verification and PR Prep

**Files:**
- Modify only if verification exposes issues.

- [ ] **Step 1: Run unit tests**

Run: `npm run test`

Expected: pass.

- [ ] **Step 2: Run Svelte checks**

Run: `npm run check`

Expected: pass.

- [ ] **Step 3: Build**

Run: `npm run build`

Expected: pass.

- [ ] **Step 4: Manual smoke for Postgres provider**

With existing environment:

```bash
BACKEND_PROVIDER=postgres npm run dev
```

Verify current auth/data flow is not broken if credentials are available.

- [ ] **Step 5: Manual smoke for PocketBase provider**

Run PocketBase locally with migrations, then:

```bash
BACKEND_PROVIDER=pocketbase POCKETBASE_URL=http://127.0.0.1:8090 npm run dev
```

Verify register/login, analyze save, history, detail, public gallery, preferences, word grammar, and logout.

- [ ] **Step 6: Rename branch**

Use a clear branch name:

```bash
git branch -m feature/pocketbase-backend-provider
```

- [ ] **Step 7: Inspect PR account**

Run:

```bash
git remote get-url origin
gh auth status
```

If `remote.origin.url` contains an explicit GitHub username, ensure `gh` is active for that account before PR commands.

- [ ] **Step 8: Push and open PR**

Run the appropriate push command for the renamed branch, then create the PR with a concise summary and verification results.

Expected: PR created successfully, or a clear auth/account blocker is reported.
