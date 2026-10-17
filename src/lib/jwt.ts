import { SignJWT, jwtVerify } from 'jose';

// This module only depends on `jose`, so it is safe to import from middleware
// (Edge runtime). Do not import Node-only modules (fs, bcrypt) here.

export const SESSION_COOKIE = 'kl_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type Role = 'user' | 'admin';

export interface SessionPayload {
  sub: string; // user id
  email: string;
  name: string;
  role: Role;
}

function getKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'AUTH_SECRET is missing or too short. Set it to a random string of at least 32 characters (see .env.example).'
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  const key = getKey(); // throws loudly on misconfiguration instead of silently logging everyone out
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.name !== 'string' ||
      (payload.role !== 'user' && payload.role !== 'admin')
    ) {
      return null;
    }
    return { sub: payload.sub, email: payload.email, name: payload.name, role: payload.role };
  } catch {
    return null; // expired, tampered, or malformed
  }
}
