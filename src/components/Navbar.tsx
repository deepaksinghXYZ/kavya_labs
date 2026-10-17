import Link from 'next/link';
import { logoutAction } from '@/app/actions/auth';
import { getCurrentUser } from '@/lib/session';

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-cyan-400"></span>
          Kavya Labs
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/#features" className="text-sm text-slate-300 hover:text-white transition">Features</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white transition">Dashboard</Link>
              {user.role === 'admin' && (
                <Link href="/admin" className="text-sm text-slate-300 hover:text-white transition">Admin</Link>
              )}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-sm border border-slate-700 hover:bg-slate-900 text-slate-200 font-semibold px-4 py-2 rounded-lg transition"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-300 hover:text-white transition">Sign in</Link>
              <Link
                href="/signup"
                className="text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
