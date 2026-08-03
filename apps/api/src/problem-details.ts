import { AuthorizationFailure } from "@repo/application";
import type { ProblemDetailsBody, ProblemValidationErrorBody } from "@repo/contracts";
import type { FastifyError, FastifyInstance, FastifyRequest } from "fastify";
import { STATUS_CODES } from "node:http";
import { AuthenticationRequiredError } from "./plugins/auth.js";

const problemBase = "https://starter.invalid/problems";

function validationErrors(error: FastifyError): ProblemValidationErrorBody[] | undefined {
  return error.validation?.map((issue) => ({
    pointer:
      issue.instancePath ||
      ("missingProperty" in issue.params ? `/${String(issue.params.missingProperty)}` : "/"),
    detail: issue.message ?? "is invalid",
    keyword: issue.keyword,
  }));
}

function problem(
  request: FastifyRequest,
  status: number,
  slug: string,
  title: string,
  detail: string,
  errors?: ProblemValidationErrorBody[],
): ProblemDetailsBody {
  return {
    type: `${problemBase}/${slug}`,
    title,
    status,
    detail,
    instance: request.url,
    requestId: request.id,
    ...(errors ? { errors } : {}),
  };
}

export function installProblemDetails(app: FastifyInstance) {
  app.setNotFoundHandler((request, reply) => {
    return reply
      .code(404)
      .type("application/problem+json")
      .send(
        problem(request, 404, "not-found", "Not Found", "The requested resource was not found."),
      );
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error.validation) {
      return reply
        .code(400)
        .type("application/problem+json")
        .send(
          problem(
            request,
            400,
            "request-validation",
            "Request validation failed",
            "One or more request values are invalid.",
            validationErrors(error),
          ),
        );
    }

    if (error instanceof AuthenticationRequiredError) {
      return reply
        .code(401)
        .type("application/problem+json")
        .send(
          problem(
            request,
            401,
            "authentication-required",
            "Authentication required",
            error.message,
          ),
        );
    }

    if (error instanceof AuthorizationFailure) {
      return reply
        .code(403)
        .type("application/problem+json")
        .send(problem(request, 403, "forbidden", "Forbidden", error.message));
    }

    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      const status = error.statusCode;
      return reply
        .code(status)
        .type("application/problem+json")
        .send(
          problem(
            request,
            status,
            `http-${status}`,
            STATUS_CODES[status] ?? "Request error",
            error.message,
          ),
        );
    }

    request.log.error({ err: error }, "Unhandled request error");
    return reply
      .code(500)
      .type("application/problem+json")
      .send(
        problem(
          request,
          500,
          "internal-server-error",
          "Internal Server Error",
          "An unexpected error occurred.",
        ),
      );
  });
}
