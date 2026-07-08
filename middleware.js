import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/api/auth', '/api/register'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // API routes that need auth check
  const isApiRoute = pathname.startsWith('/api') && !pathname.startsWith('/api/auth');

  // If user is not authenticated
  if (!token) {
    if (isPublicRoute) {
      return NextResponse.next();
    }
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and tries to access auth pages
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Role-based route protection
  const managerRoutes = ['/users', '/reports/team'];
  const isManagerRoute = managerRoutes.some(route => pathname.startsWith(route));

  if (isManagerRoute && token.role === 'team_member') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect root to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|.*\\.png$).*)'],
};
