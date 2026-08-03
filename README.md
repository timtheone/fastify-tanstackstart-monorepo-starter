# Fastify TanStack Start Monorepo Starter

A production-shaped TypeScript starter with a TanStack Start web app, a
Fastify API, PostgreSQL through Drizzle, Better Auth, generated OpenAPI clients,
and three deliberate test seams. It ships infrastructure and authentication,
but no sample domain.

## Get running

You need Node.js `24.18.0` (or a later Node 24 release), Corepack with pnpm
`11.18.0`, Docker Engine `24.0.0+`, and Docker Compose `2.20.0+`.

1. Scaffold a project with [`degit`](https://github.com/Rich-Harris/degit), or
   copy this starter into an empty repository:

   ```sh
   npx degit https://github.com/timtheone/fastify-tanstackstart-monorepo-starter my-app
   cd my-app
   ```

2. Run `corepack enable`, then confirm `pnpm --version` prints `11.18.0`.
3. Deliberately create your local configuration with
   `cp .env.example .env`. Replace the example Better Auth secret and adjust
   origins or ports for your machine.
4. Install dependencies with `pnpm install`.
5. Start PostgreSQL with `docker compose up -d postgres`, then apply committed
   migrations with `pnpm db:migrate`.
6. Run `pnpm dev`. The web app is available at
   [http://localhost:3001](http://localhost:3001), Fastify readiness at
   [http://localhost:3000/health/ready](http://localhost:3000/health/ready),
   and Swagger UI at
   [http://localhost:3000/swagger-docs/](http://localhost:3000/swagger-docs/).

## Daily commands

- `pnpm dev` — run the web and API development servers.
- `pnpm build && pnpm preview` — smoke-test production builds locally.
- `pnpm format`, `pnpm lint`, `pnpm typecheck` — verify source quality.
- `pnpm test`, `pnpm test:integration`, `pnpm test:e2e` — run pure,
  assembled API, and browser tests.
- `pnpm db:generate`, `pnpm db:migrate`, `pnpm gen:openapi` — maintain
  database and generated API artifacts.

See the [documentation index](docs/README.md) for architecture and operational
details. In particular, read the [environment inventory](docs/reference/environment.md),
[project commands](docs/reference/commands.md), and
[generation ownership](docs/reference/code-generation.md) before changing
runtime or generated files.
