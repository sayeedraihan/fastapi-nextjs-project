import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { catchError } from "../route_utils";
import { Course } from "@/app/(course)/course";

const POST = async (request: NextRequest) => {
    try {
        const course: Course = await request.json();
        const sessionTokenCookie = (await cookies()).get("session_token");
        const token = sessionTokenCookie?.value;
        const apiResponse = await fetch("http://localhost:8000/courses/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(course)
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || "Failed to add course" },
                { status: apiResponse.status }
            );
        }

        const data = await apiResponse.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        return catchError(error, "Error adding course: ", "Unknown error while adding course");
    }
}

export { POST };