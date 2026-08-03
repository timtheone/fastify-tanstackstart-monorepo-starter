import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { createProxyServer } from "http-proxy-3";
import { nitro } from "nitro/vite";
import * as v from "valibot";
import { defineConfig, loadEnv, type Plugin, type PreviewServer, type ViteDevServer } from "vite";

// Nitro registers its catch-all before Vite's built-in proxy middleware.
function localApiProxy(target: string): Plugin {
  function configure(server: ViteDevServer | PreviewServer) {
    const proxy = createProxyServer({ target });
    server.middlewares.use((request, response, next) => {
      if (!request.url?.startsWith("/api")) return next();
      proxy.web(request, response, (error) => {
        server.config.logger.error(`Local API proxy failed: ${error.message}`);
        if (!response.headersSent) response.writeHead(502);
        if (!response.writableEnded) response.end();
      });
    });
  }

  return {
    name: "local-api-proxy",
    enforce: "pre",
    configureServer: configure,
    configurePreviewServer: configure,
  };
}

const WebOrigins = v.pipe(
  v.string(),
  v.transform((value) => value.split(",").map((origin) => origin.trim())),
  v.array(v.pipe(v.string(), v.url())),
);

const WebEnvironment = v.object({
  WEB_HOST: v.pipe(v.string(), v.nonEmpty()),
  WEB_PORT: v.pipe(
    v.string(),
    v.transform((value) => Number(value)),
    v.number(),
    v.integer(),
    v.minValue(1),
    v.maxValue(65_535),
  ),
  API_INTERNAL_ORIGIN: v.pipe(v.string(), v.url()),
  WEB_ORIGINS: WebOrigins,
});

export default defineConfig(({ mode }) => {
  const result = v.safeParse(WebEnvironment, loadEnv(mode, "../..", ""));
  if (!result.success) {
    throw new Error(
      `Invalid web configuration:\n${result.issues
        .map((issue) => `- ${v.getDotPath(issue) ?? "environment"}: ${issue.message}`)
        .join("\n")}`,
    );
  }

  Object.assign(process.env, {
    WEB_HOST: result.output.WEB_HOST,
    WEB_PORT: String(result.output.WEB_PORT),
    API_INTERNAL_ORIGIN: result.output.API_INTERNAL_ORIGIN,
  });

  return {
    envDir: "../..",
    server: {
      host: result.output.WEB_HOST,
      port: result.output.WEB_PORT,
      allowedHosts: result.output.WEB_ORIGINS.map((origin) => new URL(origin).hostname),
    },
    preview: {
      host: result.output.WEB_HOST,
      port: result.output.WEB_PORT,
    },
    resolve: {
      conditions: ["source"],
      tsconfigPaths: true,
    },
    plugins: [
      localApiProxy(result.output.API_INTERNAL_ORIGIN),
      tailwindcss(),
      tanstackStart({ srcDirectory: "src" }),
      viteReact(),
      nitro({ serverDir: "./server" }),
    ],
  };
});
