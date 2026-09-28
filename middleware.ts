import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('ems_session');

  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  const isProtectedPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/employees') ||
    pathname.startsWith('/departments') ||
    pathname.startsWith('/positions') ||
    pathname.startsWith('/attendance') ||
    pathname.startsWith('/leave') ||
    pathname.startsWith('/payroll') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/team-profile') ||
    pathname.startsWith('/audit-logs') ||
    pathname.startsWith('/roles') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/documents');

  // If user is logged in and trying to access /login, redirect to /dashboard
  if (sessionCookie?.value && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not logged in and accessing protected pages, redirect to /login
  if (!sessionCookie?.value && isProtectedPage) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons|fonts).*)',
  ],
};
