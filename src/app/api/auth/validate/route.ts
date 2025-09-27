import { adminAuth } from "@/src/lib/firebase/firebaseAdmin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
const cache = await import("memory-cache");

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = await cookieStore.get("session")?.value;

    const { idToken } = await req.json();

    // ID Token is required to validate session
    if (!idToken) {
      console.log("Missing idToken");
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // Generate a cookie if client doesnt have one yet
    if (!sessionCookie) {
      return NextResponse.json({ isSessionValid: false });
    }

    // Try to get the cookie UID in cache
    const cookieUID_cache_key = `session:${sessionCookie}`;
    let cookieUID = cache.get(cookieUID_cache_key);

    // If cache expired refetch new UID
    if (!cookieUID) {
      console.log("Fetching cookie info");
      const decodedCookie = await adminAuth
        .verifySessionCookie(sessionCookie, true)
        .catch(() => {
          // If cookie is not valid (throws an error), set the decoded cookie to undefined
          return undefined;
        });

      // If decodedCookie is undefined, it means it has expired
      if (!decodedCookie) {
        return NextResponse.json({
          isSessionValid: false,
        });
      }

      // If cookie expires in 1 hour or less, regenerate one
      if (decodedCookie.exp - Date.now() / 1000 <= 60 * 60) {
        return NextResponse.json({
          isSessionValid: false,
        });
      }

      // Cache new cookie UID
      cookieUID = decodedCookie.uid;
      cache.put(cookieUID_cache_key, cookieUID, 3600 * 1000);
    }

    // Try to get token UID in cache
    const tokenUID_cache_key = `idToken:${idToken}`;
    let tokenUID = cache.get(tokenUID_cache_key);

    // If cache expires, get new UID
    if (!tokenUID) {
      console.log("Fetching token info");
      tokenUID = (await adminAuth.verifyIdToken(idToken)).uid;

      // Cache new tokn UID
      cache.put(tokenUID_cache_key, tokenUID, 3600 * 1000);
    }

    // User should refresh cookie if the session cookie isnt owned by local session
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
