import { db } from "@/db";
import { stories, chapters } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, List, Tags, User, Calendar, Info } from "lucide-react";
import { SubscribeButton } from "@/components/SubscribeButton";
import { cookies } from "next/headers";
import { users, userSubscriptions } from "@/db/schema";
import { and } from "drizzle-orm";

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const storyId = resolvedParams.id;
  if (!storyId) notFound();

  const storyResults = await db.select().from(stories).where(eq(stories.id, storyId));
  if (storyResults.length === 0) notFound();
  const story = storyResults[0];

  const storyChapters = await db.select().from(chapters).where(eq(chapters.storyId, storyId)).orderBy(desc(chapters.chapterNumber));

  // Check subscription status
  let isSubscribed = false;
  const cookieStore = await cookies();
  const authEmail = cookieStore.get("auth_email")?.value;
  if (authEmail) {
    const [user] = await db.select().from(users).where(eq(users.email, authEmail));
    if (user) {
      const subs = await db.select().from(userSubscriptions).where(and(eq(userSubscriptions.storyId, storyId), eq(userSubscriptions.userId, user.id)));
      isSubscribed = subs.length > 0;
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-8 mb-12">

        <div className="md:w-2/3 flex flex-col justify-center">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{story.title}</h1>
            <div className="flex gap-2">
              {authEmail === 'orel@gmail.com' && (
                <>
                  <Link href={`/create/edit/${story.id}`} className="brutal-btn bg-yellow-400 text-zinc-900 font-bold px-4 py-2">
                    ערוך סיפור
                  </Link>
                  <Link href={`/create/edit/${story.id}/chapters`} className="brutal-btn bg-blue-500 text-white font-bold px-4 py-2">
                    ניהול פרקים
                  </Link>
                </>
              )}
              <SubscribeButton storyId={story.id} initialIsSubscribed={isSubscribed} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {story.status && <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">{story.status}</span>}
            {story.type && <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">{story.type}</span>}
            {story.adultContent && <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-400">18+</span>}
          </div>

          <p className="text-zinc-600 dark:text-zinc-300 text-lg mb-8 leading-relaxed">
            {story.description || "לא סופק תקציר."}
          </p>

          <div className="grid grid-cols-1 gap-4 text-sm brutal-card bg-white dark:bg-zinc-900 p-6">
            {story.author && <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"><User className="h-4 w-4" /> <span className="font-medium text-zinc-900 dark:text-zinc-100">יוצר/ת:</span> {story.author}</div>}
            {story.released && <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"><Calendar className="h-4 w-4" /> <span className="font-medium text-zinc-900 dark:text-zinc-100">שנת הוצאה:</span> {story.released}</div>}
            {story.tags && <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 col-span-2"><Tags className="h-4 w-4" /> <span className="font-medium text-zinc-900 dark:text-zinc-100">תגיות:</span> {story.tags}</div>}
            {story.officialTranslation && <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"><Info className="h-4 w-4" /> <span className="font-medium text-zinc-900 dark:text-zinc-100">תרגום רשמי:</span> {story.officialTranslation}</div>}
            {story.animeAdaptation && <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"><Info className="h-4 w-4" /> <span className="font-medium text-zinc-900 dark:text-zinc-100">אנימה:</span> {story.animeAdaptation}</div>}
          </div>
        </div>
        <div className="md:w-1/3 shrink-0">
          <div className="aspect-[2/3] w-full overflow-hidden brutal-card bg-zinc-100 dark:bg-zinc-800">
            {story.bannerImage ? (
              <img src={story.bannerImage} alt={story.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">אין תמונה</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold flex items-center gap-2 space-x-reverse mb-6">
          <List className="h-6 w-6 text-indigo-600" />
          <span>פרקים</span>
        </h2>

        {storyChapters.length === 0 ? (
          <p className="text-zinc-500">אין פרקים זמינים כרגע.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {storyChapters.map((chapter) => (
              <Link
                type="submit"

                key={chapter.id}
                href={`/story/${story.id}/chapter/${chapter.id}`}
                className="inline-flex items-center px-5 py-3 brutal-btn bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-900 dark:text-zinc-100 transition"
              >
                <div>
                  <span className="font-semibold block">פרק {chapter.chapterNumber}</span>
                  {chapter.title && <span className="text-xs text-zinc-500 dark:text-zinc-400">{chapter.title}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
