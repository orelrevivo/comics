import { db } from '@/db';
import { users, userSubscriptions, stories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/ProfileForm';
import Link from 'next/link';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;

  if (!authEmail) {
    redirect('/login');
  }

  const [user] = await db.select().from(users).where(eq(users.email, authEmail));

  if (!user) {
    redirect('/login');
  }

  // Fetch subscribed stories
  const subscribedStoriesRows = await db.select({
    story: stories
  })
    .from(userSubscriptions)
    .innerJoin(stories, eq(userSubscriptions.storyId, stories.id))
    .where(eq(userSubscriptions.userId, user.id));

  const subscribedStories = subscribedStoriesRows.map(r => r.story);

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Profile Settings */}
        <div className="lg:col-span-3">
          <div className="">
            <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-white">הגדרות פרופיל</h1>
            <ProfileForm user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
