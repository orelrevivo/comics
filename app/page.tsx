import { db } from "@/db";
import { stories, chapters } from "@/db/schema";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { AnimatedStoryGrid } from "@/components/AnimatedStoryGrid";

export default async function Home() {
  const allStories = await db.select().from(stories).orderBy(desc(stories.createdAt));
  const allChapters = await db.select().from(chapters);

  const getLatestChapter = (storyId: string) => {
    const storyChaps = allChapters.filter(c => c.storyId === storyId);
    if (storyChaps.length === 0) return null;
    return storyChaps.sort((a, b) => b.chapterNumber - a.chapterNumber)[0];
  };

  const featuredStories = allStories.slice(0, 3);
  const remainingStories = allStories; // Show all stories in Latest Updates

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col gap-10">

      {/* Hero Section */}
      {featuredStories.length > 0 && (
        <section>
          <div className="flex items-center gap-2 space-x-reverse text-sm font-semibold text-zinc-500 mb-4 uppercase tracking-wider">
            <Link href="/" className="hover:text-zinc-300 transition-colors">ראשי</Link>
            <span>&gt;</span>
            <span className="text-zinc-100">מומלצים</span>
          </div>

          <div className="flex items-center justify-center gap-4 h-[250px] sm:h-[350px] md:h-[450px]">
            {featuredStories.map((fs, idx) => {
              const isCenter = featuredStories.length === 3 ? idx === 1 : true;

              return (
                <Link
                  key={fs.id}
                  href={`/story/${fs.id}`}
                  className={`group relative block overflow-hidden brutal-card bg-zinc-900 transition-all duration-500 hover:-translate-y-1 ${isCenter
                    ? 'flex-[3] sm:flex-[4] h-full z-10'
                    : 'flex-[1.5] h-[75%] sm:h-[80%] opacity-70 hover:opacity-100'
                    }`}
                >
                  {fs.bannerImage ? (
                    <img
                      src={fs.bannerImage}
                      alt={fs.title}
                      className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-500">
                      No Banner Image
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b26] via-[#1a1b26]/40 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 z-10 flex flex-col justify-end h-full">
                    {fs.type && (
                      <span className="w-fit rounded-full bg-white text-black px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2">
                        {fs.type}
                      </span>
                    )}
                    <h2 className={`font-black text-white drop-shadow-lg leading-tight ${isCenter ? 'text-2xl sm:text-4xl lg:text-5xl line-clamp-2' : 'text-lg sm:text-2xl line-clamp-1'}`}>
                      {fs.title}
                    </h2>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-5">עדכונים אחרונים</h2>

        {remainingStories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">אין סיפורים זמינים כרגע.</p>
          </div>
        ) : (
          <AnimatedStoryGrid stories={remainingStories} allChapters={allChapters} />
        )}
      </section>
    </div>
  );
}
