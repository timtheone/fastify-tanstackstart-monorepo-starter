# Code generation commands

The Template uses explicit commands named for the artifact lifecycle they own. It does not provide a universal `pnpm generate` command.

## `pnpm db:generate`

Runs Drizzle Kit against the complete schema in `packages/db` and creates a SQL migration plus Drizzle metadata when the schema changed. It creates migration files but does not apply them to a database.

## `pnpm db:migrate`

Applies pending committed Drizzle migrations to the configured database. This command requires a reachable PostgreSQL database and never generates a migration.

## `pnpm gen:openapi`

Requires the Fastify development server to be running at `API_INTERNAL_ORIGIN`. Orval reads `/swagger-docs/json` directly and emits Fetch functions and React Query integrations according to the committed project-owned configuration.

Fastify uses `@fastify/swagger` in dynamic mode and mounts `@fastify/swagger-ui` at `/swagger-docs`. The plugin serves:

- `/swagger-docs/` — interactive Swagger UI
- `/swagger-docs/json` — OpenAPI JSON used by generation
- `/swagger-docs/yaml` — equivalent YAML for human use

The Template does not add a second custom OpenAPI route.

The committed Orval configuration uses the `react-query` client with Fetch.
Leave query and mutation generation enabled by default: GET operations produce
query functions and hooks, while non-GET operations produce mutation functions
and hooks. Disable a wrapper only for a specific operation when there is a
concrete reason. `serializeResponseHeaders` keeps generated response envelopes
safe for TanStack Start dehydration, and `useRuntimeFetcher` lets server-side
loaders provide a Fetch implementation that forwards the incoming cookie.
Server loaders call generated request functions; browser components call the
generated hooks. Do not add handwritten API query keys, JSON adapters, or
generic mutation wrappers.

The Better Auth Drizzle schema is committed project-owned source. Database
migrations include its tables and are applied with `pnpm db:migrate`.

## TanStack route tree

The TanStack compiler plugin automatically maintains `routeTree.gen.ts` through Vite's development and build processes. The file remains committed because it is runtime source, but no project script generates it explicitly and agents never edit it manually.
