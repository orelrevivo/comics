import { db } from "@/db";
import { stories, chapters } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { deleteChapterAction, addChapterAction } from "@/app/actions/story";

export default async function ChaptersDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const storyId = resolvedParams.id;
  if (!storyId) notFound();

  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;

  if (authEmail !== 'orel@gmail.com') {
    redirect('/');
  }

  const storyResults = await db.select().from(stories).where(eq(stories.id, storyId));
  if (storyResults.length === 0) notFound();
  const story = storyResults[0];

  const storyChapters = await db.select().from(chapters).where(eq(chapters.storyId, storyId)).orderBy(desc(chapters.chapterNumber));

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Link href={`/story/${story.id}`} className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors">
        <ArrowRight className="mr-2 h-4 w-4" />
        חזרה לסיפור
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">ניהול פרקים</h1>
          <p className="text-zinc-500 mt-1">{story.title}</p>
        </div>
        
        <form action={async (formData) => {
          'use server';
          const title = formData.get('title') as string;
          const num = parseInt(formData.get('number') as string || '1');
          await addChapterAction(story.id, title, num);
        }} className="flex items-center gap-2 brutal-card bg-white dark:bg-zinc-900 p-2">
          <input type="number" name="number" placeholder="מספר פרק" required className="brutal-input px-3 py-2 w-24 text-sm" defaultValue={storyChapters.length ? storyChapters[0].chapterNumber + 1 : 1} />
          <input type="text" name="title" placeholder="כותרת (אופציונלי)" className="brutal-input px-3 py-2 w-40 text-sm" />
          <button type="submit" className="brutal-btn bg-green-500 text-white p-2">
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </div>

      <div className="grid gap-4">
        {storyChapters.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 brutal-card bg-zinc-50 dark:bg-zinc-800/50">
            אין פרקים בסיפור זה. הוסף את הפרק הראשון למעלה!
          </div>
        ) : (
          storyChapters.map(chapter => (
            <div key={chapter.id} className="brutal-card bg-white dark:bg-zinc-900 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">פרק {chapter.chapterNumber}</h3>
                {chapter.title && <p className="text-sm text-zinc-500">{chapter.title}</p>}
              </div>
              <div className="flex items-center gap-2 space-x-reverse">
                <Link href={`/create/edit/${story.id}/chapters/${chapter.id}`} className="brutal-btn bg-indigo-500 text-white px-4 py-2 flex items-center gap-2 text-sm font-bold">
                  <ImageIcon className="w-4 h-4" />
                  <span>ערוך תמונות</span>
                </Link>
                <form action={async () => {
                  'use server';
                  await deleteChapterAction(chapter.id, story.id);
                }}>
                  <button type="submit" className="brutal-btn bg-red-500 text-white p-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
