import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  
  // Resolve backend API URL
  const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || (
    request.nextUrl.hostname.includes("localhost") || request.nextUrl.hostname === "127.0.0.1"
      ? "http://localhost:8080/api"
      : "https://api.helpmeman.com/api"
  );

  const cleanBase = backendApiUrl.replace(/\/+$/, "");
  const targetUrl = new URL(`${cleanBase}/google/oauth/callback`);
  
  // Forward all query parameters (code, state, error, etc.)
  searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  return NextResponse.redirect(targetUrl.toString());
}
