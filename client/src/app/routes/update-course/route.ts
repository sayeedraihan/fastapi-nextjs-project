import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { catchError } from "../route_utils";
import { Course } from "@/app/(course)/course";

export const PUT = async (request: NextRequest) => {
    try {
        const course: Course = await request.json();
        const sessionTokenCookie = (await cookies()).get("session_token");
        const token = sessionTokenCookie?.value;

        const apiResponse = await fetch(`http://localhost:8000/courses/${course.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(course),
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || "Failed to update course" },
                { status: apiResponse.status }
            );
        }

        const data = await apiResponse.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        return catchError(error, "Error updating course: ", "Unknown error while updating course");
    }
};