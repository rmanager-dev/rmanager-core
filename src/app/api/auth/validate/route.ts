import { adminAuth } from "@/src/lib/firebase/firebaseAdmin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = await cookieStore.get("session")?.value;

    const { idToken } = await req.json();

    if (!idToken) {
      console.log("Missing idToken");
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    if (!sessionCookie) {
      return NextResponse.json({ isSessionValid: false });
    }

    const decodedCookie = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );
    const cookieUID = decodedCookie.uid;

    const decodedIdToken = await adminAuth.verifyIdToken(idToken);
    const tokenUID = decodedIdToken.uid;

    return NextResponse.json({
      isSessionValid: cookieUID == tokenUID,
    });
  } catch (error) {
    console.error("Error while verifying session: ", error);
    return NextResponse.json(
      { error: "Error while verifying session" },
      { status: 401 }
    );
  }
}
