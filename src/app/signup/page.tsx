import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { getCurrentUser } from '@/lib/session';
import { safeNext } from '@/lib/validation';

export const metadata = { title: 'Create account | Kavya Labs' };

export default async function SignupPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = typeof searchParams.next === 'string' ? safeNext(searchParams.next, '') : '';
  if (await getCurrentUser()) redirect(next || '/dashboard');

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <AuthForm mode="signup" next={next || undefined} />
    </main>
  );
}
