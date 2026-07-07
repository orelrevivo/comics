import { db } from '@/db';
import { communityPosts, users } from '@/db/schema';
import { desc, eq, isNull } from 'drizzle-orm';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import CreatePostForm from '@/components/CreatePostForm';
import PostItem from '@/components/PostItem';
import { sql } from 'drizzle-orm';

export default async function CommunityHub() {
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;

  // Fetch all top-level posts (parentId is null)
  // Fetch all top-level posts with like counts
  const { postLikes } = await import('@/db/schema');

  let currentUserId: string | null = null;
  if (authEmail) {
    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, authEmail));
    if (u) currentUserId = u.id;
  }

  const posts = await db.select({
    post: communityPosts,
    authorId: users.id,
    authorName: users.name,
    authorEmail: users.email,
    authorAvatar: users.avatarUrl,
    likesCount: sql<number>`count(distinct ${postLikes.id})::int`,
    hasLiked: sql<boolean>`bool_or(${postLikes.userId} = ${currentUserId || 0})`,
  })
    .from(communityPosts)
    .leftJoin(users, eq(communityPosts.userId, users.id))
    .leftJoin(postLikes, eq(communityPosts.id, postLikes.postId))
    .where(isNull(communityPosts.parentId))
    .groupBy(communityPosts.id, users.id, users.name, users.email, users.avatarUrl)
    .orderBy(desc(communityPosts.createdAt));

  return (
    <div className="container mx-auto py-5 min-h-[70vh]">
      <div className='px-5'>
        {authEmail ? (
          <CreatePostForm />
        ) : (
          <div className="mb-10 bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl text-center border border-indigo-100 dark:border-indigo-800/30">
            <p className="text-indigo-800 dark:text-indigo-300 mb-4">
              כדי להשתתף בדיונים ולפרסם פוסטים עליך להיות מחובר.
            </p>
            <Link href="/login" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
              התחבר עכשיו
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-4 px-5">
        {posts.length === 0 ? (
          <div className="text-center p-10 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl">
            <p className="text-zinc-500">אין דיונים עדיין. היה הראשון לפרסם!</p>
          </div>
        ) : (
          posts.map(({ post, authorId, authorName, authorEmail, authorAvatar, likesCount, hasLiked }) => (
            <div key={post.id} className="bg-[#18181B]/60 px-4 py-4 rounded-xl">
              <PostItem
                post={post}
                author={{ id: authorId || "", name: authorName || "", email: authorEmail || "", avatarUrl: authorAvatar || "" }}
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
    </div>
  );
}
