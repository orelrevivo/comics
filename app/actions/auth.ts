'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user || !bcrypt.compareSync(password, user.password)) {
    redirect('/login?error=InvalidCredentials');
  }

  const cookieStore = await cookies();
  cookieStore.set('auth_email', email, { path: '/', httpOnly: true });

  redirect('/');
}

export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const existingUsers = await db.select().from(users).where(eq(users.email, email));
  if (existingUsers.length > 0) {
    redirect('/signup?error=EmailTaken');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  await db.insert(users).values({
    email,
    password: hashedPassword,
  });

  const cookieStore = await cookies();
  cookieStore.set('auth_email', email, { path: '/', httpOnly: true });

  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_email');
  redirect('/');
}
