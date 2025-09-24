import { adminAuth } from "@/src/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const {idToken} = await req.json();
        if (!idToken) {
            console.log("Missing idToken")
            return NextResponse.json({error: "Missing idToken"}, {status: 400})
        }

        await adminAuth.revokeRefreshTokens(idToken.sub)

        const response = NextResponse.json({message: "Successfully logged out!"})
        response.cookies.delete("session")

        return response
    } catch(error) {
        console.error(error)
        return NextResponse.json({error: "Error while logging out"}, {status: 500})
    }
}