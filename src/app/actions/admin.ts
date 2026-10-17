'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin';
import { deleteUser, LastAdminError, setUserRole, UserNotFoundError } from '@/lib/users';

// Outcomes are reported through short fixed codes in the query string (never free text),
// so a crafted link can't make the dashboard display arbitrary messages.
function done(code: string): never {
  revalidatePath('/admin');
  redirect(`/admin?${code}`);
}

function failure(err: unknown): never {
  if (err instanceof LastAdminError) done('error=last-admin');
  if (err instanceof UserNotFoundError) done('error=not-found');
  throw err;
}

export async function setRoleAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin(); // re-checked on every call: server actions are public endpoints
  const id = String(formData.get('id') ?? '');
  const role = formData.get('role');

  if (!id || (role !== 'admin' && role !== 'user')) done('error=invalid');
  if (id === admin.id) done('error=self');

  try {
    await setUserRole(id, role);
  } catch (err) {
    failure(err);
  }
  done('notice=role-updated');
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get('id') ?? '');

  if (!id) done('error=invalid');
  if (id === admin.id) done('error=self');

  try {
    await deleteUser(id);
  } catch (err) {
    failure(err);
  }
  done('notice=deleted');
}
