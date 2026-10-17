'use server';

import { redirect } from 'next/navigation';
import { createUser, EmailTakenError, verifyCredentials } from '@/lib/users';
import { createSession, destroySession } from '@/lib/session';
import { clientIp, consume, reset } from '@/lib/rate-limit';
import {
  normalizeEmail,
  safeNext,
  validateEmail,
  validateName,
  validatePassword,
  type FieldErrors,
} from '@/lib/validation';

export interface FormState {
  error?: string;
  fieldErrors?: FieldErrors;
}

const MINUTE = 60 * 1000;

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = normalizeEmail(formData.get('email'));
  const password = String(formData.get('password') ?? '');

  const fieldErrors: FieldErrors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };
  if (fieldErrors.name || fieldErrors.email || fieldErrors.password) {
    return { fieldErrors };
  }

  const limit = consume(`signup:${clientIp()}`, 5, 60 * MINUTE);
  if (!limit.ok) {
    return { error: `Too many sign-up attempts. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minute(s).` };
  }

  let user;
  try {
    user = await createUser({ name, email, password });
  } catch (err) {
    if (err instanceof EmailTakenError) {
      return { fieldErrors: { email: 'An account with this email already exists.' } };
    }
    throw err;
  }

  await createSession(user);
  redirect(safeNext(formData.get('next')));
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = normalizeEmail(formData.get('email'));
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Enter your email and password.' };
  }

  const emailKey = `login:email:${email}`;
  const byEmail = consume(emailKey, 5, 15 * MINUTE);
  const byIp = consume(`login:ip:${clientIp()}`, 30, 15 * MINUTE);
  if (!byEmail.ok || !byIp.ok) {
    const wait = Math.ceil(Math.max(byEmail.retryAfterSec, byIp.retryAfterSec) / 60);
    return { error: `Too many attempts. Try again in ${wait} minute(s).` };
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    // Same message whether the email exists or not.
    return { error: 'Invalid email or password.' };
  }

  reset(emailKey);
  await createSession(user);
  redirect(safeNext(formData.get('next')));
}

export async function logoutAction(): Promise<void> {
  destroySession();
  redirect('/');
}
