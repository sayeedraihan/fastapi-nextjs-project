import { NextRequest, NextResponse } from "next/server";
import { catchError } from "../route_utils";
import { cookies } from "next/headers";

const PUT = async (request: NextRequest) => {
    try {
        const { student_id, course_id } = await request.json();
        const sessionTokenCookie = (await cookies()).get("session_token");
        const token = sessionTokenCookie?.value;

        const apiResponse = await fetch("http://localhost:8000/delete-performance", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ student_id, course_id })
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || "Failed to delete performance" },
                { status: apiResponse.status }
            );
        }

        const data = await apiResponse.json();
        return NextResponse.json(data);

    } catch (error: unknown) {
        return catchError(error,
            "Error caught in /delete-performance/route.ts. Reason: ",
            "Unknown error caught in /delete-performance/route.ts."
        );
    }
}

export { PUT }