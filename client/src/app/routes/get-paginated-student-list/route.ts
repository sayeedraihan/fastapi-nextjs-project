import { Student, StudentListRequest, StudentListResponse } from "@/app/(students)/students";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { catchError } from "../route_utils";

const POST = async(
    request: NextRequest
) => {
    try {
        const studentListRequest: StudentListRequest = await request.json();
        const sessionTokenCookie = (await cookies()).get("session_token");
        const token = sessionTokenCookie?.value;
        const apiResponse = await fetch(`http://127.0.0.1:8000/get-all-students`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentListRequest)
        });
        if(!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || "Student Data fetching failed" },
                { status: apiResponse.status }
            );
        }

        const data: StudentListResponse = await apiResponse.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        return catchError(error, 
            "Error caught during fetching student list from /get-all-students/route.ts. Reason: ", 
            "Error caught during fetching student list from /get-all-students/route.ts. Reason unknown."
        )
    }
}

export { POST }