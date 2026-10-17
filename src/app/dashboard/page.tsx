import Navbar from '@/components/Navbar';
import { requireUser } from '@/lib/session';

export const metadata = { title: 'Dashboard | Kavya Labs' };

export default async function DashboardPage() {
  const user = await requireUser('/dashboard');

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome, {user.name}</h1>
          <p className="mt-2 text-slate-400">You&apos;re signed in to your Kavya Labs account.</p>

          <dl className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Email</dt>
              <dd className="mt-2 text-slate-100 break-all">{user.email}</dd>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Role</dt>
              <dd className="mt-2 text-slate-100 capitalize">{user.role}</dd>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Member since</dt>
              <dd className="mt-2 text-slate-100">{memberSince}</dd>
            </div>
          </dl>
        </div>
      </main>
    </>
  );
}
