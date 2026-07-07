export default function CommunityLoading() {
  return (
    <div className="container mx-auto py-8 max-w-4xl min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
        <div className="h-12 w-32 brutal-card bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </div>

      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="brutal-card bg-white dark:bg-[#0B1416] p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
