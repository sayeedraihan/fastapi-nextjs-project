
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { catchError } from "../../routes/route_utils";

export const GET = async (request: NextRequest) => {
    try {
        const sessionTokenCookie = (await cookies()).get("session_token");
        const token = sessionTokenCookie?.value;

        if (!token) {
            return NextResponse.json({ detail: "Not authorized" }, { status: 401 });
        }

        const apiResponse = await fetch(`http://localhost:8000/users/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json(
                { detail: errorData.detail || "Failed to fetch user role" },
                { status: apiResponse.status }
            );
        }

        const data = await apiResponse.json();
        return NextResponse.json({ role: data.role });
    } catch (error: unknown) {
        return catchError(error, "Error fetching user role: ", "Unknown error while fetching user role");
    }
};
