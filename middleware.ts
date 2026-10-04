import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session-token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  // A cookie only counts if its signature checks out; forged or expired ones are treated as logged out
  const isLoggedIn = (await verifySessionToken(sessionCookie?.value)) !== null;

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
    pathname.startsWith('/documents') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/expenses') ||
    pathname.startsWith('/helpdesk') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/org-chart') ||
    pathname.startsWith('/tasks');

  // If user is logged in and trying to access /login, redirect to /dashboard
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not logged in and accessing protected pages, redirect to /login
  if (!isLoggedIn && isProtectedPage) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    if (sessionCookie) response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons|fonts).*)',
  ],
};
