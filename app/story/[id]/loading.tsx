export default function StoryLoading() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl animate-pulse">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Text Section */}
        <div className="md:w-2/3 flex flex-col justify-center space-y-4">
          {/* Title */}
          <div className="h-12 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
          
          {/* Tags */}
          <div className="flex gap-2 mb-6">
            <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-6 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          </div>

          {/* Description */}
          <div className="space-y-2 mb-8">
            <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-4/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>

          {/* Meta Box */}
          <div className="grid grid-cols-1 gap-4 brutal-card bg-zinc-50 dark:bg-zinc-900/50 p-6">
            <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>

        {/* Image Section */}
        <div className="md:w-1/3 shrink-0">
          <div className="aspect-[2/3] w-full bg-zinc-200 dark:bg-zinc-800 brutal-card" />
        </div>
      </div>

      {/* Chapters Section */}
      <div className="mt-12">
        <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-6" />
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 w-full brutal-card bg-zinc-50 dark:bg-zinc-900/50" />
          ))}
        </div>
      </div>
    </div>
  );
}
