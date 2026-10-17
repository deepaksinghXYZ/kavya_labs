const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export type FieldErrors = Partial<Record<'name' | 'email' | 'password', string>>;

export function validateEmail(email: string): string | undefined {
  if (!email) return 'Email is required.';
  if (email.length > 254 || !EMAIL_RE.test(email)) return 'Enter a valid email address.';
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  // bcrypt only uses the first 72 bytes; reject longer input rather than silently truncating it.
  if (Buffer.byteLength(password, 'utf8') > 72) return 'Password must be at most 72 bytes.';
  return undefined;
}

export function validateName(name: string): string | undefined {
  if (!name) return 'Name is required.';
  if (name.length > 80) return 'Name must be at most 80 characters.';
  return undefined;
}

/** Only allow same-site relative paths as post-login destinations (prevents open redirects). */
export function safeNext(value: unknown, fallback = '/dashboard'): string {
  if (typeof value !== 'string') return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
  return value;
}
