import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession } from './jwt';
import { findUserById, toPublic, type PublicUser } from './users';

export async function createSession(user: PublicUser): Promise<void> {
  const token = await signSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function destroySession(): void {
  cookies().delete(SESSION_COOKIE);
}

/**
 * The signed-in user, or null.
 *
 * The cookie is only a pointer: the user is re-loaded from the store on every
 * call, so deleted accounts and role changes take effect immediately instead
 * of lingering until the token expires.
 */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null; // no cookie: don't touch AUTH_SECRET, so the public site works without it
  const session = await verifySession(token);
  if (!session) return null;
  const user = await findUserById(session.sub);
  return user ? toPublic(user) : null;
}

/** For protected pages and actions: redirects to /login when signed out. */
export async function requireUser(returnTo?: string): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : '/login');
  }
  return user;
}
