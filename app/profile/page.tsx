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
        <div className="lg:col-span-1">
          <div className="brutal-card bg-white dark:bg-[#0B1416] p-8">
            <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-white">הגדרות פרופיל</h1>
            <ProfileForm user={user} />
          </div>
        </div>

        {/* Subscriptions */}
        <div className="lg:col-span-2">
          <div className="brutal-card bg-white dark:bg-[#0B1416] p-8">
            <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">הסיפורים שלי (מועדפים)</h2>
            {subscribedStories.length === 0 ? (
              <p className="text-zinc-500">עוד לא הוספת סיפורים למועדפים.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {subscribedStories.map((story) => (
                  <Link href={`/story/${story.id}`} key={story.id} className="group block">
                    <div className="aspect-[2/3] w-full overflow-hidden brutal-card bg-zinc-100 dark:bg-zinc-800 mb-2 transition-transform group-hover:translate-y-[-4px]">
                      {story.bannerImage ? (
                        <img src={story.bannerImage} alt={story.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-400">אין תמונה</div>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 line-clamp-1">{story.title}</h3>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
