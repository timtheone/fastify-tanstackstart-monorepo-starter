# Application layer

`packages/application` contains business operations normally called by Fastify
routes. These operations express product behavior without depending on HTTP, so
the same behavior can also be called from a job, CLI, or focused test.

```text
Fastify route -> application operation -> Drizzle/database or external service
```

The route authenticates the request, accepts validated HTTP input, calls an
application operation, and translates its result into an HTTP response. The
operation owns the business rules, authorization rules, and transaction
boundary.

## What belongs here

Add an application operation when a feature has meaningful product behavior,
such as:

- placing an order while checking stock and recording all changes atomically;
- inviting a team member while checking the caller's permission and preventing
  duplicate membership;
- archiving a project only when the caller owns it;
- cancelling a subscription according to billing rules;
- coordinating several database writes or an external service call.

Name operations in product language: `archiveProject`, `inviteTeamMember`, or
`placeOrder`. Give each Module its own directory when the product gains that
capability.

## Example boundary

An application operation receives plain values and explicit dependencies:

```ts
export async function archiveProject(
  database: Database,
  identity: AuthenticatedIdentity,
  projectId: string,
) {
  const project = await findProject(database, projectId);

  if (!project) throw new ProjectNotFound(projectId);
  if (project.ownerId !== identity.userId) throw new AuthorizationFailure();
  if (project.archivedAt) return;

  await markProjectArchived(database, projectId);
}
```

The Fastify route remains a thin HTTP adapter:

```ts
app.post("/api/projects/:projectId/archive", async (request, reply) => {
  await archiveProject(app.database, request.identity, request.params.projectId);
  return reply.code(204).send();
});
```

Application failures use product language rather than HTTP status codes. The
central Fastify error handler maps them to Problem Details when they cross the
HTTP boundary.

## What stays outside

Do not put these in `packages/application`:

- Fastify requests, replies, headers, cookies, or status codes;
- TypeBox HTTP contracts or OpenAPI concerns;
- environment parsing and server configuration;
- generic helpers unrelated to product behavior;
- repository interfaces for a single Drizzle implementation;
- one-line CRUD wrappers that add no rule, authorization, transaction, or reuse.

The package may stay small until real business behavior exists. The Template
does not ship a sample Module merely to demonstrate the pattern.

See [ADR 0004](../adr/0004-application-layer-is-transport-agnostic.md) for the
transport boundary, [ADR 0005](../adr/0005-direct-drizzle-access-without-default-repositories.md)
for persistence, and [ADR 0009](../adr/0009-modules-own-authorization.md) for
authorization ownership.
