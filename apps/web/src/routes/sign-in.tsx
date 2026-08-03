import { createFileRoute } from "@tanstack/react-router";
import { SignInForm } from "./-auth-form";

export const Route = createFileRoute("/sign-in")({ component: SignInForm });
