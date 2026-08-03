export type AuthenticatedIdentity = Readonly<{
  userId: string;
  sessionId: string;
}>;

export class AuthorizationFailure extends Error {
  override readonly name = "AuthorizationFailure";

  constructor(message = "You are not allowed to perform this operation") {
    super(message);
  }
}
