import { db } from "@/db";
import { stories, chapters } from "@/db/schema";
import Link from "next/link";
import { desc, ilike } from "drizzle-orm";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string, sort?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const sort = resolvedParams.sort || "";

  let results = [];

  if (query) {
    results = await db.select().from(stories).where(ilike(stories.title, `%${query}%`)).orderBy(desc(stories.createdAt));
  } else {
    results = await db.select().from(stories).orderBy(desc(stories.createdAt));
  }

  // Handle simple sort mock (since we don't have views or rating fields yet)
  if (sort === 'popular') {
    results = [...results].reverse();
  }

  const allChapters = await db.select().from(chapters);
  const getLatestChapter = (storyId: string) => {
    const storyChaps = allChapters.filter(c => c.storyId === storyId);
    if (storyChaps.length === 0) return null;
    return storyChaps.sort((a, b) => b.chapterNumber - a.chapterNumber)[0];
  };

  return (
    <div className="container mx-auto py-10 px-4 min-h-[70vh]">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 space-x-reverse">
        {query ? `תוצאות חיפוש עבור "${query}"` : sort ? `גולש ב: ${sort === 'latest' ? 'עדכונים אחרונים' : sort === 'popular' ? 'פופולרי' : sort === 'genres' ? "ז'אנרים" : sort}` : "כל המנגות"}
        <span className="text-sm font-normal text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
          {results.length} נמצאו
        </span>
      </h1>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">לא נמצאה מנגה התואמת לחיפוש שלך.</p>
          <Link href="/" className="mt-6 brutal-btn bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white">
            חזרה לדף הראשי
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((story) => {
            const latestChapter = getLatestChapter(story.id);

            return (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                className="group relative flex flex-col overflow-hidden brutal-card bg-zinc-900 transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-none w-full aspect-[2/3]"
              >
                {story.bannerImage ? (
                  <img
                    src={story.bannerImage}
                    alt={story.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-500">
                    אין תמונה
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 start-2 flex flex-col gap-1 items-start z-10">
                  {story.type && (
                    <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md uppercase tracking-wider">
                      {story.type}
                    </span>
                  )}
                  {story.adultContent && (
                    <span className="rounded bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                      18+
                    </span>
                  )}
                </div>

                {/* Bottom Overlay matching user image */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#1a1b26]/95 backdrop-blur-sm pt-3 pb-2 px-2 flex flex-col items-center justify-center text-center z-10">
                  <h3 className="line-clamp-1 text-[16px] font-medium text-zinc-100 tracking-wide">
                    {story.title}
                  </h3>
                  {latestChapter ? (
                    <span className="mt-0.5 text-[14px] text-zinc-400">פרק {latestChapter.chapterNumber}</span>
                  ) : (
                    <span className="mt-0.5 text-[14px] text-zinc-500">{story.status || "קרא עכשיו"}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
