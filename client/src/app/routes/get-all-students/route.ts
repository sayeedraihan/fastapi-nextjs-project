import { Student } from "@/app/(students)/students";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { catchError } from "../route_utils";

const GET = async() => {
    try {
        const sessionTokenCookie = (await cookies()).get("session_token");
        const token = sessionTokenCookie?.value;
        const apiResponse = await fetch(`http://127.0.0.1:8000/get-all-students`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        if(!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || "All Student Data fetching failed" },
                { status: apiResponse.status }
            );
        }

        const data: Student[] = await apiResponse.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        return catchError(error, 
            "Error caught during fetching all data /get-all-students/route.ts. Reason: ", 
            "Error caught during fetching all data /get-all-students/route.ts. Reason unknown."
        );
    }
}

export { GET }