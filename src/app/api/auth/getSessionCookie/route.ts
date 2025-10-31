import { adminAuth } from "@/src/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. EXTRACT REQUEST CONTENTS
    // Here we extract the ID Token that must be provided by the user in the request
    const { idToken } = await req.json();

    if (!idToken) {
      console.log("Missing idToken");
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // 2. CREATE SESSION COOKIE
    // From the ID Token, we create a long lived session cookie (14 days)
    const expiresIn = 14 * 24 * 60 * 60; // 14 days in seconds

    const sessionCookie = await adminAuth
      .createSessionCookie(idToken, {
        expiresIn: expiresIn * 1000, // 14 days in milliseconds
      })
      .catch(() => undefined); // If the given ID Token has expired, session cookie will be undefined

    // If the seesion cookie is undefined, it means the given ID Token has expired
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Given ID Token has expired" },
        { status: 401 }
      );
    }

    // 3. INCLUDE SESSION COOKIE IN RESPONSE
    // Here we make a response and then include the cookie we just created inside of it
    const response = NextResponse.json({
      message: "Session cookie successfully set",
    });

    // Add the session cookie to the response.
    response.cookies.set("session", sessionCookie, {
      maxAge: expiresIn, // Automatically delete the cookie after a given delay (14 days)
      secure: process.env.NODE_ENV == "production", // Setting this to true makes the server transmit the cookie only via HTTPS requests
      path: "/", // Include the cookie in each request made by the client
      httpOnly: true, // Makes client side javascript unable to access the cookie
      sameSite: "strict", // Include the cookie only in request that originate from the same site
    });

    return response;
  } catch (error) {
    console.error("Error creating session cookie:", error);
    return NextResponse.json({ status: 500 });
  }
}
