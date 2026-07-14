import { NextResponse } from 'next/server';
import { db } from '@/db';
import { images } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const [image] = await db.select({ imageUrl: images.imageUrl }).from(images).where(eq(images.id, resolvedParams.id));
    
    if (!image || !image.imageUrl) {
      return new NextResponse('Not found', { status: 404 });
    }

    // Parse the data URI (e.g., data:image/jpeg;base64,...)
    const match = image.imageUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!match) {
      // If it's a regular URL or relative path, just redirect to it
      if (image.imageUrl.startsWith('http') || image.imageUrl.startsWith('/')) {
        return NextResponse.redirect(new URL(image.imageUrl, request.url));
      }
      return NextResponse.json({ error: 'Invalid image format in DB' }, { status: 500 });
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
