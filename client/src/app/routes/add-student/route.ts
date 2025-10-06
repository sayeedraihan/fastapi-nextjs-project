import { Student, StudentBase } from "@/app/(students)/students";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { catchError } from "../route_utils";

const POST = async(
    request: NextRequest,
    // context: { params: Promise<{}> } // Using {} instead of CreateStudentParams just to make the npm run build "ERRORLESS"
) => {
    try {
        const new_student: StudentBase = await request.json();
        const sessionTokenCookie = (await cookies()).get("session_token");
        const token = sessionTokenCookie?.value;
        const apiResponse = await fetch("http://localhost:8000/add-new-student/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(new_student)
        });
        
        if(!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || "Creating a new student failed"},
                { status: apiResponse.status }
            );
        }
        const data: Student = await apiResponse.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        return catchError(error, 
            "Error caught during adding a new student. Reason: ", 
            "Error caught during adding a new student. Reason unknown."
        );
    }
}

export { POST }