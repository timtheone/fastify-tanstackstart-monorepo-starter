import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ThemeSwitcher } from "~/components/theme-switcher";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";
import { sessionQueryOptions } from "~/lib/auth-session";

export const Route = createFileRoute("/app/")({ component: AppHome });

function AppHome() {
  const { session } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await authClient.signOut();
    queryClient.removeQueries({ queryKey: sessionQueryOptions().queryKey });
    await navigate({ to: "/" });
  }

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="w-full max-w-2xl rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Authenticated</p>
            <h1 className="mt-1 text-3xl font-semibold">Hello, {session.user.name}</h1>
          </div>
          <ThemeSwitcher />
        </div>
        <p className="mt-8 leading-7 text-muted-foreground">
          The application shell is ready. Add the first product Module across contracts,
          application, database, API, and web only where that behavior belongs.
        </p>
        <Button className="mt-8 rounded-lg" variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </section>
    </main>
  );
}
