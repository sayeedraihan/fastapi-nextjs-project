import { StudentDeleteParams } from "@/app/(students)/student-list/table/row/row";
import { Student } from "@/app/contexts/student-context";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { catchError } from "../route_utils";

const PUT = async(
    request: NextRequest, 
    // context: { params: Promise<StudentDeleteParams> } // "npm run build" asked to use this instead of the above params.
) => {
    const deleteParams: StudentDeleteParams = await request.json();
    console.log("Delete Params: " + deleteParams.id);
    try {
        const sessionTokenCookie = (await cookies()).get("session_token");
        const token = sessionTokenCookie?.value;
        const apiResponse = await fetch(`http://localhost:8000/delete-student-by-id`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(deleteParams)
        });

        if(!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || ("Failed to delete student with ID: " + deleteParams.id) },
                { status: apiResponse.status }
            );
        }
        const data: Student[] = await apiResponse.json();
        return NextResponse.json(data);
    } catch(error: unknown) {
        return catchError(error, 
            "Error caught during deleting a student. Error thrown from the route.ts file. For ID: ", 
            "Error caught during deleting a student. Error thrown from the route.ts file. For ID: " + deleteParams.id + ". Reason unknown."
        );
    }
}

export { PUT }