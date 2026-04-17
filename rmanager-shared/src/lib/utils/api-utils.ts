import { createLogger } from "./logger";

const logger = createLogger("api-utils");

export type ErrorResponse = {
  code: string;
  message: string;
};

export class ApiError extends Error {
  public status: number;
  public clientMessage: string;

  constructor(status: number, message: string, clientMessage: string) {
    super(message);

    this.status = status;
    this.clientMessage = clientMessage;

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}

export function ResponseToError(response: ErrorResponse) {
  const { code, message } = response;
  return Error(message, { cause: code });
}

export const UserNotFound = new ApiError(401, "UserNotFound", "Unauthorized");
export const DatabaseError = new ApiError(
  502,
  "DatabaseError",
  "Couldn't reach database, please try again later.",
);
export const AccessDenied = new ApiError(
  403,
  "AccessDenied",
  "You don't have access to this resource",
);
export const AuthenticationRequired = new ApiError(
  403,
  "AuthenticationRequired",
  "You must reauthenticate to perform this action",
);
