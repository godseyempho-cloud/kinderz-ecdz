import { NextResponse, type NextRequest } from "next/server";

const ROLE_ROUTES = {
  ADMIN: "/admin",
  PROVINCIAL: "/provincial",
  AUDITOR: "/auditor",
  SUPERVISOR: "/dashboard",
  ECD_USER: "/dashboard",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. PUBLIC & STATIC EXEMPTIONS
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") || 
    pathname === "/favicon.ico" ||
    pathname.startsWith("/register") || 
    pathname === "/login" ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // 2. FETCH SESSION
  const sessionRes = await fetch(new URL("/api/auth/get-session", request.url), {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  let session;
  try {
    session = await sessionRes.json();
  } catch (e) {
    session = null;
  }

  // 3. UNAUTHENTICATED REDIRECT
  if (!session || !session.user) {
    const isProtectedRoute = Object.values(ROLE_ROUTES).some(route => pathname.startsWith(route));
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  const userRole = session.user.role;

  // 4. ROLE-BASED ACCESS CONTROL (RBAC)
  if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL(ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES] || "/dashboard", request.url));
  }

  if (pathname.startsWith("/provincial") && userRole !== "PROVINCIAL") {
    return NextResponse.redirect(new URL(ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES] || "/dashboard", request.url));
  }

  if (pathname.startsWith("/auditor") && userRole !== "AUDITOR") {
    return NextResponse.redirect(new URL(ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES] || "/dashboard", request.url));
  }

  // 5. REDIRECT LOGGED-IN USERS FROM LOGIN PAGE
  if (pathname === "/login") {
    const targetPath = ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES] || "/dashboard";
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}; 