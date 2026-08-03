import { Array, Integer, Object, Optional, String, type Static } from "typebox";

const ProblemValidationError = Object(
  {
    pointer: String(),
    detail: String(),
    keyword: String(),
  },
  { additionalProperties: false },
);

export const ProblemDetails = Object(
  {
    type: String(),
    title: String(),
    status: Integer({ minimum: 400, maximum: 599 }),
    detail: String(),
    instance: String(),
    requestId: String(),
    errors: Optional(Array(ProblemValidationError)),
  },
  { $id: "ProblemDetails", additionalProperties: false },
);

export type ProblemDetails = Static<typeof ProblemDetails>;
export type ProblemValidationError = Static<typeof ProblemValidationError>;
