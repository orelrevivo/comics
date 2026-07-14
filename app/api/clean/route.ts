import { NextResponse } from 'next/server';
import { db } from '@/db';
import { images } from '@/db/schema';
import { like } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.delete(images).where(like(images.imageUrl, 'data:image/%'));
    return NextResponse.json({ success: true, message: 'Deleted all massive Base64 images successfully! You can now load the chapter.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
