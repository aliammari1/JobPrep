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

const AUTH_PAGES = ["/sign-in", "/sign-up", "/forgot-password"];

const PROTECTED_ROUTES = [
  "/dashboard",
  "/settings",
  "/profile",
  "/interview-scheduler",
  "/interview-room",
  "/mock-interview",
  "/code-challenge",
  "/recordings",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPage = AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`),
  );

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Skip session check completely for non-auth public pages
  if (!isAuthPage && !isProtectedRoute) {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const hasSessionCookie =
    cookieHeader.includes("better-auth.session_token") ||
    cookieHeader.includes("__Secure-better-auth.session_token") ||
    cookieHeader.includes("session_token");

  // Fast path: redirect unauthenticated users away from protected routes without subrequest
  if (isProtectedRoute && !hasSessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Fast path: unauthenticated users can visit auth pages without subrequest
  if (isAuthPage && !hasSessionCookie) {
    return NextResponse.next();
  }

  // Get session from Better Auth when session cookie is present
  try {
    const { data: session } = await betterFetch<BetterAuthSession>(
      "/api/auth/get-session",
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: cookieHeader,
        },
      },
    );

    // Redirect authenticated users away from auth pages
    if (isAuthPage && session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Redirect unauthenticated users to sign in
    if (isProtectedRoute && !session) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  } catch (_error) {
    if (isProtectedRoute) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes handle their own auth or are public)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public folder / assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*|public).*)",
  ],
};
