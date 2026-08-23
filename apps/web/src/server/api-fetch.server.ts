import { getRequestHeaders } from "@tanstack/react-start/server";
import { parseWebRuntimeEnvironment } from "~/server/environment.server";

export function createApiFetch(): typeof fetch {
  const environment = parseWebRuntimeEnvironment(process.env);
  const cookie = getRequestHeaders().get("cookie");

  return (input, init) => {
    const path = input instanceof Request ? input.url : input;
    const headers = new Headers(init?.headers);
    if (cookie) headers.set("cookie", cookie);
    return fetch(new URL(path, environment.API_INTERNAL_ORIGIN), { ...init, headers });
  };
}
