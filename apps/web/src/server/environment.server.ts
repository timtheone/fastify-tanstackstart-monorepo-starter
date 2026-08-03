import * as v from "valibot";

const Port = v.pipe(
  v.string(),
  v.transform((value) => Number(value)),
  v.number(),
  v.integer(),
  v.minValue(1),
  v.maxValue(65_535),
);

const WebRuntimeEnvironment = v.object({
  WEB_HOST: v.pipe(v.string(), v.nonEmpty()),
  WEB_PORT: Port,
  API_INTERNAL_ORIGIN: v.pipe(v.string(), v.url()),
});

export function parseWebRuntimeEnvironment(environment: NodeJS.ProcessEnv) {
  const result = v.safeParse(WebRuntimeEnvironment, environment);
  if (!result.success) {
    throw new Error(
      `Invalid web runtime configuration:\n${result.issues
        .map((issue) => `- ${v.getDotPath(issue) ?? "environment"}: ${issue.message}`)
        .join("\n")}`,
    );
  }
  return result.output;
}
