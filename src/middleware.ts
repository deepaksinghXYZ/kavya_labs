import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/jwt';

/**
 * First line of defence: bounce visitors without a valid session cookie before the
 * page renders. Pages and server actions still call requireUser() / requireAdmin(),
 * which are the authoritative checks (they confirm the account still exists and read
 * the current role from the store rather than from the possibly stale cookie, so
 * promotions and demotions apply immediately).
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
	matcher: ['/dashboard/:path*', '/admin/:path*'],
};
