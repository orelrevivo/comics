import Link from "next/link";
import { BookOpen, LogIn, Plus, Search } from "lucide-react";
import { cookies } from "next/headers";
import "./Navbar.css";
import Image from "next/image";

export default async function Navbar() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_email')?.value;
  const isLoggedIn = !!authCookie;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md dark:bg-zinc-950/95 border-b border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Primary Navbar */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80 mt-2 mr-[-20px]">
          <Image
            src="/logo.png"
            alt="MangaReader logo"
            width={186}
            height={56}
            className="rounded-md"
          />
        </Link>
        {/* Centered Image */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 hidden md:block pointer-events-none">
          {/* Using top-0 so the image starts at the very top of the screen */}
          <img src="/background/image2.png" alt="Logo" className="h-[200px] ml-10 w-auto object-contain" />
        </div>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              {authCookie === 'orel@gmail.com' && (
                <Link
                  href="/create"
                  className="brutal-btn bg-[#F9A826] text-zinc-900 font-bold px-4 py-2 flex items-center space-x-2 space-x-reverse"
                >
                  <Plus className="h-4 w-4" />
                  <span>צור סיפור</span>
                </Link>
              )}
              <Link
                href="/community"
                className="brutal-btn bg-[#E84C3D] text-white font-bold px-4 py-2 flex items-center space-x-2 space-x-reverse"
              >
                <Plus className="h-4 w-4" />
                <span>קהילה</span>
              </Link>
              <Link
                href="/profile"
                className="brutal-btn bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-bold px-4 py-2"
              >
                פרופיל
              </Link>
              <form action={async () => {
                'use server';
                const cookiesList = await cookies();
                cookiesList.delete('auth_email');
              }}>
                <button
                  type="submit"
                  className="brutal-btn bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 font-bold px-4 py-2"
                >
                  התנתק
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="brutal-btn bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-bold px-4 py-2 flex items-center space-x-2 space-x-reverse"
            >
              <LogIn className="h-4 w-4" />
              <span>התחבר</span>
            </Link>
          )}
        </div>
      </div>

      {/* Secondary Navbar with Search */}
      <div className="container mx-auto flex h-14 items-center justify-between px-4 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="flex items-center space-x-6 space-x-reverse text-sm font-medium text-zinc-600 dark:text-zinc-400 overflow-x-auto hide-scrollbar z-50">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap">ראשי</Link>
          <Link href="/search?sort=latest" className="hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap">עדכונים אחרונים</Link>
          <Link href="/search?sort=popular" className="hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap">פופולרי</Link>
          <Link href="/search?sort=genres" className="hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap hidden sm:inline">ז'אנרים</Link>
        </div>

        <form action="/search" method="GET" className="relative ms-4">
          <button type="submit" className="absolute start-3 top-1/2 -translate-y-1/2">
            <Search className="h-4 w-4 text-zinc-400 hover:text-indigo-500 transition-colors" />
          </button>
          <input
            type="text"
            name="q"
            placeholder="חפש מנגה..."
            className="w-40 sm:w-64 brutal-input bg-zinc-50 dark:bg-zinc-900 px-10 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
        </form>
      </div>
    </header>
  );
}
