import { signupAction } from "@/app/actions/auth";
import Link from "next/link";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const resolvedParams = await searchParams;
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm brutal-card bg-white p-8 dark:bg-zinc-900">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Create an account</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">Join us and start reading</p>
        </div>

        {resolvedParams?.error === 'EmailTaken' && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-900/50">
            That email is already registered.
          </div>
        )}

        <form action={signupAction} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full brutal-input bg-zinc-50 px-4 py-2.5 dark:bg-zinc-950 transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={6}
              className="w-full brutal-input bg-zinc-50 px-4 py-2.5 dark:bg-zinc-950 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full brutal-btn bg-indigo-600 px-4 py-3 font-semibold text-white transition-all"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
