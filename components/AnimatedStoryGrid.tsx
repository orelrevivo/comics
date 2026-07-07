'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface AnimatedStoryGridProps {
  stories: any[];
  allChapters: any[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export function AnimatedStoryGrid({ stories, allChapters }: AnimatedStoryGridProps) {
  const getLatestChapter = (storyId: string) => {
    const storyChaps = allChapters.filter(c => c.storyId === storyId);
    if (storyChaps.length === 0) return null;
    return storyChaps.sort((a, b) => b.chapterNumber - a.chapterNumber)[0];
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {stories.map((story) => {
        const latestChapter = getLatestChapter(story.id);

        return (
          <motion.div key={story.id} variants={item} className="h-full">
            <Link
              href={`/story/${story.id}`}
              className="group relative flex flex-col overflow-hidden brutal-card bg-zinc-900 transition-all w-full h-full aspect-[2/3] block"
            >
              {story.bannerImage ? (
                <img
                  src={story.bannerImage}
                  alt={story.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-500">
                  No Image
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
          </motion.div>
        );
      })}
    </motion.div>
  );
}
