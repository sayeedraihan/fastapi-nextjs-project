import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { catchError } from "../route_utils";

export const POST = async (request: NextRequest) => {
    try {
        const { userId } = await request.json();
        const sessionTokenCookie = (await cookies()).get("session_token");
        const token = sessionTokenCookie?.value;

        const apiResponse = await fetch(`http://localhost:8000/get-user-by-id`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ user_id: userId }),
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || "Failed to fetch user" },
                { status: apiResponse.status }
            );
        }

        const data = await apiResponse.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        return catchError(error, "Error fetching user: ", "Unknown error while fetching user");
    }
};