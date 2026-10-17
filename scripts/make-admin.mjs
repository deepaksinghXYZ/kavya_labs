#!/usr/bin/env node
// Promote (or demote) an existing user. Run on the machine that holds the user store:
//
//   npm run make-admin -- someone@example.com
//   npm run make-admin -- someone@example.com --revoke
//
// This is the only way to create the first admin. It deliberately isn't driven by a
// signup-time setting: accounts aren't email-verified, so "this email becomes admin
// when it registers" would let anyone claim an admin address before its owner does.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const args = process.argv.slice(2);
const revoke = args.includes('--revoke');
const email = args.find((a) => !a.startsWith('--'))?.trim().toLowerCase();

if (!email) {
  console.error('Usage: npm run make-admin -- <email> [--revoke]');
  process.exit(1);
}

const file = process.env.USER_DB_PATH || path.join(process.cwd(), '.data', 'users.json');

let users;
try {
  users = JSON.parse(await fs.readFile(file, 'utf8'));
} catch (err) {
  console.error(err.code === 'ENOENT' ? `No user store found at ${file}. Sign up first.` : err.message);
  process.exit(1);
}

const user = users.find((u) => u.email === email);
if (!user) {
  console.error(`No user with email ${email}. They need to sign up first.`);
  process.exit(1);
}

const role = revoke ? 'user' : 'admin';
if (user.role === role) {
  console.log(`${email} is already ${role === 'admin' ? 'an admin' : 'a regular user'}.`);
  process.exit(0);
}
if (revoke && users.filter((u) => u.role === 'admin').length <= 1) {
  console.error('Refusing to remove the last admin.');
  process.exit(1);
}

user.role = role;
const tmp = `${file}.${process.pid}.${randomUUID()}.tmp`;
await fs.writeFile(tmp, JSON.stringify(users, null, 2), { mode: 0o600 });
await fs.rename(tmp, file);
console.log(`${email} is now ${role === 'admin' ? 'an admin' : 'a regular user'}.`);
