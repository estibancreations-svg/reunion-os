import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();
  res.headers.set('x-reunion-version', '5.0');
  if (pathname.startsWith('/admin') || pathname.startsWith('/user')) {
    res.headers.set('x-robots-tag', 'noindex, nofollow');
  }
  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/login'],
};
