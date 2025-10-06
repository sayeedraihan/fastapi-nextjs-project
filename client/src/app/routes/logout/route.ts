import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { catchError } from "../route_utils";

const POST = async() => {
    try {
        // Clear the session_token cookie
        (await cookies()).set("session_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: new Date(0), // Set the expiry date to the past
            sameSite: "strict",
            path: "/",
        });

        return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
    } catch (error: unknown) {
        return catchError(error, 
            "An internal server error occurred", 
            "An internal server error occurred"
        );
    }
}

export { POST }