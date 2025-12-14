import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";
import { headers } from "next/headers";

export async function proxy(request: NextRequest) {
  // Only handle the root path
  if (request.nextUrl.pathname === "/") {
    // Check for the session cookie (adjust 'session' to your cookie name)
    const data = await auth.api.getSession({ headers: await headers() });

    const url = request.nextUrl.clone();

    if (data?.user) {
      // Redirect to /dashboard if session exists
      url.pathname = "/dashboard";
    } else {
      // Redirect to /home if no session
      url.pathname = "/home";
    }

    return NextResponse.redirect(url);
  }

  // For all other paths, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
