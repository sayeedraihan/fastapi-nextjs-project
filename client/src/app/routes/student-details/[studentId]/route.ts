import { StudentDetailsParams } from "@/app/(students)/student-details/[studentId]/page";
import { Student } from "@/app/(students)/students";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { catchError } from "../../route_utils";

const GET = async(
    request: NextRequest,
    context: { params: Promise<StudentDetailsParams> }
) => {
    try {
        const params = await context.params;
        const id = params.studentId;
        const sessionTokenCookie = (await cookies()).get("session_token");
        const token = sessionTokenCookie?.value;
        const apiResponse = await fetch(`http://localhost:8000/get-student-by-id/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if(!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || `Data fetching failed for student ID: ${id}`},
                { status: apiResponse.status }
            );
        } else {
            const data: Student = await apiResponse.json(); // Added type Student to pass "npm run build" command.
            return NextResponse.json(data);
        }

    } catch(error: unknown) {
        return catchError(error, 
            "Error during fetching specific student data. Reason: ", 
            "Error during fetching specific student data. Reason Unknown"
        );
    }
}

export { GET }