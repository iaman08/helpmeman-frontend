import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Derive the correct dashboard route from the user role cookie. */
function getDashboardDest(request: NextRequest): string {
  const role = request.cookies.get("helpmeman.role")?.value;
  if (role === "SUPER_ADMIN") return "/superadmin";
  if (role === "ADMIN") return "/admin";
  if (role === "MENTOR") return "/mentor";
  return "/dashboard";
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("helpmeman.accessToken")?.value;
  const { pathname } = request.nextUrl;

  // ── Authenticated user hitting the landing page ──────────────────────────
  // Redirect instantly at the edge — no React, no flash, no delay.
  if (pathname === "/" && token) {
    const url = request.nextUrl.clone();
    url.pathname = getDashboardDest(request);
    const response = NextResponse.redirect(url);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  // ── Protected routes: redirect unauthenticated users to signin ────────────
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
    "/",
    "/dashboard/:path*",
    "/mentor/:path*",
    "/admin/:path*",
    "/superadmin/:path*",
    "/onboarding/:path*",
  ],
};
