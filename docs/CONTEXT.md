# Starter Templates

Starter Templates are reusable, independently distributed foundations for creating new projects without repeating baseline architecture and tooling setup.

## Language

**Template**:
An independently versioned starting point that produces one runnable project with an established architecture, development workflow, and agent guidance.
_Avoid_: Boilerplate, example repository, template collection

**Reference Documentation**:
The detailed, prescriptive description of the Template's architecture and extension patterns, including illustrative structures that are not shipped as application features.
_Avoid_: Example module, sample code

**Agent Guide**:
The concise repository entry point for coding agents, containing essential rules and links to the relevant Reference Documentation.
_Avoid_: Complete architecture manual, duplicated documentation

**Module**:
A named domain capability that owns a cohesive area of product behavior and uses the same canonical name wherever that capability appears.
_Avoid_: Technical layer, workspace package, miscellaneous feature folder

**Module Public API**:
The intentionally exported operations and types through which other Modules interact with a Module. Files not exposed through this boundary are private to the owning Module.
_Avoid_: Deep import, internal helper, cross-Module file access

**HTTP Contract**:
The canonical TypeBox definition of an API request or response at the Fastify boundary. HTTP Contracts drive runtime validation, response serialization, OpenAPI generation, and generated client types.
_Avoid_: Frontend schema, database schema, manually duplicated request type

**UI Validation Schema**:
A Valibot schema owned by the web application for browser-specific state such as forms, incomplete inputs, files, and URL search parameters. It may map into an HTTP Contract but must not redefine one.
_Avoid_: Shared API contract, server validation, persistence schema

**Generated API Client**:
The web-facing Fetch transport, TanStack Query integrations, and request/response types generated from the API's OpenAPI document. It is the web application's typed view of HTTP Contracts.
_Avoid_: Runtime import of backend contract schemas, handwritten API interfaces

**First-Party API**:
The HTTP endpoints owned by the application's Modules and governed by the Template's HTTP Contracts. Better Auth-owned endpoints are an external boundary and are not part of the First-Party API.
_Avoid_: Every route mounted on the Fastify server, Better Auth API

**Problem Details**:
The shared RFC 9457 error representation returned by every First-Party API endpoint. Its `type` identifies the problem kind, while its remaining fields describe and correlate a particular occurrence.
_Avoid_: Error envelope, arbitrary error JSON, human message as error code

**Application Failure**:
An expected unsuccessful outcome of an application operation, named in the Module's product language and independent of any transport. The API translates an Application Failure into Problem Details when it crosses the HTTP boundary.
_Avoid_: HTTP error, status-code exception, Problem Details object

**Authenticated Identity**:
The application-facing representation of the current user and session resolved by the API from Better Auth. It contains only the stable identity information that Modules need.
_Avoid_: Raw Better Auth session, browser auth-client state, database user row

**Authorization Rule**:
A Module-owned business rule that decides whether an Authenticated Identity may perform a particular application operation. A rule may use roles, permissions, ownership, membership, entitlements, or other domain facts without requiring a universal RBAC model.
_Avoid_: Route permission, generic RBAC rule, authentication check
