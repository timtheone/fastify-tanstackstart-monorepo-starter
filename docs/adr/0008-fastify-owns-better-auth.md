# Fastify owns Better Auth

`apps/api` is the sole Better Auth server: it owns the Better Auth configuration, Drizzle adapter, generated auth schema integration, `/api/auth/*` handler, cookie/session verification, and conversion of a vendor session into an Authenticated Identity. `apps/web` uses the Better Auth React client against Fastify and never initializes a Better Auth server or connects to PostgreSQL. Better Auth endpoints retain their vendor protocol outside the First-Party API and Orval, while protected First-Party routes consume the Authenticated Identity exposed by a Fastify auth plugin. This matches the dedicated-backend topology and prevents two server processes from independently mutating authentication state.

The Template enables Better Auth email-and-password authentication only. It
does not configure social providers or Better Auth product plugins. Generated
projects add those capabilities deliberately when their credential,
authentication-flow, and schema requirements are known.

The web application ships working sign-in and open self-registration forms.
The committed Better Auth Drizzle schema and initial migration contain the
core tables required by both flows. Rendering the forms does not own or mutate
the database schema.

The Template does not require email verification and does not implement
forgotten-password or password-reset flows. It therefore has no mail-delivery
provider, reset-email callback, or email-service abstraction. A generated
project adds those concerns together when its delivery provider and recovery
policy are known.

Authentication endpoints use Better Auth's built-in rate limiting. The
Template does not wrap those endpoints with `@fastify/rate-limit`, add a
Fastify-wide throttling policy, or add distributed rate-limit storage. A
generated project chooses broader API limits and shared storage when its abuse
model and deployment topology are known.

Fastify does not expose a parallel First-Party session endpoint. Protected API routes use an internal Fastify authentication decorator backed by `auth.api.getSession`, which returns the transport-agnostic `AuthenticatedIdentity` to the route. The web app uses Better Auth's client from a TanStack Start server function, forwards the incoming request cookie to the internal API origin, and maps an unauthenticated result to `null`. That function is wrapped in shared TanStack Query options with a five-minute `gcTime`; the global QueryClient configuration owns the default `staleTime`, and route `beforeLoad` guards call `queryClient.ensureQueryData(...)`. Successful sign-in and sign-out flows explicitly remove or invalidate the session query so redirects cannot observe stale authentication state.

Better Auth's session cookie cache remains disabled. When the TanStack Query
entry is stale or absent, Better Auth resolves the opaque session token against
PostgreSQL instead of accepting cached session data from a second cookie. This
preserves immediate database-backed session revocation and keeps the browser
query as the only intentional freshness window. The session query key is
web-owned because Better Auth endpoints are outside the First-Party OpenAPI
client; OpenAPI-backed queries must use Orval's generated key factories instead.

Fastify and TanStack Start remain separate processes. Browser First-Party API clients use relative `/api/*` paths. Vite proxies those requests to `API_INTERNAL_ORIGIN` during development and local preview; production deployments provide that route through their web server or ingress instead of an application catch-all route. This separation also supports accessing the web server through a LAN or Tailscale hostname without hard-coding that hostname into the internal API address. The Template does not prescribe public hostnames, a hosting platform, or a specific production proxy.

The Better Auth React client always uses the same-origin `/api/auth` path and
therefore uses Vite's local proxy and the production reverse proxy. It has no browser-exposed
Better Auth URL environment variable. Fastify alone reads the absolute
`BETTER_AUTH_URL` used by the server configuration.

`WEB_ORIGINS` is the comma-separated, explicit allowlist of browser origins accepted by both Fastify CORS and Better Auth's `trustedOrigins`. Credentialed CORS is enabled for this allowlist and never uses a wildcard. Localhost, loopback, LAN, and Tailscale origins are added through environment configuration rather than inferred from request headers.
