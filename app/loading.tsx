export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 w-full h-full">
      {/* Brutalist Loader */}
      <div className="relative flex h-16 w-16">
        <div className="absolute inset-0 border-4 border-zinc-900 dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] animate-[spin_2s_linear_infinite]" />
        <div className="absolute inset-2 border-4 border-[#F9A826] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] animate-[spin_1.5s_linear_infinite_reverse]" />
      </div>
      <p className="text-xl font-bold tracking-widest text-zinc-900 dark:text-zinc-100 uppercase animate-pulse">
        טוען...
      </p>
    </div>
  );
}
