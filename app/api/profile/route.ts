import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authEmail = cookieStore.get('auth_email')?.value;

    if (!authEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const avatarUrl = formData.get('avatarUrl') as string;
    const showRepliesTab = formData.get('showRepliesTab') === 'true';
    const isPrivate = formData.get('isPrivate') === 'true';

    await db.update(users)
      .set({ name, bio, avatarUrl, showRepliesTab, isPrivate })
      .where(eq(users.email, authEmail));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update failed:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
