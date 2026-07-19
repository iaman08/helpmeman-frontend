import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("helpmeman.accessToken")?.value;
  const { pathname } = request.nextUrl;

  const protectedPaths = ["/dashboard", "/mentor", "/admin", "/superadmin", "/onboarding"];
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    const response = NextResponse.redirect(url);
    // Ensure the redirect is not cached by the browser
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  const response = NextResponse.next();
  if (isProtected) {
    // Prevent caching of protected pages, disabling bfcache representation on logout
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/mentor/:path*",
    "/admin/:path*",
    "/superadmin/:path*",
    "/onboarding/:path*",
  ],
};
