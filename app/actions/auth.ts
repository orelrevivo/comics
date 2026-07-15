'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user || !bcrypt.compareSync(password, user.password)) {
    redirect('/login?error=InvalidCredentials');
  }

  const cookieStore = await cookies();
  cookieStore.set('auth_email', email, { path: '/', httpOnly: true });
  cookieStore.set('saved_email', email, { path: '/', maxAge: 60 * 60 * 24 * 30 });
  cookieStore.set('saved_password', password, { path: '/', maxAge: 60 * 60 * 24 * 30 });

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
  cookieStore.set('saved_email', email, { path: '/', maxAge: 60 * 60 * 24 * 30 });
  cookieStore.set('saved_password', password, { path: '/', maxAge: 60 * 60 * 24 * 30 });

  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_email');
  redirect('/');
}

export async function quickLoginAction() {
  const cookieStore = await cookies();
  const email = cookieStore.get('saved_email')?.value;
  const password = cookieStore.get('saved_password')?.value;

  if (!email || !password) {
    redirect('/login');
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user || !bcrypt.compareSync(password, user.password)) {
    cookieStore.delete('saved_email');
    cookieStore.delete('saved_password');
    redirect('/login?error=InvalidCredentials');
  }

  cookieStore.set('auth_email', email, { path: '/', httpOnly: true });
  redirect('/');
}

export async function updateCoverColorAction(userId: string, color: string) {
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;

  if (!authEmail) {
    throw new Error('Unauthorized');
  }

  const [currentUser] = await db.select().from(users).where(eq(users.email, authEmail));
  
  if (!currentUser || currentUser.id !== userId) {
    throw new Error('Unauthorized');
  }

  await db.update(users)
    .set({ coverColor: color })
    .where(eq(users.id, userId));

  revalidatePath(`/profile/${userId}`);
}

export async function getBannerTemplatesAction() {
  const bannersDir = path.join(process.cwd(), 'public', 'banners');
  try {
    const files = fs.readdirSync(bannersDir);
    // Filter out only images/gifs
    const templates = files.filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.gif'));
    return templates.map(f => `/banners/${f}`);
  } catch (error) {
    console.error('Failed to read banners directory', error);
    return [];
  }
}
