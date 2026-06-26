# PocketBase Backend Provider Design

Date: 2026-06-26

## Goal

Add PocketBase as a selectable backend provider while preserving the current Supabase auth plus Drizzle/Postgres path.

The motivation is operational stability and future backend portability. Supabase can pause inactive projects, which increases maintenance for a personally hosted app. PocketBase can run on the user's private server for long-lived availability while offering a backend architecture that is close enough to Supabase to keep migration cost reasonable.

This provider layer should also make future backend providers practical. For example, a later CloudBase provider could use the same project-level auth and repository contracts while exposing provider-specific advantages such as WeChat login or different pricing.

The selected scope is:

- `BACKEND_PROVIDER=postgres`: keep the existing Supabase auth and Drizzle/Postgres behavior.
- `BACKEND_PROVIDER=pocketbase`: use PocketBase for authentication, session handling, and application data.
- The SvelteKit routes and UI should depend on project-level auth and repository interfaces, not directly on Supabase, Drizzle, or PocketBase details.

## Non-Goals

- Do not remove Supabase/Postgres support.
- Do not migrate existing production data between providers in this change.
- Do not change the existing AI analysis behavior except where saved data moves through the new repository interface.
- Do not add OpenAI provider work in this spec; this scope is PocketBase only.

## Configuration

Add provider configuration:

```env
BACKEND_PROVIDER=postgres
POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_SUPERUSER_EMAIL=
POCKETBASE_SUPERUSER_PASSWORD=
```

`BACKEND_PROVIDER` accepts:

- `postgres`: current Supabase auth plus Drizzle/Postgres.
- `pocketbase`: PocketBase auth plus PocketBase collections.

When `BACKEND_PROVIDER=pocketbase`, `POCKETBASE_URL` is required. Missing provider-specific configuration should fail with a clear error at startup or first backend access.

`POCKETBASE_SUPERUSER_EMAIL` and `POCKETBASE_SUPERUSER_PASSWORD` are required for server-only maintenance operations in PocketBase mode, including collection setup/migrations and writing shared word grammar cache records. They must never be exposed to browser code.

## Architecture

Introduce a backend provider layer with unified interfaces:

- `authProvider`
  - Get the current request user.
  - Login with email/password.
  - Register with email/password.
  - Logout.
  - Refresh or clear session state in the request hook.
- `analysisRepository`
  - Create an analyzed lyrics record.
  - List a user's history.
  - Read one analysis with public/private access rules.
  - Update `isPublic`.
  - Update `voice`.
  - List public gallery records.
- `preferencesRepository`
  - Read a user's preferences.
  - Upsert user preferences.
- `wordGrammarRepository`
  - Read cached word grammar analysis.
  - Create or update cached word grammar analysis.

The existing API routes should call these interfaces instead of importing `db`, `schema`, PocketBase SDK objects, or Supabase clients directly.

Provider implementations:

- `postgres` adapter:
  - Keep the existing Supabase auth flow in `hooks.server.ts`.
  - Keep Drizzle/Postgres for data access.
- `pocketbase` adapter:
  - Use the official PocketBase JavaScript SDK.
  - Create a request-scoped PocketBase client in `hooks.server.ts`.
  - Load auth from request cookies with `authStore.loadFromCookie(...)`.
  - Refresh valid auth with `authRefresh()`.
  - Clear invalid auth on refresh failure.
  - Write the updated `pb_auth` cookie with `authStore.exportToCookie()`.

Expose a project-owned user shape in `locals.user` and page data:

```ts
type AppUser = {
  id: string;
  email?: string;
  username?: string;
  displayName?: string | null;
};
```

This removes UI and route dependencies on Supabase's `User` type.

## PocketBase Collections

PocketBase mode should define collections that map to the existing Drizzle-backed concepts.

### `users`

Use a PocketBase auth collection with email/password authentication.

Additional fields:

- `username`
- `displayName`

### `analyzed_lyrics`

Fields:

- `user`: relation to `users`, required
- `title`: text
- `artist`: text
- `lyrics`: text, required
- `sourceLanguage`: text, required
- `targetLanguage`: text, required
- `analysisJson`: json, required
- `voice`: text
- `isPublic`: bool, default `false`

Rules:

- list/view: `isPublic = true || user = @request.auth.id`
- create: `@request.auth.id != "" && user = @request.auth.id`
- update/delete: `user = @request.auth.id`

### `user_preferences`

Fields:

