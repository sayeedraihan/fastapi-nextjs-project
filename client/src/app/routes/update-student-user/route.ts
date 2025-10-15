import { NextRequest, NextResponse } from "next/server";
import { catchError } from "../route_utils";
import { cookies } from "next/headers";
import { AddUserRequest } from "@/app/(students)/students";

const POST = async (request: NextRequest) => {
    try {
        const addUserRequest: AddUserRequest = await request.json();
        const sessionTokenCookie = (await cookies()).get("session_token");
        const token = sessionTokenCookie?.value;

        console.log(JSON.stringify(addUserRequest));
        const apiResponse = await fetch("http://localhost:8000/add-user", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(addUserRequest)
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || "Failed to add user" },
                { status: apiResponse.status }
            );
        }

        const data = await apiResponse.json();
        return NextResponse.json(data);

    } catch (error: unknown) {
        return catchError(error,
            "Error caught in /add-user-credentials/route.ts. Reason: ",
            "Unknown error caught in /add-user-credentials/route.ts."
        );
    }
}

export { POST }