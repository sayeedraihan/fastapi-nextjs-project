import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { catchError } from "../route_utils";
import { CourseActionParams } from "@/app/(course)/course";

export const POST = async (request: NextRequest) => {
    try {
        const { courseId }: CourseActionParams = await request.json();
        const sessionTokenCookie = (await cookies()).get("session_token");
        const token = sessionTokenCookie?.value;

        const apiResponse = await fetch(`http://localhost:8000/courses/${courseId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || "Failed to delete course" },
                { status: apiResponse.status }
            );
        }

        const data = await apiResponse.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        return catchError(error, "Error deleting course: ", "Unknown error while deleting course");
    }
};