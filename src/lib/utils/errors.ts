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
