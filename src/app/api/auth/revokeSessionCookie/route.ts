import { adminAuth } from "@/src/lib/firebase/firebaseAdmin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = NextResponse.json({ message: "Success!" });
    response.cookies.delete("session");

    const cookieStore = await cookies();
    const sessionCookie = await cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({
        error: "Error while logging out: User is not logged in",
      });
    }

    adminAuth.verifySessionCookie(sessionCookie).then((decodedClaims) => {
      adminAuth.revokeRefreshTokens(decodedClaims.uid);
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error while logging out" },
      { status: 500 }
    );
  }
}
