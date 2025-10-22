import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const middleware = (request: NextRequest) => {
    const response = NextResponse.next();
    const sessionToken = request.cookies.get("session_token");
    const { pathname } = request.nextUrl;

    // Set theme cookie if not present
    if (!request.cookies.has("Theme")) {
        response.cookies.set("Theme", "Dark");
    }

    if (!sessionToken && pathname !== '/login') {
        console.log("!sessionToken pathname: " + pathname);
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if(!sessionToken && pathname === '/logout') {
        console.log("!sessionToken logout called: " + request.url);
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (sessionToken && pathname === '/login') {
        console.log("sessionToken pathname: " + request.url);
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    console.log("always pathname: " + pathname);
    return response;
}

// FIX: Add this config object to prevent the infinite loop
/*
* Match all request paths except for the ones starting with:
* - _next/static (static files)
* - _next/image (image optimization files)
* - favicon.ico (favicon file)
* - login (the login page itself)
* - authenticate (the authentication API route)
*/
export const config = {
    matcher: [ '/((?!_next/static|_next/image|favicon.ico|routes/).*)' ],
};

export { middleware }