# Environment configuration

The monorepo uses one root-level `.env` file for local configuration and commits one root-level `.env.example` as its inventory. Application-specific `.env` files are not used.

## Ownership

- Docker Compose, Drizzle Kit, Fastify, and Vite load configuration from the repository root.
- Each application reads only the variables it owns.
- Only variables prefixed with `VITE_` may be included in browser bundles.
- Domain and application packages do not read `process.env`; their composition root passes required configuration through public interfaces.
- `.env` is developer-owned and ignored by Git.

## Runtime parsing

When Fastify or TanStack Start starts, its composition root parses only the
variables that application owns, converts them to their runtime types, and
reports all invalid configuration before opening a port or database connection.
The resulting typed configuration is passed into packages through their public
interfaces.

Both applications use Valibot for this parsing, with independent schemas owned inside `apps/api` and `apps/web`. The Template does not create a shared configuration workspace. TypeBox remains reserved for HTTP Contracts, where JSON Schema, Fastify, and OpenAPI integration are required.

## Variable inventory

### PostgreSQL

The development database has one component-based configuration shared by Docker Compose, Fastify, and Drizzle Kit:

- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`

The Template does not define a duplicate `DATABASE_URL`. Testcontainers supplies its ephemeral database connection programmatically and does not consume these development values.

### Local processes

Both development servers bind explicitly so they are reachable through
localhost, LAN, or Tailscale hostnames:

- `API_HOST` — Fastify bind address; `.env.example` uses `0.0.0.0`.
- `API_PORT` — Fastify port; `.env.example` uses `3000`.
- `WEB_HOST` — TanStack Start/Vite bind address; `.env.example` uses
  `0.0.0.0`.
- `WEB_PORT` — TanStack Start/Vite port; `.env.example` uses `3001`.
- `API_INTERNAL_ORIGIN` — absolute Fastify origin used by the Vite development
  and preview proxies, server functions, and OpenAPI generation;
  `.env.example` uses `http://127.0.0.1:3000`.

Runtime Valibot schemas parse the ports and validate the owned host/origin
values before either server listens.

### Authentication and browser origins

- `BETTER_AUTH_SECRET` — server-only secret used by Better Auth.
- `BETTER_AUTH_URL` — absolute public origin where the Better Auth routes are
  reachable; `.env.example` uses `http://localhost:3001`, because the browser
  reaches `/api/auth` through the local Vite proxy or production reverse proxy.
- `WEB_ORIGINS` — comma-separated explicit browser-origin allowlist shared by
  Fastify CORS and Better Auth trusted origins. Vite also derives its development
  server host allowlist from these origins. `.env.example` includes the localhost
  and loopback web origins on port `3001`.

Developers add their LAN or Tailscale web origin to `WEB_ORIGINS` when they use
one. `WEB_ORIGINS` never contains `*` for credentialed requests.

The browser's Better Auth client uses the relative `/api/auth` endpoint. There
is no `VITE_BETTER_AUTH_URL`, other browser-exposed auth origin, or duplicate
client configuration.

The generated First-Party API client uses relative `/api/*` paths. Vite proxies
them locally, and production infrastructure routes them to Fastify.
