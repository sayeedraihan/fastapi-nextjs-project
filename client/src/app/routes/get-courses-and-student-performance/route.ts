import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server"
import { catchError } from "../route_utils";

const POST = async (request: NextRequest) => {
    try {
        const { student_id } = await request.json();
        const sessionTokenCookies = (await cookies()).get("session_token");
        const token = sessionTokenCookies?.value;

        const apiResponse = await fetch(`http://localhost:8000/get-courses-and-student-performance`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ student_id })
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || "Failed to fetch courses and performances" },
                { status: apiResponse.status }
            );
        }

        const data = await apiResponse.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        return catchError(error,
            "Error caught in /get-courses-and-student-performance/route.ts. Reason: ",
            "Unknown error caught in /get-courses-and-student-performance/route.ts."
        );
    }
}

export { POST }