import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { createAuthClient } from "better-auth/client";
import { parseWebRuntimeEnvironment } from "~/server/environment.server";

const getServerSession = createServerFn({ method: "GET" }).handler(async () => {
  const environment = parseWebRuntimeEnvironment(process.env);
  const cookie = getRequestHeaders().get("cookie");
  if (!cookie) return null;

  const auth = createAuthClient({
    baseURL: environment.API_INTERNAL_ORIGIN,
    fetchOptions: { headers: { cookie } },
  });
  const { data, error } = await auth.getSession();
  if (error) {
    if (error.status === 401) return null;
    throw new Error(`Unable to read the current session (${error.status})`);
  }
  return data;
});

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: ["session"] as const,
    queryFn: () => getServerSession(),
    gcTime: 5 * 60_000,
  });
}
