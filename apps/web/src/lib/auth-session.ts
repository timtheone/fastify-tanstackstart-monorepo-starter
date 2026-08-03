import type { GetSession200 } from "@repo/api-client";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { parseWebRuntimeEnvironment } from "~/server/environment.server";

const getServerSession = createServerFn({ method: "GET" }).handler(async () => {
  const environment = parseWebRuntimeEnvironment(process.env);
  const cookie = getRequestHeaders().get("cookie");
  if (!cookie) return null;

  const response = await fetch(new URL("/api/session", environment.API_INTERNAL_ORIGIN), {
    headers: { cookie },
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`Unable to read the current session (${response.status})`);
  return (await response.json()) as GetSession200;
});

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: ["session"] as const,
    queryFn: () => getServerSession(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}
