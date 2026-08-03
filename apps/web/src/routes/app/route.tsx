import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "~/lib/auth-session";

export const Route = createFileRoute("/app")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(sessionQueryOptions());
    if (!session) throw redirect({ to: "/sign-in" });
    return { session };
  },
  component: Outlet,
});
