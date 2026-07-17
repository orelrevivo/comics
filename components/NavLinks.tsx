"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function NavLinks() {
  const pathname = usePathname();

  const getLinkClass = (isActive: boolean) => {
    return `relative whitespace-nowrap py-1 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 after:absolute after:inset-x-0 after:-bottom-[1px] after:h-[2px] after:scale-x-0 after:bg-indigo-600 after:transition-transform after:duration-200 after:content-[''] hover:after:scale-x-100 dark:after:bg-indigo-400 ${isActive ? 'text-indigo-600 after:scale-x-100 dark:text-indigo-400' : ''
      }`.trim();
  };

  return (
    <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400 z-50">
      <Link
        href="/"
        className={getLinkClass(pathname === '/')}
        aria-current={pathname === '/' ? 'page' : undefined}
        suppressHydrationWarning
      >
        ראשי
      </Link>
      <Link
        href="/search?sort=latest"
        className={getLinkClass(pathname?.startsWith('/search') || false)}
        aria-current={pathname?.startsWith('/search') ? 'page' : undefined}
        suppressHydrationWarning
      >
        עדכונים אחרונים
      </Link>
    </nav>
  );
}
