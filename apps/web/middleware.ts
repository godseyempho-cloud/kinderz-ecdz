import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Better-Auth typically names its session cookie "better-auth.session_token"
  // or uses a __beta prefix depending on your config. 
  // This check looks for any cookie containing "session_token"
  const cookies = request.cookies.getAll();
  const hasSession = cookies.some(c => c.name.includes("session_token"));

  const { pathname } = request.nextUrl;

  // 1. If NOT logged in and trying to access protected areas
  if (!hasSession && (pathname.startsWith("/dashboard") || pathname.startsWith("/attendance"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. If logged in and trying to access login or signup
  if (hasSession && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};