import { NextResponse } from "next/server";

const catchError = (error: unknown, errorMessage: string, unknownMessage: string): Response => {
    const detailMessage = (error instanceof Error) ? (errorMessage + error.message) : unknownMessage;
    return NextResponse.json(
        { detail: detailMessage },
        { status: 500 }
    );
}

export { catchError }