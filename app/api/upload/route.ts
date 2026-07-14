import { NextResponse } from 'next/server';
import { db } from '@/db';
import { images } from '@/db/schema';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const chapterId = formData.get('chapterId') as string | null;
    const orderStr = formData.get('order') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert the image directly to a base64 string
    const base64String = buffer.toString('base64');
    
    // Determine the mime type from the file extension or default to jpeg
    const ext = file.name.split('.').pop()?.toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === 'png') mimeType = 'image/png';
    else if (ext === 'gif') mimeType = 'image/gif';
    else if (ext === 'webp') mimeType = 'image/webp';
    else if (ext === 'svg') mimeType = 'image/svg+xml';

    // The "url" is now the actual raw image data encoded as base64
    const fileUrl = `data:${mimeType};base64,${base64String}`;

    if (chapterId && orderStr) {
      await db.insert(images).values({
        chapterId,
        imageUrl: fileUrl,
        order: parseInt(orderStr, 10),
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}
