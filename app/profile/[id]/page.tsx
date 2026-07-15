import { db } from '@/db';
import { users, communityPosts, userSubscriptions, stories, postLikes } from '@/db/schema';
import { eq, desc, sql, isNull, isNotNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PostItem from '@/components/PostItem';
import ProfileHeader from '@/components/ProfileHeader';
import { cookies } from 'next/headers';

export default async function PublicProfilePage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ tab?: string }> }) {
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams;
  const userId = resolvedParams.id;
  let currentTab = resolvedSearchParams.tab || 'posts';

  if (!userId) {
    notFound();
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    notFound();
  }

  // Handle hidden replies tab
  if (!user.showRepliesTab && currentTab === 'comments') {
    currentTab = 'posts';
  }

  // Get current user id for likes
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;
  let currentUserId: string | null = null;
  if (authEmail) {
    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, authEmail));
    if (u) currentUserId = u.id;
  }

  // Fetch root posts by this user
  const userRootPosts = await db.select({
    post: communityPosts,
    likesCount: sql<number>`count(distinct ${postLikes.id})::int`,
    hasLiked: sql<boolean>`bool_or(${postLikes.userId} = ${currentUserId || 0})`,
  })
    .from(communityPosts)
    .leftJoin(postLikes, eq(communityPosts.id, postLikes.postId))
    .where(sql`${communityPosts.userId} = ${userId} AND ${communityPosts.parentId} IS NULL AND ${communityPosts.chapterId} IS NULL`)
    .groupBy(communityPosts.id)
    .orderBy(desc(communityPosts.createdAt));

  // Fetch comments by this user
  const userComments = await db.select({
    post: communityPosts,
    likesCount: sql<number>`count(distinct ${postLikes.id})::int`,
    hasLiked: sql<boolean>`bool_or(${postLikes.userId} = ${currentUserId || 0})`,
  })
    .from(communityPosts)
    .leftJoin(postLikes, eq(communityPosts.id, postLikes.postId))
    .where(sql`${communityPosts.userId} = ${userId} AND (${communityPosts.parentId} IS NOT NULL OR ${communityPosts.chapterId} IS NOT NULL)`)
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
    <div className="container mx-auto max-w-4xl">
      {/* Profile Header */}
      <ProfileHeader
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          coverColor: user.coverColor,
          createdAt: user.createdAt,
          bio: user.bio,
          isVerified: user.isVerified
        }}
        isOwner={currentUserId === user.id}
      />

      {user.isPrivate && currentUserId !== user.id ? (
        <div className="p-12 text-center bg-white dark:bg-[#0B1416] border-y sm:border sm:rounded-xl border-zinc-200 dark:border-zinc-800 mt-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">This account is private</h2>
          <p className="text-zinc-500">Only approved followers can see what {displayName} shares.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex w-full border-b border-zinc-200 dark:border-zinc-800 mb-6">
            <Link 
              href={`/profile/${userId}?tab=posts`}
              className="flex-1 flex justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <div className="relative py-4 flex flex-col items-center">
                <span className={`text-[15px] ${currentTab === 'posts' ? 'font-bold text-zinc-900 dark:text-white' : 'font-medium text-zinc-500 dark:text-[#71767b]'}`}>
                  Posts
                </span>
                {currentTab === 'posts' && (
                  <div className="absolute bottom-0 h-1 bg-[#1D9BF0] rounded-full w-full"></div>
                )}
              </div>
            </Link>
            
            {user.showRepliesTab !== false && (
              <Link 
                href={`/profile/${userId}?tab=comments`}
                className="flex-1 flex justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="relative py-4 flex flex-col items-center">
                  <span className={`text-[15px] ${currentTab === 'comments' ? 'font-bold text-zinc-900 dark:text-white' : 'font-medium text-zinc-500 dark:text-[#71767b]'}`}>
                    Replies
                  </span>
                  {currentTab === 'comments' && (
                    <div className="absolute bottom-0 h-1 bg-[#1D9BF0] rounded-full w-full"></div>
                  )}
                </div>
              </Link>
            )}

            <Link 
              href={`/profile/${userId}?tab=subscribers`}
              className="flex-1 flex justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <div className="relative py-4 flex flex-col items-center">
                <span className={`text-[15px] ${currentTab === 'subscribers' ? 'font-bold text-zinc-900 dark:text-white' : 'font-medium text-zinc-500 dark:text-[#71767b]'}`}>
                  Subscribers
                </span>
                {currentTab === 'subscribers' && (
                  <div className="absolute bottom-0 h-1 bg-[#1D9BF0] rounded-full w-full"></div>
                )}
              </div>
            </Link>
          </div>

          {/* Tab Content */}
      <div className="px-4">
        {currentTab === 'posts' && (
          <div className="space-y-4">
            {userRootPosts.length === 0 ? (
              <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                This user hasn't published any posts yet.
              </div>
            ) : (
              userRootPosts.map(({ post, likesCount, hasLiked }) => (
                <div key={post.id} className="border-b border-[#17171A] p-4 mb-4 transition relative">
                  <PostItem
                    post={post}
                    author={{ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, isVerified: user.isVerified }}
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
        )}

        {currentTab === 'comments' && (
          <div className="space-y-4">
            {userComments.length === 0 ? (
              <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                This user hasn't commented on anything yet.
              </div>
            ) : (
              userComments.map(({ post, likesCount, hasLiked }) => (
                <div key={post.id} className="border-b border-[#17171A] p-4 mb-4 transition relative">
                  <PostItem
                    post={post}
                    author={{ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, isVerified: user.isVerified }}
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
        )}

        {currentTab === 'subscribers' && (
          <div>
            {subscribedStories.length === 0 ? (
              <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                This user hasn't subscribed to any stories yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {subscribedStories.map((story) => (
                  <Link href={`/story/${story.id}`} key={story.id} className="group block">
                    <div className="aspect-[2/3] w-full overflow-hidden brutal-card bg-zinc-100 dark:bg-zinc-800 mb-2 transition-transform group-hover:translate-y-[-4px]">
                      {story.bannerImage ? (
                        <img src={story.bannerImage} alt={story.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-400">No image</div>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 line-clamp-1">{story.title}</h3>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}
