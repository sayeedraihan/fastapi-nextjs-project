
import { LoginResponse } from "@/app/(auth)/login/page";
import { NextResponse } from "next/server";
import { catchError } from "../route_utils";

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000' || 'localhost:8000';

const POST = async(request: Request) => {
    try {
        const { username, password } = await request.json();
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        const apiResponse = await fetch(`${FASTAPI_URL}/get-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });
        if(!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || "Authentication failed" },
                { status: apiResponse.status }
            );
        }

        const data: LoginResponse = await apiResponse.json();
        const access_token: string = data.token["access_token"];

        const response = NextResponse.json(data);
        response.cookies.set("session_token", access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60*30,
            sameSite: "strict",
            path: "/"
        });

        console.log("Login Successful!");
        return response;

        // (await cookies()).set("session_token", access_token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     maxAge: 60*30,
        //     sameSite: "strict", 
        //     path: "/"
        // });
    } catch (error: unknown) {
        return catchError(error, 
            "An internal server error occured. Reason: ", 
            "An internal server error occured. Reason unknown."
        );
    }
}

export { POST }