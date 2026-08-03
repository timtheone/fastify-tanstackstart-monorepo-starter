# Project commands

The Template exposes commands by concern and does not define an aggregate
`pnpm check` script. Humans and downstream automation invoke the required
commands explicitly.

## Development and build

- `pnpm dev` — run the API and web development tasks through Turborepo.
- `pnpm build` — compile and bundle all required workspaces through Turborepo.
  It does not format, lint, test, generate source, connect to PostgreSQL, or
  apply migrations.
- `pnpm preview` — run the built API and web app together through Turborepo in
  production mode. Vite previews the built Nitro app and locally proxies
  `/api/*` to Fastify. The command requires existing build artifacts and does
  not invoke `pnpm build` implicitly.

The root does not expose a `start` command. Deployment systems run the
workspace entry points behind their own `/api/*` proxy; `preview` is a local
production-build smoke test, not a production server.

The complete smoke-test sequence is `pnpm build && pnpm preview`. Preview
fails when required build output is missing rather than silently creating it.

## Code quality

- `pnpm format` — run the repository formatter.
- `pnpm lint` — run repository linting.
- `pnpm typecheck` — type-check the workspace task graph with TypeScript 7.

## Tests

- `pnpm test` — run pure Vitest suites.
- `pnpm test:integration` — run database-backed Vitest suites with Testcontainers.
- `pnpm test:e2e` — run Playwright against the assembled product with Testcontainers PostgreSQL.

## Database and clients

- `pnpm db:generate` — create Drizzle migrations without applying them.
- `pnpm db:migrate` — apply pending Drizzle migrations.
- `pnpm gen:openapi` — regenerate the Orval client from the running API's OpenAPI endpoint.

See [Code generation commands](./code-generation.md) for artifact ownership and prerequisites.

The Template does not include `db:seed`, a seed framework, or sample data.
Consumers add seeding only when their domain has concrete bootstrap data.
