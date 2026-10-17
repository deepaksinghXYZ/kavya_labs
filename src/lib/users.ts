import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import type { Role } from './jwt';

/**
 * Minimal file-backed user store so the project works with zero infrastructure.
 *
 * It is intentionally small and sits behind the functions below so it can be
 * replaced with a real database (Postgres, SQLite, ...) without touching the
 * rest of the app. It is NOT suitable for multiple server instances or
 * serverless platforms with read-only / ephemeral disks.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string; // ISO timestamp
}

export type PublicUser = Omit<User, 'passwordHash'>;

const BCRYPT_COST = 12;

function dbPath(): string {
  return process.env.USER_DB_PATH || path.join(process.cwd(), '.data', 'users.json');
}

// Serialize all writes within this process so concurrent requests can't clobber each other.
let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

async function readAll(): Promise<User[]> {
  try {
    const raw = await fs.readFile(dbPath(), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as User[]) : [];
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
}

async function writeAll(users: User[]): Promise<void> {
  const file = dbPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(users, null, 2), { mode: 0o600 });
  await fs.rename(tmp, file); // atomic replace
}

export function toPublic(user: User): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await readAll();
  return users.find((u) => u.email === email) ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const users = await readAll();
  return users.find((u) => u.id === id) ?? null;
}

export class EmailTakenError extends Error {
  constructor() {
    super('EMAIL_TAKEN');
  }
}

export async function createUser(input: {
  name: string;
  email: string; // must already be normalized (trimmed, lowercase)
  password: string;
  role?: Role;
}): Promise<PublicUser> {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  return withLock(async () => {
    const users = await readAll();
    if (users.some((u) => u.email === input.email)) throw new EmailTakenError();
    const user: User = {
      id: randomUUID(),
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role ?? 'user',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    await writeAll(users);
    return toPublic(user);
  });
}

let dummyHash: Promise<string> | null = null;

/**
 * Returns the user when credentials are valid, otherwise null.
 * Always performs one bcrypt comparison so response time does not reveal
 * whether an account exists for the given email.
 */
export async function verifyCredentials(email: string, password: string): Promise<PublicUser | null> {
  const user = await findUserByEmail(email);
  if (!user) {
    dummyHash ??= bcrypt.hash('not-a-real-password', BCRYPT_COST);
    await bcrypt.compare(password, await dummyHash);
    return null;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? toPublic(user) : null;
}
