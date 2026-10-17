import { redirect } from 'next/navigation';
import { requireUser } from './session';
import type { PublicUser } from './users';

/**
 * Authoritative admin check for pages and server actions.
 *
 * The role is read from the user store (via requireUser), not from the session
 * cookie, so a demoted or deleted admin loses access on their very next request.
 * Signed-out visitors go to /login; signed-in non-admins go back to /dashboard.
 */
export async function requireAdmin(returnTo = '/admin'): Promise<PublicUser> {
  const user = await requireUser(returnTo);
  if (user.role !== 'admin') redirect('/dashboard');
  return user;
}

export interface AdminStats {
  totalUsers: number;
  admins: number;
  last7Days: number;
  last30Days: number;
  /** Signups per UTC day for the last 14 days, oldest first. */
  daily: { date: string; count: number }[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function computeStats(users: PublicUser[], now = Date.now()): AdminStats {
  const daily: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    daily.push({ date: new Date(now - i * DAY_MS).toISOString().slice(0, 10), count: 0 });
  }
  const byDate = new Map(daily.map((d) => [d.date, d]));

  let last7Days = 0;
  let last30Days = 0;
  for (const u of users) {
    const created = Date.parse(u.createdAt);
    if (now - created <= 7 * DAY_MS) last7Days++;
    if (now - created <= 30 * DAY_MS) last30Days++;
    const bucket = byDate.get(u.createdAt.slice(0, 10));
    if (bucket) bucket.count++;
  }

  return {
    totalUsers: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    last7Days,
    last30Days,
    daily,
  };
}
