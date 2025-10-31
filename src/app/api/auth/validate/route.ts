import { adminAuth } from "@/src/lib/firebase/firebaseAdmin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. EXTRACT REQUEST DATA
    // Here we get the session cookie and ID Token that must be provided by the user
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    const { idToken } = await req.json();

    // ID Token is required to validate session
    if (!idToken) {
      console.log("Missing idToken");
      return NextResponse.json({ error: "Missing idToken" }, { status: 401 });
    }

    // Generate a cookie if client doesnt have one yet
    if (!sessionCookie) {
      return NextResponse.json({ isSessionValid: false });
    }

    // 2.SESSION COOKIE CHECK
    // Here we check if the session cookie held by the user isn't revoked.
    // If it was revoked due to sensitive actions (email change, password change) or by a logout of all devices, the user must generate a new one
    const decodedCookie = await adminAuth
      .verifySessionCookie(sessionCookie, true) // Force check if the cookie is revoked
      .catch(() => undefined); // If cookie is not valid (throws an error), set the decoded cookie to undefined

    // If decodedCookie is undefined, it means it was revoked
    if (!decodedCookie) {
      return NextResponse.json({
        isSessionValid: false,
      });
    }

    // 3. ID TOKEN CHECK
    // Here we check if the ID Token (local session of the user) is revoked.
    const decodedToken = await adminAuth
      .verifyIdToken(idToken, true) // Force check if the provided ID Token is revoked
      .catch(() => undefined); // If the ID Token is not valid then set decodedToken to undefined

    // If the decodedToken is undefined, it means that the provided ID Token is invalid
    if (!decodedToken) {
      return NextResponse.json({
        isSessionValid: false,
      });
    }

    // 4. SYNCRONIZATION CHECK
    // If we got here, that means both the cookie and ID Token are valid.
    // We just ensure that both session and ID Token are linked to the same user.
    // This ensures that client and server side authentication are synced.
    return NextResponse.json({
      isSessionValid: decodedCookie.uid == decodedToken.uid,
    });
  } catch (error) {
    console.error("Error while verifying session: ", error);
    return NextResponse.json(
      { error: "Error while verifying session" },
      { status: 500 }
    );
  }
}
