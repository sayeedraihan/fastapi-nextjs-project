import { StudentFilterParams } from "@/app/(students)/student-list/filter/page"
import { Student } from "@/app/(students)/students";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { catchError } from "../route_utils";

const POST = async(
    request: NextRequest,
    // context: { params: Promise<StudentFilterParams> }
) => {
    try {
        const filterParams: StudentFilterParams = await request.json();
        const sessionTokenCookie = (await cookies()).get("session_token");
        const token = sessionTokenCookie?.value;
        const apiResponse = await fetch(`http://localhost:8000/get-students-by-filter`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(filterParams)
        });
        
        if(!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || `filtered student list could not be fetched`},
                { status: apiResponse.status }
            );
        } else {
            const data: Student[] = await apiResponse.json();
            return NextResponse.json(data);
        }
    } catch(error: unknown) {
        return catchError(error, 
            "Could not fetch filtered data from Student table. Error caught on route.ts file. Reason: ", 
            "Could not fetch filtered data from Student table. Error caught on route.ts file. Reason unknown."
        );
    }
}

export { POST }