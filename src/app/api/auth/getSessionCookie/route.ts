import { adminAuth } from "@/src/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { idToken } = await req.json()
        
        if (!idToken) {
            console.log("Missing idToken")
            return NextResponse.json({error: "Missing idToken"}, {status: 400})
        }

        const expiresIn = 60*60*24*14
        const sessionCookie = await adminAuth.createSessionCookie(idToken, {expiresIn: expiresIn})

        const response = NextResponse.json({message: "Session cookie successfully set"})
        response.cookies.set("session", sessionCookie, {
            maxAge: expiresIn,
            secure: process.env.NODE_ENV == "production",
            path: "/", 
            httpOnly: true,
            sameSite: "strict"
        })

        return response

    } catch (error) {
        console.error('Error creating session cookie:', error);
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }
}