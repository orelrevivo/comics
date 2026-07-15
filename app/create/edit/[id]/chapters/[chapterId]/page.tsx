import { db } from "@/db";
import { chapters, images, stories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import EditChapterImagesClient from "@/components/EditChapterImagesClient";

export default async function ChapterImagesPage({ params }: { params: Promise<{ id: string, chapterId: string }> }) {
  const resolvedParams = await params;
  const { id: storyId, chapterId } = resolvedParams;
  if (!storyId || !chapterId) notFound();

  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;

  if (authEmail !== 'doron2010sha@gmail.com') {
    redirect('/');
  }

  const [story] = await db.select().from(stories).where(eq(stories.id, storyId));
  if (!story) notFound();

  const [chapter] = await db.select().from(chapters).where(eq(chapters.id, chapterId));
  if (!chapter) notFound();

  const rawImages = await db.select({ id: images.id, order: images.order, isWide: images.isWide }).from(images).where(eq(images.chapterId, chapterId)).orderBy(asc(images.order));
  const chapterImages = rawImages.map(img => ({ ...img, imageUrl: `/api/image/${img.id}` }));

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Link href={`/create/edit/${storyId}/chapters`} className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors">
        <ArrowRight className="mr-2 h-4 w-4" />
        חזרה לפרקים
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">פרק {chapter.chapterNumber} - תמונות</h1>
        <p className="text-zinc-500 mt-1">{chapter.title || 'ללא כותרת'}</p>
      </div>

      <EditChapterImagesClient 
        storyId={storyId} 
        chapterId={chapterId} 
        initialImages={chapterImages.map(img => ({ id: img.id, url: img.imageUrl, order: img.order, isWide: img.isWide }))} 
      />
    </div>
  );
}
