# Toolchain

The Template targets the stable toolchain below. Versions shown are the
accepted baseline as of July 2026 and are updated deliberately rather than
floating during installation.

## Node.js

**Tested version:** Node.js `24.18.0`

**Accepted range:** `>=24.18.0 <25`

`.node-version` selects the tested patch for version managers and downstream
automation, while `engines.node` permits later compatible Node 24 security
releases. Node.js 26 remains a
Current release until its LTS transition, so the Template uses the established
LTS line for application runtime, scripts, and local development.

## pnpm

**Version:** `11.18.0`

The root `package.json` pins this exact version through `packageManager`. pnpm 12 is excluded while it remains a beta release.

All third-party dependency versions are exact entries in the default `catalog` in `pnpm-workspace.yaml`, and workspace manifests reference them through `catalog:`. `catalogMode: strict` rejects uncatalogued third-party versions. Private `@repo/*` dependencies use `workspace:*`, and `pnpm-lock.yaml` is committed.

## TypeScript

**Version:** `typescript@^7.0.2`

TypeScript 7 is the normal compiler and type checker. The Template does not preinstall TypeScript 6. If an otherwise required tool is verified to depend on the removed programmatic compiler API, the compatibility package `@typescript/typescript6@^6.0.2` may be added alongside TypeScript 7 and the reason must be documented.

## Docker

**Minimum versions:** Docker Engine `24.0.0`, Docker Compose `2.20.0`

Compose owns only the persistent local-development PostgreSQL service;
integration and browser tests create disposable PostgreSQL containers through
Testcontainers.

## Workspace package builds

Apps and private `@repo/*` packages are ESM. Each Node-consumed internal
package exposes its TypeScript entry point under a custom `source` condition
and its compiled JavaScript entry point as the default export. Development and
tests enable the `source` condition and use `tsx`, so changes are consumed
without rebuilding every dependency first.

Each internal package still owns a `tsconfig.build.json` and compiles to
`dist/` with `tsc`. The Fastify app does the same and its start command runs
`node dist/index.js` without the `source` condition or a TypeScript runtime
loader. Builds emit JavaScript and source maps, but not declaration files or
declaration maps. Type checking and editor consumers resolve TypeScript source
through the package's `types` export. Source files use Node-compatible ESM
imports. Relative imports in the Fastify app and Node-consumed packages use
explicit `.js` specifiers in TypeScript source. NodeNext and `tsx` resolve
those specifiers to the corresponding TypeScript files during development,
while `tsc` preserves paths that are already correct in emitted JavaScript.

Vite-only web source may use extensionless relative imports because Vite owns
their resolution and bundles the output. Bare workspace imports such as
`@repo/db` use package exports and do not include file extensions. Do not use
extensionless relative imports in code whose emitted JavaScript runs directly
in Node.

Turbo's `build` task depends on `^build`, which builds internal dependencies
before their consumers, and caches `dist/**` plus the TanStack app's build
output. Do not add a backend or package bundler to the baseline. These packages
are private workspace implementation units, not independently published npm
packages.

## Hosted automation

The Template does not ship GitHub Actions or another hosted CI configuration.
It exposes the local quality, build, and test commands that a generated project
may compose into its chosen automation platform.
