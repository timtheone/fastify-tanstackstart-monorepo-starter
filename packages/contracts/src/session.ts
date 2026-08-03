import { Object, String, type Static } from "typebox";

const AuthenticatedIdentity = Object(
  {
    userId: String(),
    sessionId: String(),
  },
  { additionalProperties: false },
);

const SessionUser = Object(
  {
    id: String(),
    email: String({ format: "email" }),
    name: String(),
  },
  { additionalProperties: false },
);

export const SessionResponse = Object(
  {
    identity: AuthenticatedIdentity,
    user: SessionUser,
  },
  { $id: "SessionResponse", additionalProperties: false },
);

export type SessionResponse = Static<typeof SessionResponse>;
