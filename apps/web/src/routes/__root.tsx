import interLatinUrl from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ThemeProvider } from "~/components/theme-provider";
import type { RouterContext } from "~/router";
import appCss from "~/styles/app.css?url";

const inlineBootCss = `
:root{color-scheme:light;background:#fff;color:#252525} :root.dark{color-scheme:dark;background:#252525;color:#fafafa}
html,body{min-height:100%;margin:0;font-family:"Inter Variable",Inter,ui-sans-serif,system-ui,sans-serif}
:root[data-css="boot"] #app-root,:root:not([data-hydrated="true"]) #app-root{visibility:hidden}:root[data-css="enhanced"][data-hydrated="true"] #app-root{visibility:visible}
.boot-surface{position:fixed;inset:0;display:grid;place-items:center;background:inherit;color:inherit;font:500 14px/1.5 "Inter Variable",Inter,ui-sans-serif,system-ui,sans-serif}
:root:not([data-css]) .boot-surface,:root[data-css="enhanced"][data-hydrated="true"] .boot-surface{display:none}
`;

const themeBootScript = `(function(){try{var e=document.documentElement;e.setAttribute("data-css","boot");var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"&&t!=="system")t="system";var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var r=t==="system"?(d?"dark":"light"):t;e.classList.remove("light","dark");e.classList.add(r);e.style.colorScheme=r}catch(_){}})();`;

function stylesheetLoader(href: string) {
  return `(function(){var e=document.documentElement,l=document.createElement("link");l.rel="stylesheet";l.href=${JSON.stringify(href)};l.media="print";l.onload=function(){l.media="all";e.setAttribute("data-css","enhanced")};l.onerror=function(){e.setAttribute("data-css","enhanced")};document.head.appendChild(l)})();`;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Modular Starter" },
      { name: "description", content: "A production-minded modular monorepo starting point." },
    ],
    links: [
      {
        rel: "preload",
        href: interLatinUrl,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "preload", href: appCss, as: "style" },
    ],
    styles: [{ children: inlineBootCss }],
    scripts: [{ children: themeBootScript }, { children: stylesheetLoader(appCss) }],
  }),
  component: Root,
  notFoundComponent: NotFound,
});

function Root() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <noscript>
          <link rel="stylesheet" href={appCss} />
        </noscript>
      </head>
      <body suppressHydrationWarning>
        <div className="boot-surface" aria-live="polite">
          Loading application…
        </div>
        <div id="app-root">
          <ThemeProvider>{children}</ThemeProvider>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="w-full max-w-lg rounded-xl border bg-card p-8 text-card-foreground">
        <p className="text-sm text-muted-foreground">404</p>
        <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
        <Link to="/" className="mt-6 inline-block underline underline-offset-4">
          Return home
        </Link>
      </section>
    </main>
  );
}
