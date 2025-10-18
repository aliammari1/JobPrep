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
    "/admin",
    "/schedule-interview",
    "/interview-scheduler",
    "/interview-room",
    "/mock-interview",
    "/mock-simulator",
    "/practice-interview",
    "/voice-interview",
    "/code-challenge",
    "/collaborative-evaluation",
    "/ai-analysis",
    "/ai-feedback",
    "/performance-analytics",
    "/interview-analytics",
    "/interview-insights",
    "/interview-dashboard",
    "/interview-coach",
    "/replay-center",
    "/video-recorder",
    "/screen-sharing",
    "/adaptive-questions",
    "/skill-assessment",
    "/question-builder",
    "/templates-library",
    "/candidate-profile",
    "/feedback",
    "/organizations",
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

  // Admin routes require admin role
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Check if user has admin role (admin plugin adds role to session)
    if (session.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
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
