import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, decodeSessionCookie } from "@/lib/session";

// Route protection middleware with session cookie validation.

const PROTECTED = ["/admin", "/user", "/comms"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAuth = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!needsAuth) return NextResponse.next();

  const session = decodeSessionCookie(req.cookies.get(SESSION_COOKIE)?.value);
  if (session) {
    return NextResponse.next();
  }

  const login = new URL("/login", req.url);
  login.searchParams.set("from", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/comms/:path*"],
};
