import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Demo middleware — protect /admin and /user routes by requiring a simple cookie.
// Replace with Supabase Auth session check for production.

const PROTECTED = ["/admin", "/user"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAuth = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!needsAuth) return NextResponse.next();

  // Demo: accept any session cookie or query ?demo=1
  const session = req.cookies.get("reunion_session")?.value;
  const demo = req.nextUrl.searchParams.get("demo");

  if (session || demo === "1") {
    return NextResponse.next();
  }

  const login = new URL("/login", req.url);
  login.searchParams.set("from", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
