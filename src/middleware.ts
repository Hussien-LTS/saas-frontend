import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register'];
const INVITE_ROUTE = /^\/invites\/.+\/accept/;

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Always allow invite deep-links through
  if (INVITE_ROUTE.test(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('accessToken')?.value;
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  // Not authenticated → redirect to login
  if (!token && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Authenticated on login/register → check for ?redirect first
  if (token && isPublic) {
    const redirect = searchParams.get('redirect');

    // If there's a valid redirect (e.g. invite link) — honor it
    if (redirect && redirect.startsWith('/')) {
      const url = request.nextUrl.clone();
      url.pathname = redirect;
      url.search = '';
      return NextResponse.redirect(url);
    }

    // Otherwise default to workspaces
    const url = request.nextUrl.clone();
    url.pathname = '/workspaces';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
