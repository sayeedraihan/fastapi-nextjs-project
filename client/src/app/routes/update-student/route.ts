import { Student } from "@/app/(students)/students";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { catchError } from "../route_utils";

const POST = async(
    request: NextRequest,
) => {
    try {
        const studentData: Student = await request.json();
        const sessionTokenCookie = (await cookies()).get("session_token");
        const token = sessionTokenCookie?.value;
        const apiResponse = await fetch(`http://localhost:8000/update-student-by-id`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(studentData),
        });

        if(!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || `Update failed for Student ID: ${studentData.id}`},
                { status: apiResponse.status }
            );
        }
        const data: Student = await apiResponse.json(); // I changed the type from any to Student to pass "npm run build" command
        return NextResponse.json(data);
    } catch(error: unknown) {
        return catchError(error, 
            "Error during updating data for student. Message: ", 
            "Error during updating data for student. No message found."
        );
    }
}

export { POST }