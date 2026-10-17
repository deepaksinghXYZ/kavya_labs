import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/jwt';

/**
 * First line of defence: bounce visitors without a valid session cookie before
 * the page renders. Pages and server actions still call requireUser(), which is
 * the authoritative check (it also confirms the account still exists).
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
    const response = NextResponse.redirect(loginUrl);
    if (token) response.cookies.delete(SESSION_COOKIE); // drop the expired / invalid cookie
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
