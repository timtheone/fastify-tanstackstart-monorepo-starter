# Web UI Tooling

The web application in `apps/web` ships ready to build its interface with
Tailwind CSS and shadcn. This is infrastructure, not an example feature: the
Template does not add demonstration pages or components merely to prove that
the toolchain works.

## Tailwind CSS

- Use Tailwind CSS 4 through its Vite integration.
- Keep the application stylesheet under `apps/web/src` and reference it from
  `components.json`.
- Prefer CSS variables for design tokens so generated shadcn components share
  the application's theme vocabulary.
- Do not add a legacy Tailwind configuration file unless a real extension
  requires one.

Vite proxies `/api/*` requests to `API_INTERNAL_ORIGIN` during development and
local preview. Production deployments provide this same-origin routing at the
web-server or ingress layer; TanStack Start does not own an application proxy
route. Keep credentials and response headers intact when configuring that
infrastructure because Better Auth depends on its `Set-Cookie` response.

## TanStack Query and SSR

`apps/web/src/router.tsx` owns the QueryClient lifecycle. Create one client per
SSR request and reuse one browser singleton, configure shared query defaults
there, and install `@tanstack/react-router-ssr-query` for dehydration and
hydration. Route loaders prefetch route-critical data with
`context.queryClient.ensureQueryData(...)`; components read that cache through
the generated Orval hook using the same generated query key.

When a server loader calls a First-Party API, use the generated Fetch function
through a TanStack Start server function and inject the server-only Fetch
adapter from `apps/web/src/server/api-fetch.server.ts`. That adapter forwards
the incoming cookie and resolves the internal API origin. Do not fetch API data
in `useEffect`, bridge loader results with `initialData`, or pass native
`Headers` objects through server functions or the dehydrated cache.

## shadcn

Commit `apps/web/components.json` and keep it valid against the official
shadcn schema. It configures the CLI for:

- TanStack Start with TypeScript and TSX;
- Base UI primitives rather than Radix primitives;
- the `buFzlTs` preset;
- Tailwind CSS 4 and CSS-variable theming;
- non-RSC output, because TanStack Start SSR does not imply React Server
  Components;
- aliases rooted in `apps/web/src` for components, UI components, hooks,
  libraries, and `lib/utils`;
- namespaced registry consumption.

The preset resolves to the `lyra` style, neutral base and theme colors, Inter,
Phosphor icons, the default radius, and neutral chart colors. Treat the preset
code as the canonical configuration rather than maintaining these choices
independently.

Use the shadcn CLI through pnpm. The initialization command is:

```sh
pnpm dlx shadcn@latest init --preset buFzlTs --template start --base base
```

The `--base base` option is separate from the preset and is required to select
Base UI primitives.

Generated UI primitives belong in `apps/web/src/components/ui`. Application
components may compose them from `apps/web/src/components`; domain-specific
UI remains inside the relevant web Module. The CLI configuration must preserve
these boundaries.

The Template ships only the shadcn `Button` component. Projects install every
other component themselves through the configured CLI and registries. Do not
preinstall a component collection or add a component showcase.

## Forms

The Template does not install a form-state library and does not prescribe a
form-validation workflow. Its authentication UI remains local and minimal; it
must not introduce reusable form abstractions or establish when Valibot runs.

Valibot is available for browser-owned validation concerns, but each generated
project decides whether and how to use it in its forms. Projects may also add a
form library when their actual requirements justify one.

## Theme switching

Support three theme preferences: `light`, `dark`, and `system`. The default is
`system`, and the selected preference is stored in local storage under the
`theme` key.

The root route emits a small inline boot script before the application
stylesheet. It must:

1. read and validate the stored preference;
2. resolve `system` through `prefers-color-scheme`;
3. apply `light` or `dark` to the document element before first paint; and
4. set the matching `color-scheme` value.

The React `ThemeProvider` owns the same preference after hydration. Its public
hook exposes the current preference and `setTheme`. While `system` is selected,
the provider listens for operating-system theme changes and reapplies the
resolved document class. The root document suppresses the intentional class
hydration warning.

This follows Meridian's theme boot mechanism and prevents a light-theme flash
before a stored dark preference is applied. The Template uses the preset's
generated light and dark CSS variables rather than Meridian's product-specific
palette.

Ship an accessible `ThemeSwitcher` for choosing system, light, or dark. Build
it only from the installed shadcn `Button` and Phosphor icons; do not install
another shadcn component for this control. Represent the choices as one
labelled radio group, expose the selected state to assistive technology, and
use the provider's public `setTheme` operation.

Render the switcher on the Template's minimal index screen so the mechanism is
usable immediately. Keep it out of `RootDocument`: projects may relocate or
remove the control without changing theme initialization. Its presence does
not turn the index screen into a component showcase.

## Initial document loading

Follow Meridian's initial document-loading sequence:

- emit UTF-8 and responsive viewport metadata from the TanStack root route;
- import the compiled application stylesheet as a URL;
- preload that stylesheet;
- inline only the minimal boot CSS needed before the full stylesheet loads;
- load the full stylesheet asynchronously and mark the document enhanced when
  it is ready;
- provide a normal stylesheet link inside `noscript`;
- keep application content hidden behind a minimal boot surface until the full
  stylesheet is active; and
- reveal usable content if stylesheet loading fails rather than leaving the
  application permanently hidden.

Self-host the preset's Inter font through Fontsource. Preload only the Latin
WOFF2 file actually used above the fold, declare it with `font-display: swap`,
and include a system-font fallback. Do not copy Meridian's Geist or IBM Plex
Mono dependencies because they are not part of the selected preset.

## Registries

`components.json` supports namespaced registries so contributors can install
components through the shadcn CLI without manually copying files. Configure
the official shadcn registry and allow additional namespaced registries to be
added when a project needs them.

The Template consumes registries only. It does not contain a root
`registry.json`, registry build scripts, or publishing configuration.

## Sources

- [components.json reference](https://ui.shadcn.com/docs/components-json)
- [shadcn CLI](https://ui.shadcn.com/docs/cli)
- [Preset configuration](https://ui.shadcn.com/create?preset=buFzlTs)
- [Base UI support](https://ui.shadcn.com/docs/changelog/2026-01-base-ui)
- [Registry namespaces](https://ui.shadcn.com/docs/registry/namespace)
