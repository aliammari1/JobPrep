import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface BetterAuthSession {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
  user: SessionUser;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/features",
    "/pricing",
    "/about",
    "/contact",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/email-otp",
    "/magic-link",
    "/phone-signin",
    "/verify-2fa",
  ];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/settings",
    "/profile",
    "/interview-scheduler",
    "/interview-room",
    "/mock-interview",
    "/code-challenge",
    "/recordings",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Get session from Better Auth
  const { data: session } = await betterFetch<BetterAuthSession>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }
  );

  // Redirect authenticated users away from auth pages
  if (isPublicRoute && session) {
    const authPages = ["/sign-in", "/sign-up", "/forgot-password"];
    if (authPages.some((page) => pathname.startsWith(page))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Redirect unauthenticated users to sign in
  if (isProtectedRoute && !session) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
