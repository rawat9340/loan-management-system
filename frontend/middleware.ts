import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/'];

const ROLE_PATHS: Record<string, string[]> = {
  BORROWER: ['/dashboard/borrower', '/apply'],
  ADMIN: ['/dashboard/admin'],
  SALES: ['/dashboard/sales'],
  SANCTION: ['/dashboard/sanction'],
  DISBURSEMENT: ['/dashboard/disbursement'],
  COLLECTION: ['/dashboard/collection'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for auth token in cookie or header (Next.js middleware can't access localStorage)
  // We use a cookie-based flag set by the client
  const authCookie = request.cookies.get('lms_authenticated');
  const roleCookie = request.cookies.get('lms_role');

  if (!authCookie?.value) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const role = roleCookie?.value;

  // Check role-based access
  if (role) {
    const allowedPaths = ROLE_PATHS[role] || [];
    const isDashboard = pathname.startsWith('/dashboard/') || pathname.startsWith('/apply');

    if (isDashboard) {
      const hasAccess = allowedPaths.some((p) => pathname.startsWith(p));
      // ADMIN can access everything
      if (!hasAccess && role !== 'ADMIN') {
        const defaultPath = ROLE_PATHS[role]?.[0] || '/login';
        return NextResponse.redirect(new URL(defaultPath, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
