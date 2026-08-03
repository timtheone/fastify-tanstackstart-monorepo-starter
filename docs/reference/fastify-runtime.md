# Fastify runtime

`apps/api` uses Fastify's built-in facilities directly. Runtime configuration
belongs to the API composition root rather than a shared framework wrapper.

## Logging

Enable Fastify's native Pino logger with environment-specific output:

- local development logs at `debug` through `pino-pretty`;
- non-development runtime logs structured JSON at `info`;
- tests disable logging unless a test explicitly supplies a logger while
  diagnosing a failure.

Keep Fastify's request-scoped logger and request identifiers. Application code
logs structured fields through `request.log` or an injected Pino child logger;
it does not wrap Pino behind a Template-owned logging interface. Pass Error
objects through an `err` field so Pino retains their stack and metadata.

The base logger configuration redacts authorization and cookie headers,
passwords, secrets, and tokens. Do not log request bodies from authentication
routes. Logs go to standard output; the Template does not configure files, log
rotation, aggregation vendors, or transports beyond local pretty-printing.

Pin `pino-pretty` in the dependency catalog as development-only tooling. Pino
itself comes through Fastify's supported logger integration rather than a
second independently configured application logger.

## HTTP security headers

The Template does not install `@fastify/helmet` and does not prescribe a
global HTTP security-header policy. Appropriate headers depend on the eventual
deployment topology and on which HTML and other resources the generated
project serves. Consumers add that policy when those requirements are known.

This does not change the existing API security boundaries. Keep credentialed
CORS restricted to the explicit `WEB_ORIGINS` allowlist, retain Better Auth's
origin and CSRF checks, and validate First-Party API requests against their
TypeBox schemas. Do not weaken those controls to accommodate a proxy or local
development configuration.

## Health endpoints

Expose two unauthenticated operational routes outside the application API
prefix:

- `GET /health/live` returns `200` when the Fastify process can serve a
  request. It does not query PostgreSQL or another dependency.
- `GET /health/ready` performs a lightweight PostgreSQL query. It returns `200`
  while the API can use its database and `503` otherwise.

Define small response schemas for both routes, but hide them from Swagger and
the generated OpenAPI document. They are deployment-neutral operational
signals, not First-Party API contracts, and Orval must not generate browser
functions for them. Do not add detailed process statistics, a metrics endpoint,
or vendor-specific health payloads.

## Graceful shutdown

The executable API entry point registers native Node handlers for `SIGINT` and
`SIGTERM`. On the first signal it logs the shutdown, awaits `fastify.close()`,
and reports a non-zero exit code if closing fails.

Resource-owning plugins release their resources through Fastify lifecycle
hooks. In particular, the database plugin closes its PostgreSQL pool in
`onClose`; the signal handler does not reach into package internals. Keep app
construction separate from process startup so integration tests can build and
close an instance without installing process-level handlers.

Do not add `close-with-grace` or another shutdown dependency for this baseline.
