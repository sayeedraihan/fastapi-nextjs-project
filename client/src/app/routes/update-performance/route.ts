import { NextRequest, NextResponse } from "next/server";
import { catchError } from "../route_utils";
import { cookies } from "next/headers";
import { Performance } from "@/app/(students)/students";

const PUT = async (request: NextRequest) => {
    try {
        const performance: Performance = await request.json();
        const sessionTokenCookie = (await cookies()).get("session_token");
        const token = sessionTokenCookie?.value;

        const apiResponse = await fetch("http://localhost:8000/update-performance", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(performance)
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || "Failed to update performance" },
                { status: apiResponse.status }
            );
        }

        const data = await apiResponse.json();
        return NextResponse.json(data);

    } catch (error: unknown) {
        return catchError(error,
            "Error caught in /update-performance/route.ts. Reason: ",
            "Unknown error caught in /update-performance/route.ts."
        );
    }
}

export { PUT }