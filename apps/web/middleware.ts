import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/get-session";

/**
 * Mapping of roles to their primary landing pages.
 */
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
  // These routes are accessible to everyone (auth not required)
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

  // 2. GET SESSION DIRECTLY
  // Direct import avoids the "fetch failed" loop often seen in containerized dev environments.
  const session = await getSession();

  // 3. UNAUTHENTICATED REDIRECT
  // If no user is logged in, and they try to access a protected route, send to login.
  if (!session || !session.user) {
    const isProtectedRoute = Object.values(ROLE_ROUTES).some((route) =>
      pathname.startsWith(route)
    );

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Cast the role to ensure TypeScript recognizes it as a key of our route mapping
  const userRole = session.user.role as keyof typeof ROLE_ROUTES;

  // 4. ROLE-BASED ACCESS CONTROL (RBAC)
  // Ensure users can only stay in the folder assigned to their role.
  const isUnauthorizedAccess = (folder: string, allowedRole: string) => 
    pathname.startsWith(folder) && userRole !== allowedRole;

  if (
    isUnauthorizedAccess("/admin", "ADMIN") ||
    isUnauthorizedAccess("/provincial", "PROVINCIAL") ||
    isUnauthorizedAccess("/auditor", "AUDITOR")
  ) {
    // Redirect to their actual role's home or a safe fallback
    const targetPath = ROLE_ROUTES[userRole] || "/dashboard";
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  // 5. PREVENT LOGGED-IN USERS FROM VISITING LOGIN PAGE
  // If they are already authenticated, send them to their dashboard.
  if (pathname === "/login") {
    const targetPath = ROLE_ROUTES[userRole] || "/dashboard";
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  return NextResponse.next();
}

/**
 * Matcher ensures middleware only runs on actual page routes, 
 * skipping static assets for performance.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};