import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value; // Assuming token is stored in cookies

  // Define protected routes
  const protectedRoutes = ["/dashboard", "/profile", "/settings"]; // Add more protected routes

  // If user is trying to access a protected route but has no token, redirect to signin
  if (protectedRoutes.includes(req.nextUrl.pathname) && !token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next(); // Continue to requested page if authorized
}

// Apply middleware only to protected routes
export const config = {
  matcher: ["/dashboard", "/profile", "/settings"], // Adjust paths accordingly
};
