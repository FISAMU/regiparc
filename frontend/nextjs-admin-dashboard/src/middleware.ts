/**
 * Middleware Next.js — protection des routes authentifiées.
 *
 * Si le cookie `auth_token` est absent → redirection vers /auth/sign-in.
 * Les pages auth et assets restent publiques.
 *
 * Note: on utilise middleware.ts (Edge) plutôt que proxy.ts (Node)
 * pour éviter MIDDLEWARE_INVOCATION_FAILED sur Vercel / Next 16.
 */
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/api/",
  "/_next/",
  "/images/",
  "/favicon.ico",
  "/logo-regideso.png",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const authToken = request.cookies.get("auth_token")?.value;
  if (!authToken) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
