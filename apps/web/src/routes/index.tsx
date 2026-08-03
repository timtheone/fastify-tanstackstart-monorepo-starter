import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRightIcon, CubeIcon } from "@phosphor-icons/react";
import { ThemeSwitcher } from "~/components/theme-switcher";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/")({ component: IndexPage });

function IndexPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <section className="w-full max-w-3xl rounded-2xl border bg-card p-8 shadow-sm sm:p-12">
        <div className="flex items-start justify-between gap-6">
          <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <CubeIcon size={22} weight="duotone" aria-hidden="true" />
          </div>
          <ThemeSwitcher />
        </div>
        <p className="mt-16 text-sm font-medium text-muted-foreground">Modular monorepo starter</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Start with the boundaries already decided.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
          Fastify, TanStack Start, PostgreSQL, generated contracts, and authentication are wired and
          ready for your first Module.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/sign-up" className={cn(buttonVariants({ size: "lg" }), "rounded-lg")}>
            Create account <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
          </Link>
          <Link
            to="/sign-in"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-lg")}
          >
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
