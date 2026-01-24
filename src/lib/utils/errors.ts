import { NextResponse } from "next/server";

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

export function ErrorToNextResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.clientMessage },
      { status: error.status },
    );
  }

  console.error("Unhandled server error:", (error as any).message ?? error);
  return NextResponse.json(
    { error: "Unknown server error. Please try again later." },
    { status: 500 },
  );
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
