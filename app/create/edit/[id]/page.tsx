import { cookies } from "next/headers";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditStoryForm } from "@/components/EditStoryForm";
import Link from "next/link";

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;

  if (authEmail !== 'doron2010sha@gmail.com') {
    return (
      <div className="container mx-auto py-20 px-4 text-center max-w-lg">
        <div className="brutal-card bg-red-50 dark:bg-red-900/20 p-8 border border-red-200 dark:border-red-900/50">
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">Access Denied</h1>
          <p className="text-zinc-700 dark:text-zinc-300 mb-8">
            You don't allowed this feature. This feature is only available to the site administrator.
          </p>
          <Link href="/" className="brutal-btn bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-6 py-3 font-bold">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const resolvedParams = await params;
  const storyId = resolvedParams.id;
  if (!storyId) notFound();

  const storyResults = await db.select().from(stories).where(eq(stories.id, storyId));
  if (storyResults.length === 0) notFound();
  const story = storyResults[0];

  return <EditStoryForm storyId={story.id} initialData={story} />;
}
