# Repository guidance files

## AGENTS.md

The generated repository contains one `AGENTS.md` at its root. Do not add
nested `AGENTS.md` files to workspaces or Modules in the Template.

The root file is a concise operating guide, not the architecture manual. It
must let an agent quickly discover:

- the workspace and Module map;
- the architectural boundaries that must not be crossed;
- the canonical package-manager and verification commands;
- which files are generated and which command regenerates each one;
- the location of detailed environment, code-generation, testing,
  authentication, API, UI, and architecture documentation.

Keep explanations and structural examples in `docs/`. `AGENTS.md` states the
rule and links to the document that explains it. Do not duplicate substantial
documentation in the instruction file because duplicated guidance will drift.

## Verification before handoff

`AGENTS.md` requires an agent to run formatting, linting, type checking, and
the tests relevant to its change before handing work back. Database or API
changes require the integration suite. Browser-facing flows require the
affected Playwright tests; unrelated changes do not require a full browser
suite.

The handoff must name the commands that ran and disclose any check that could
not run. Do not hide an unavailable or failing check behind a general claim
that the change was verified.

## Generated files

`AGENTS.md` identifies generated files and their owning commands. Agents must
not hand-edit TanStack's generated route tree, the downloaded OpenAPI snapshot,
Orval output, or Drizzle metadata. They change the owning source and run the
appropriate generator instead.

The Better Auth schema is committed project-owned source that consumers may
extend. Generated SQL migrations may be reviewed and adjusted before they are
applied, but a migration must not change after it has been shared or applied.
Schema changes after that point require a new migration.

Add a nested `AGENTS.md` only in a generated project when a workspace later
develops genuinely different instructions that cannot be stated clearly in
the root file. That is a consumer decision, not part of the Template baseline.

## README.md

The root `README.md` is a concise onboarding guide. It covers prerequisites,
how to obtain the Template, explicitly create and fill the root `.env`, install
dependencies, start PostgreSQL, apply migrations, start development, and find
the common daily commands. Each step must point to an observable result.

Keep architecture rationale, detailed Module structures, and subsystem
reference material in `docs/`. The README links to those documents instead of
reproducing them. It does not document deployment because the Template does
not prescribe a production topology.

## LICENSE

The Template does not include a `LICENSE` file or prescribe licensing for
generated projects. Licensing is a consumer-owned release decision.
