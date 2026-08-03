import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "./-auth-form";

export const Route = createFileRoute("/sign-up")({ component: SignUpForm });
