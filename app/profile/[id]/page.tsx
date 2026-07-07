import { db } from '@/db';
import { users, communityPosts, userSubscriptions, stories } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PostItem from '@/components/PostItem';
import { cookies } from 'next/headers';

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const userId = resolvedParams.id;
  
  if (!userId) {
    notFound();
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    notFound();
  }

  // Get current user id for likes
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;
  let currentUserId: string | null = null;
  if (authEmail) {
    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, authEmail));
    if (u) currentUserId = u.id;
  }

  // Fetch posts by this user with like counts
  const { postLikes } = await import('@/db/schema');
  const userPosts = await db.select({
    post: communityPosts,
    likesCount: sql<number>`count(distinct ${postLikes.id})::int`,
    hasLiked: sql<boolean>`bool_or(${postLikes.userId} = ${currentUserId || 0})`,
  })
    .from(communityPosts)
    .leftJoin(postLikes, eq(communityPosts.id, postLikes.postId))
    .where(eq(communityPosts.userId, userId))
    .groupBy(communityPosts.id)
    .orderBy(desc(communityPosts.createdAt));

  // Fetch subscribed stories (Favorites)
  const subscribedStoriesRows = await db.select({
    story: stories
  })
    .from(userSubscriptions)
    .innerJoin(stories, eq(userSubscriptions.storyId, stories.id))
    .where(eq(userSubscriptions.userId, userId));
    
  const subscribedStories = subscribedStoriesRows.map(r => r.story);

  const displayName = user.name || user.email.split('@')[0];

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      {/* Profile Header */}
      <div className="bg-white dark:bg-[#0B1416] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 shadow-lg shrink-0">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-zinc-400 font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="text-center sm:text-start">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{displayName}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">הצטרף ב-{user.createdAt ? user.createdAt.toISOString().slice(0, 10).split('-').reverse().join('/') : 'לא ידוע'}</p>
          {user.bio && (
            <p className="text-zinc-700 dark:text-zinc-300 max-w-2xl whitespace-pre-wrap">{user.bio}</p>
          )}
        </div>
      </div>

      {/* User Posts */}
      <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">פוסטים אחרונים ({userPosts.length})</h2>
      <div className="space-y-4">
        {userPosts.length === 0 ? (
          <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
            משתמש זה עדיין לא פרסם פוסטים.
          </div>
        ) : (
          userPosts.map(({ post, likesCount, hasLiked }) => (
            <div key={post.id} className="bg-[#0B1416] p-4 rounded-xl border border-zinc-800 mb-4 hover:border-zinc-700 transition relative">
              <PostItem 
                post={post}
                author={{ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
                likesCount={likesCount}
                hasLiked={hasLiked}
                currentUserId={currentUserId}
                isFeedItem={true}
                hideReplyButton={true}
              />
            </div>
          ))
        )}
      </div>

      {/* Subscriptions */}
      <h2 className="text-2xl font-bold mt-12 mb-6 text-zinc-900 dark:text-white">סיפורים מועדפים ({subscribedStories.length})</h2>
      {subscribedStories.length === 0 ? (
        <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
          משתמש זה עדיין לא הוסיף סיפורים למועדפים.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
  );
}
