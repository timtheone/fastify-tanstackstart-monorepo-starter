# Documentation

Use this page to find the Template's architectural decisions and operational
reference. The root `README.md` remains the shortest path from a fresh clone
to a running development environment.

## Reference

- [Context and terminology](CONTEXT.md) — canonical Template language and
  definitions.
- [Repository guidance files](reference/agent-instructions.md) — boundaries
  for the root `AGENTS.md` and `README.md`.
- [Commands](reference/commands.md) — supported root commands and their
  responsibilities.
- [Environment](reference/environment.md) — root environment variables,
  validation ownership, and local origins.
- [Application layer](reference/application-layer.md) — where business
  operations live and what stays in the API.
- [Code generation](reference/code-generation.md) — Drizzle, OpenAPI, Orval,
  and TanStack generated artifacts.
- [Toolchain](reference/toolchain.md) — pinned runtimes, package manager, and
  development tools.
- [Fastify runtime](reference/fastify-runtime.md) — logging, security-header
  policy, health endpoints, and graceful shutdown.
- [Web UI](reference/web-ui.md) — Tailwind, shadcn/Base UI, fonts, theme boot,
  and the minimal initial screen.

## Architecture decisions

- [ADR 0001: Layered workspaces with mirrored Modules](adr/0001-layered-workspaces-with-mirrored-modules.md)
- [ADR 0002: TypeBox HTTP contracts and Valibot UI validation](adr/0002-typebox-http-contracts-and-valibot-ui-validation.md)
- [ADR 0003: RFC 9457 errors for the First-Party API](adr/0003-rfc-9457-errors-for-first-party-api.md)
- [ADR 0004: The application layer is transport-agnostic](adr/0004-application-layer-is-transport-agnostic.md)
- [ADR 0005: Direct Drizzle access without default repositories](adr/0005-direct-drizzle-access-without-default-repositories.md)
- [ADR 0006: Testcontainers owns disposable PostgreSQL](adr/0006-testcontainers-own-disposable-postgres.md)
- [ADR 0007: Test through public seams](adr/0007-test-through-public-seams.md)
- [ADR 0008: Fastify owns Better Auth](adr/0008-fastify-owns-better-auth.md)
- [ADR 0009: Modules own authorization](adr/0009-modules-own-authorization.md)
- [ADR 0010: Commit generated source artifacts](adr/0010-commit-generated-source-artifacts.md)
- [ADR 0011: Modules call public APIs directly](adr/0011-modules-call-public-apis-directly.md)
