import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { catchError } from "../route_utils";

const GET = async () => {
    try {
        const sessionTokenCookie = (await cookies()).get("session_token");
        const token = sessionTokenCookie?.value;
        
        const apiResponse = await fetch(`http://127.0.0.1:8000/get-utils`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if(!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || "Failed to fetch levels" },
                { status: apiResponse.status }
            );
        }

        const data = await apiResponse.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        return catchError(error,
            "Error caught in /utils/get-levels/route.ts. Reason: ",
            "Unknown error caught in /utils/get-levels/route.ts."
        );
    }
}

export { GET }