import { db } from "@/db";
import { stories, chapters } from "@/db/schema";
import { desc } from "drizzle-orm";
import { AnimatedStoryGrid } from "@/components/AnimatedStoryGrid";
import { HeroCarousel } from "@/components/HeroCarousel";

export default async function Home() {
  const allStories = await db.select().from(stories).orderBy(desc(stories.createdAt));
  const allChapters = await db.select().from(chapters);

  return (
    <div className="container mx-auto py-8 flex flex-col gap-2">
      <div className="px-4">
        {allStories.length > 0 && <HeroCarousel stories={allStories} />}
      </div>

      <section className="px-4">
        <h2 className="text-2xl font-bold mb-5">עדכונים אחרונים</h2>

        {allStories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">אין סיפורים זמינים כרגע.</p>
          </div>
        ) : (
          <AnimatedStoryGrid stories={allStories} allChapters={allChapters} />
        )}
      </section>
    </div>
  );
}