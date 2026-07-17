'use client';

import { useEffect, useState } from 'react';

export default function LastReadBadge({ storyId, chapterId }: { storyId: string, chapterId: string }) {
  const [isLastRead, setIsLastRead] = useState(false);

  useEffect(() => {
    const lastRead = localStorage.getItem(`last_read_${storyId}`);
    if (lastRead === chapterId) {
      setIsLastRead(true);
    }
  }, [storyId, chapterId]);

  if (!isLastRead) return null;

  return (
    <span className="mt-1 inline-block bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded dark:bg-indigo-900/50 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
      המשך קריאה
    </span>
  );
}
