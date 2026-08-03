import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ComponentProps, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";
import { sessionQueryOptions } from "~/lib/auth-session";

type Authenticate = (values: FormData) => Promise<string | null>;

export function SignInForm() {
  return (
    <AuthForm
      authenticate={signIn}
      title="Welcome back"
      submitLabel="Sign in"
      alternate={
        <>
          Need an account? <AuthLink to="/sign-up">Register</AuthLink>
        </>
      }
    >
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        minLength={8}
      />
    </AuthForm>
  );
}

export function SignUpForm() {
  return (
    <AuthForm
      authenticate={signUp}
      title="Create your account"
      submitLabel="Create account"
      alternate={
        <>
          Already registered? <AuthLink to="/sign-in">Sign in</AuthLink>
        </>
      }
    >
      <Field label="Name" name="name" type="text" autoComplete="name" />
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
      />
    </AuthForm>
  );
}

function AuthForm({
  authenticate,
  title,
  submitLabel,
  alternate,
  children,
}: Readonly<{
  authenticate: Authenticate;
  title: string;
  submitLabel: string;
  alternate: ReactNode;
  children: ReactNode;
}>) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  async function submit(values: FormData) {
    setError(null);
    const errorMessage = await authenticate(values);

    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    queryClient.removeQueries({ queryKey: sessionQueryOptions().queryKey });
    await navigate({ to: "/app" });
  }

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Modular Starter</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <form className="mt-8 space-y-5" action={submit}>
          {children}
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <SubmitButton>{submitLabel}</SubmitButton>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">{alternate}</p>
      </section>
    </main>
  );
}

async function signIn(values: FormData) {
  const result = await authClient.signIn.email({
    email: String(values.get("email")),
    password: String(values.get("password")),
  });
  return result.error ? (result.error.message ?? "Authentication failed") : null;
}

async function signUp(values: FormData) {
  const result = await authClient.signUp.email({
    email: String(values.get("email")),
    password: String(values.get("password")),
    name: String(values.get("name")),
  });
  return result.error ? (result.error.message ?? "Authentication failed") : null;
}

function SubmitButton({ children }: Readonly<{ children: ReactNode }>) {
  const { pending } = useFormStatus();

  return (
    <Button className="h-10 w-full rounded-lg" disabled={pending} type="submit">
      {pending ? "Working…" : children}
    </Button>
  );
}

function AuthLink({
  to,
  children,
}: Readonly<{ to: "/sign-in" | "/sign-up"; children: ReactNode }>) {
  return (
    <Link to={to} className="font-medium text-foreground underline underline-offset-4">
      {children}
    </Link>
  );
}

function Field({ label, ...props }: Readonly<{ label: string } & ComponentProps<"input">>) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        className="h-10 rounded-lg border bg-background px-3 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        required
        {...props}
      />
    </label>
  );
}
