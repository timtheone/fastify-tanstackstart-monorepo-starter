# Repository operating guide

## Workspace map

- `apps/api` owns Fastify composition, HTTP, Better Auth, and runtime concerns.
- `apps/web` owns TanStack Start routes, browser UI, and server-side web logic.
- `packages/application` owns transport-agnostic application operations.
- `packages/contracts` owns TypeBox First-Party HTTP contracts.
- `packages/db` owns Drizzle access, schema, and migrations.
- `packages/api-client` owns the generated OpenAPI client and its fetch adapter.

Real features use the same Module name across the layers they need. Do not add
a sample Module to the starter. Keep application code independent of Fastify,
keep environment reads in composition roots, and call public package or Module
interfaces directly. The [architecture decisions](docs/README.md#architecture-decisions)
are authoritative.

## Commands and verification

Use Corepack pnpm `11.18.0`; do not use npm or yarn. Supported root commands
are documented in [commands](docs/reference/commands.md). Before handoff, run
`pnpm format`, `pnpm lint`, `pnpm typecheck`, and the tests relevant to the
change. API or database changes require `pnpm test:integration`; browser flows
require `pnpm test:e2e`. Name every command run and disclose skipped checks.

## Generated files

Never hand-edit these artifacts:

- `packages/db/drizzle/**` — run `pnpm db:generate`.
- `packages/api-client/src/generated/**` — run `pnpm gen:openapi` against a
  running API.
- `apps/web/src/routeTree.gen.ts` — maintained by TanStack during dev/build.

`packages/db/src/schema/auth.ts` is committed project-owned source. Review new
migrations before applying them; never change a shared or applied migration.
See [code generation](docs/reference/code-generation.md).
`orval.config.ts` is project-owned and committed. Change its React Query client
configuration deliberately rather than treating it as generated output.

## Detailed guidance

- [Context and terminology](docs/CONTEXT.md)
- [Environment](docs/reference/environment.md) and
  [commands](docs/reference/commands.md)
- [Testing seams](docs/adr/0007-test-through-public-seams.md)
- [Application layer](docs/reference/application-layer.md)
- [Authentication](docs/adr/0008-fastify-owns-better-auth.md)
- [Fastify/API runtime](docs/reference/fastify-runtime.md) and
  [HTTP contracts](docs/adr/0002-typebox-http-contracts-and-valibot-ui-validation.md)
- [Web UI](docs/reference/web-ui.md)
- [Architecture and Module boundaries](docs/README.md)
