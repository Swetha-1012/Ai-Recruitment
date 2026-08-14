import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const url = request.nextUrl.clone();

  // If visiting dashboard routes and no token is present, redirect to login
  if (url.pathname.startsWith("/dashboard")) {
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // If visiting login/register pages and a token is present, redirect to dashboard root redirect page
  if (["/login", "/register"].includes(url.pathname)) {
    if (token) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Limit the middleware to match only pages
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
