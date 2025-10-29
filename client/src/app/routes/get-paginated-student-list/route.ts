import { StudentListResponse } from "@/app/(students)/students";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { catchError } from "../route_utils";

const GET = async(
    request: NextRequest
) => {
    try {
        const sessionTokenCookie = (await cookies()).get("session_token");
        const token = sessionTokenCookie?.value;

        if (!token) {
            console.error("API Route: Authorization token missing.");
            return NextResponse.json({ detail: "Authorization token missing" }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);

        const fastAPIUrl = new URL("http://127.0.0.1:8000/get-all-students");
        fastAPIUrl.search = searchParams.toString();

        const apiResponse = await fetch(fastAPIUrl.href, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
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

export { GET }