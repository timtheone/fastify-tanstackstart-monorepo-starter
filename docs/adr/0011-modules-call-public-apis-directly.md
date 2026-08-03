# Modules call public APIs directly

When one Module needs behavior owned by another, it makes a synchronous TypeScript call through the callee's Module Public API. Cross-Module deep imports are forbidden, dependencies must remain acyclic, and the Template does not add an event bus, command bus, mediator, or other indirection without a concrete asynchronous requirement. This keeps the modular monolith navigable and replaceable enough without paying distributed-system or framework costs in advance.