- `user`: relation to `users`, required and unique
- `preferredSourceLanguage`: text
- `preferredTargetLanguage`: text
- `phoneticStyle`: text
- `showPinyin`: bool
- `autoSave`: bool
- `defaultVoices`: json

Rules:

- list/view/create/update/delete: `user = @request.auth.id`

### `word_grammar_analysis`

Fields:

- `word`: text, required
- `language`: text, required
- `partOfSpeech`: text
- `grammarRules`: json
- `examples`: json
- `analysisJson`: json, required

Rules:

- list/view: public read, preserving the current anonymous `/api/word/grammar` behavior for public analysis pages.
- create/update/delete: superuser only. The normal client SDK path must not be able to write these records directly.

The PocketBase adapter will use a separate server-only superuser PocketBase client for cache writes. Normal request-scoped user clients are used for user-owned data such as analyzed lyrics and preferences.

## Data Flow

Authentication:

1. `/auth` calls a project-level login or register endpoint/action.
2. The endpoint delegates to the selected `authProvider`.
3. `hooks.server.ts` normalizes the authenticated record into `locals.user`.
4. Layout data exposes the same normalized user shape to the UI.

Analysis:

1. `/api/analyze` validates the request.
2. It requires `locals.user`.
3. It calls the existing AI analysis service.
4. It saves the result through `analysisRepository.create(...)`.
5. It returns the same response shape as today, including the created analysis id.

History and gallery:

1. History routes call `analysisRepository.listForUser(...)`.
2. Detail routes call `analysisRepository.getAccessible(...)`, which enforces public/private ownership behavior consistently across providers.
3. Gallery calls `analysisRepository.listPublic(...)`.

Preferences and word grammar:

1. Preference routes call `preferencesRepository.get(...)` and `preferencesRepository.upsert(...)`.
2. `/api/word/grammar` remains available to anonymous users, matching current behavior.
3. Word grammar service uses `wordGrammarRepository` for cache reads and writes.
4. In PocketBase mode, cache reads may use a public/read-capable client, while cache writes use the server-only superuser client.

## Error Handling

Provider-specific errors should be translated into project-level API errors:

- unauthenticated user: `401 Unauthorized`
- inaccessible or missing record: `404 Not found`
- invalid request payload: `400 Validation failed`
- missing provider configuration: clear configuration error
- backend outage or SDK failure: `503 Backend unavailable` when distinguishable, otherwise `500`

PocketBase auth refresh failure should clear auth state and treat the request as unauthenticated.

Missing PocketBase superuser credentials should only block server-only operations that require them, such as collection migrations or word grammar cache writes. User login and normal reads should still report their own provider configuration errors clearly.

`analysisJson` and other JSON-like fields must be serialized and deserialized through shared helpers so Postgres text fields and PocketBase json fields produce consistent route responses.

## Testing

Unit tests:

- Repository contract tests for analysis history behavior.
- Repository contract tests for preferences upsert behavior.
- Auth provider tests for normalized user mapping.
- Serialization tests for `analysisJson` and JSON-like fields.

Route-level tests:

- `/api/analyze/history` requires auth and returns only the user's records.
- `/api/analyze/history/[id]` allows public records and owner private records, but hides private records from others.
- Public toggle and voice update require ownership.
- Preferences get/upsert works with the normalized user id.
- `/api/word/grammar` remains anonymous-accessible and can read/write cache through the repository.
- `/api/gallery` returns public records consistently for both providers.

Manual acceptance:

- `BACKEND_PROVIDER=postgres`
  - Supabase login still works.
  - Analyze, save, history, public gallery, preferences, and logout still work.
- `BACKEND_PROVIDER=pocketbase`
  - PocketBase register/login works.
  - Analyze saves to PocketBase.
  - History and detail reads work.
  - Private records are hidden from other users.
  - Public records appear in gallery.
  - Anonymous users can request word grammar analysis.
  - Preferences persist.
  - Logout clears the active session.

## Rollout

1. Add provider interfaces and normalized user type.
2. Move current Drizzle/Supabase behavior behind the `postgres` adapter.
3. Add PocketBase adapter and checked-in PocketBase JavaScript migrations for required collections and rules.
4. Update API routes to use repositories.
5. Update auth UI and navigation to use provider-neutral endpoints/state.
6. Add tests and update setup documentation.

Keep `BACKEND_PROVIDER=postgres` as the default during rollout to reduce regression risk for current users.
