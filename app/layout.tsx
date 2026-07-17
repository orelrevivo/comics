import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";

const rubik = Rubik({ subsets: ["hebrew", "latin"] });

export const metadata: Metadata = {
  title: "מנגה סטרוגל",
  description: "קראו את המנגות האהובות עליכם",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${rubik.className} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col dark:bg-black text-zinc-900 dark:text-zinc-50">
        <div className="mx-auto w-full max-w-4xl min-h-screen flex flex-col bg-white dark:bg-zinc-950 shadow-2xl border-x border-zinc-300 dark:border-zinc-800 relative">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </body>
    </html>
  );
}