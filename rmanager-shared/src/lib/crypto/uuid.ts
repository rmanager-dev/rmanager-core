import crypto from "crypto";

export function GetUUID(length: number) {
  return Array.from(
    crypto.getRandomValues(new Uint8Array(Math.ceil(length / 2))),
  )
    .map((byte) => byte.toString(16).padStart(2, "0")) // Convert each byte (0-255) to hexadecimal. Ensure they are at least 2 chars wide
    .join("")
    .slice(0, length);
}
