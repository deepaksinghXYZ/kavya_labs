import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ConfirmButton from '@/components/ConfirmButton';
import { deleteUserAction, setRoleAction } from '@/app/actions/admin';
import { computeStats, requireAdmin } from '@/lib/admin';
import { listUsers } from '@/lib/users';

export const metadata = { title: 'Admin | Kavya Labs' };

const PAGE_SIZE = 15;

const NOTICES: Record<string, string> = {
  'role-updated': 'Role updated.',
  deleted: 'User deleted.',
};
const ERRORS: Record<string, string> = {
  self: "You can't change or delete your own account from here.",
  'last-admin': "That would leave no administrators, so it wasn't done.",
  'not-found': 'That user no longer exists.',
  invalid: 'Invalid request.',
};

interface SearchParams {
  q?: string;
  page?: string;
  notice?: string;
  error?: string;
}

function pageHref(q: string, page: number) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/admin?${qs}` : '/admin';
}

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const me = await requireAdmin();

  const q = typeof searchParams.q === 'string' ? searchParams.q.trim().slice(0, 100) : '';
  const notice = searchParams.notice ? NOTICES[searchParams.notice] : undefined;
  const error = searchParams.error ? ERRORS[searchParams.error] : undefined;

  const allUsers = await listUsers();
  const stats = computeStats(allUsers);

  const needle = q.toLowerCase();
  const filtered = needle
    ? allUsers.filter((u) => u.name.toLowerCase().includes(needle) || u.email.includes(needle))
    : allUsers;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requestedPage = Number.parseInt(searchParams.page ?? '1', 10);
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), totalPages) : 1;
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const maxDaily = Math.max(1, ...stats.daily.map((d) => d.count));

  const cards = [
    { label: 'Total users', value: stats.totalUsers },
    { label: 'Administrators', value: stats.admins },
    { label: 'New in 7 days', value: stats.last7Days },
    { label: 'New in 30 days', value: stats.last30Days },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin dashboard</h1>
          <p className="mt-2 text-slate-400">Signed in as {me.email}.</p>

          {notice && (
            <div role="status" className="mt-6 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
              {notice}
            </div>
          )}
          {error && (
            <div role="alert" className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <section aria-label="Overview" className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => (
              <div key={c.label} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                <p className="text-xs uppercase tracking-wide text-slate-500">{c.label}</p>
                <p className="mt-2 text-3xl font-bold text-white">{c.value}</p>
              </div>
            ))}
          </section>

          <section aria-label="Signups, last 14 days" className="mt-6 p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <h2 className="text-sm font-semibold text-slate-300">Signups, last 14 days (UTC)</h2>
            <p className="sr-only">
              {stats.daily.map((d) => `${d.date}: ${d.count}`).join('; ')}
            </p>
            <div aria-hidden="true" className="mt-4 flex items-end gap-1.5 h-24">
              {stats.daily.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col justify-end h-full" title={`${d.date}: ${d.count}`}>
                  <div
                    className={d.count ? 'bg-cyan-400 rounded-t' : 'bg-slate-800 rounded-t'}
                    style={{ height: d.count ? `${Math.max(8, (d.count / maxDaily) * 100)}%` : '4px' }}
                  />
                </div>
              ))}
            </div>
            <div aria-hidden="true" className="mt-2 flex justify-between text-xs text-slate-500">
              <span>{stats.daily[0].date.slice(5)}</span>
              <span>{stats.daily[stats.daily.length - 1].date.slice(5)}</span>
            </div>
          </section>

          <section aria-label="Users" className="mt-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">
                Users <span className="text-slate-500 font-normal text-sm">({filtered.length})</span>
              </h2>
              <form action="/admin" method="GET" className="flex gap-2">
                <label htmlFor="q" className="sr-only">Search users</label>
                <input
                  id="q"
                  name="q"
                  type="search"
                  defaultValue={q}
                  placeholder="Search name or email"
                  className="w-full sm:w-64 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
                />
                <button type="submit" className="text-sm border border-slate-700 hover:bg-slate-900 text-slate-200 px-3 py-2 rounded-lg transition">
                  Search
                </button>
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-5 py-3 font-medium">Name</th>
                    <th scope="col" className="px-5 py-3 font-medium">Email</th>
                    <th scope="col" className="px-5 py-3 font-medium">Role</th>
                    <th scope="col" className="px-5 py-3 font-medium">Joined</th>
                    <th scope="col" className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                        {q ? 'No users match your search.' : 'No users yet.'}
                      </td>
                    </tr>
                  )}
                  {rows.map((u) => {
                    const isMe = u.id === me.id;
                    return (
                      <tr key={u.id}>
                        <td className="px-5 py-3 text-slate-100">
                          {u.name} {isMe && <span className="ml-1 text-xs text-slate-500">(you)</span>}
                        </td>
                        <td className="px-5 py-3 text-slate-300 break-all">{u.email}</td>
                        <td className="px-5 py-3">
                          <span
                            className={
                              u.role === 'admin'
                                ? 'inline-block rounded-full px-2.5 py-0.5 text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                                : 'inline-block rounded-full px-2.5 py-0.5 text-xs bg-slate-800 text-slate-300'
                            }
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-400 whitespace-nowrap">
                          {new Date(u.createdAt).toISOString().slice(0, 10)}
                        </td>
                        <td className="px-5 py-3">
                          {isMe ? (
                            <span className="block text-right text-xs text-slate-600">—</span>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <form action={setRoleAction}>
                                <input type="hidden" name="id" value={u.id} />
                                <input type="hidden" name="role" value={u.role === 'admin' ? 'user' : 'admin'} />
                                <ConfirmButton
                                  message={
                                    u.role === 'admin'
                                      ? `Remove admin access from ${u.email}?`
                                      : `Give ${u.email} full admin access?`
                                  }
                                  className="text-xs border border-slate-700 hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg transition"
                                >
                                  {u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                                </ConfirmButton>
                              </form>
                              <form action={deleteUserAction}>
                                <input type="hidden" name="id" value={u.id} />
                                <ConfirmButton
                                  message={`Permanently delete ${u.email}? This cannot be undone.`}
                                  className="text-xs border border-red-500/40 hover:bg-red-500/10 text-red-300 px-3 py-1.5 rounded-lg transition"
                                >
                                  Delete
                                </ConfirmButton>
                              </form>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <nav aria-label="Pagination" className="p-4 flex items-center justify-between border-t border-slate-800 text-sm">
                {page > 1 ? (
                  <Link href={pageHref(q, page - 1)} className="text-cyan-400 hover:text-cyan-300">← Previous</Link>
                ) : (
                  <span className="text-slate-600">← Previous</span>
                )}
                <span className="text-slate-500">Page {page} of {totalPages}</span>
                {page < totalPages ? (
                  <Link href={pageHref(q, page + 1)} className="text-cyan-400 hover:text-cyan-300">Next →</Link>
                ) : (
                  <span className="text-slate-600">Next →</span>
                )}
              </nav>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
