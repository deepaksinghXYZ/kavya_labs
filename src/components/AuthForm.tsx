'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { loginAction, signupAction, type FormState } from '@/app/actions/auth';

const initialState: FormState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-semibold px-4 py-3 rounded-xl transition"
    >
      {pending ? 'Please wait…' : label}
    </button>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className="w-full rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none px-4 py-3 text-slate-100 placeholder-slate-500 transition"
      />
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default function AuthForm({ mode, next }: { mode: 'login' | 'signup'; next?: string }) {
  const isSignup = mode === 'signup';
  const [state, formAction] = useFormState(isSignup ? signupAction : loginAction, initialState);
  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : '';

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-white tracking-tight text-center">
        {isSignup ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="mt-2 text-center text-slate-400">
        {isSignup ? 'Start building with Kavya Labs.' : 'Sign in to your Kavya Labs account.'}
      </p>

      <form action={formAction} className="mt-8 space-y-5 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
        {next && <input type="hidden" name="next" value={next} />}

        {state.error && (
          <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {state.error}
          </div>
        )}

        {isSignup && <Field label="Name" name="name" type="text" autoComplete="name" error={state.fieldErrors?.name} />}
        <Field label="Email" name="email" type="email" autoComplete="email" error={state.fieldErrors?.email} />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          error={state.fieldErrors?.password}
        />

        <SubmitButton label={isSignup ? 'Create account' : 'Sign in'} />
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
        <Link href={`${isSignup ? '/login' : '/signup'}${nextQuery}`} className="text-cyan-400 hover:text-cyan-300">
          {isSignup ? 'Sign in' : 'Sign up'}
        </Link>
      </p>
    </div>
  );
}
