import { adminAuth } from "@/src/lib/firebase/firebaseAdmin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. EXTRACT REQUEST DATA
    // Here we get the sessionCookie that must be provided by the user in the request and also get the global parameter
    const { global } = await req.json();

    const cookieStore = await cookies();
    const sessionCookie = await cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Error while logging out: User is not logged in" },
        { status: 401 }
      );
    }

    // 2. COOKIE REVOCATION
    // If the global parameter is set to true, then we revoke all tokens associated to the account linked to the cookie, effectively logging out the user of all sessions
    if (global) {
      adminAuth.verifySessionCookie(sessionCookie).then((decodedClaims) => {
        adminAuth.revokeRefreshTokens(decodedClaims.uid);
      });
    }

    // Delete the cookie from the user's browser
    const response = NextResponse.json({ message: "Success!" });
    response.cookies.delete("session");

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error while logging out" },
      { status: 500 }
    );
  }
}
