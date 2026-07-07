import { db } from '@/db';
import { communityPosts, users, polls, pollOptions, pollVotes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowRight, CornerDownLeft, MessageSquare } from 'lucide-react';
import { votePollAction } from '@/app/actions/community';
import { CommentForm } from '@/components/CommentForm';
import PostItem from '@/components/PostItem';
import { sql } from 'drizzle-orm';

function CommentNode({ comment, allComments, rootPostId, authEmail, currentUserId }: any) {
  const childComments = allComments.filter((c: any) => c.post.parentId === comment.post.id);

  return (
    <PostItem
      post={comment.post}
      author={{ id: comment.authorId, name: comment.authorName, email: comment.authorEmail, avatarUrl: comment.authorAvatar }}
      likesCount={comment.likesCount}
      hasLiked={comment.hasLiked}
      currentUserId={currentUserId}
      isComment={true}
      authEmail={authEmail}
      rootPostId={rootPostId}
    >
      {childComments.map((child: any) => (
        <CommentNode
          key={child.post.id}
          comment={child}
          allComments={allComments}
          rootPostId={rootPostId}
          authEmail={authEmail}
          currentUserId={currentUserId}
        />
      ))}
    </PostItem>
  );
}

export default async function PostDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const postId = resolvedParams.id;
  if (!postId) notFound();

  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;

  let currentUserId: string | null = null;
  if (authEmail) {
    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, authEmail));
    if (u) currentUserId = u.id;
  }

  // Fetch the main post
  const { postLikes } = await import('@/db/schema');
  const [mainPostRow] = await db.select({
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
    .where(eq(communityPosts.id, postId))
    .groupBy(communityPosts.id, users.id, users.name, users.email, users.avatarUrl);

  if (!mainPostRow || mainPostRow.post.parentId !== null) {
    notFound(); // Not a top level post or doesn't exist
  }

  const { post: mainPost, authorEmail } = mainPostRow;
  const mainAuthorName = authorEmail ? authorEmail.split('@')[0] : 'אנונימי';

  // Fetch all comments for this root post
  const allComments = await db.select({
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
    .where(eq(communityPosts.rootPostId, postId))
    .groupBy(communityPosts.id, users.id, users.name, users.email, users.avatarUrl);

  // Find direct replies to the main post
  const topLevelComments = allComments.filter(c => c.post.parentId === postId);

  // Fetch poll if it exists
  const [poll] = await db.select().from(polls).where(eq(polls.postId, postId));
  let options: any[] = [];
  let votes: any[] = [];
  let currentUserVoteId: number | null = null;

  if (poll) {
    options = await db.select().from(pollOptions).where(eq(pollOptions.pollId, poll.id));
    votes = await db.select().from(pollVotes).where(eq(pollVotes.pollId, poll.id));

    if (authEmail) {
      const [currentUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, authEmail));
      if (currentUser) {
        const userVote = votes.find(v => v.userId === currentUser.id);
        if (userVote) {
          currentUserVoteId = userVote.optionId;
        }
      }
    }
  }

  const totalVotes = votes.length;

  return (
    <div className="container mx-auto py-8 max-w-4xl min-h-[70vh]">
      <Link href="/community" className="inline-flex items-center gap-2 text-zinc-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowRight className="h-4 w-4" /> חזרה לקהילה
      </Link>

      <div className="p-6 mb-8">
        <PostItem
          post={mainPostRow.post}
          author={{
            id: mainPostRow.authorId || "",
            name: mainPostRow.authorName || "",
            email: mainPostRow.authorEmail || "",
            avatarUrl: mainPostRow.authorAvatar || ""
          }}
          likesCount={mainPostRow.likesCount}
          hasLiked={mainPostRow.hasLiked}
          currentUserId={currentUserId}
          authEmail={authEmail}
          rootPostId={postId}
        />

        {poll && (
          <div className="bg-zinc-50 dark:bg-[#0B1416] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-zinc-100">{poll.question}</h3>
            <div className="space-y-3">
              {options.map((opt) => {
                const optionVotes = votes.filter(v => v.optionId === opt.id).length;
                const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                const isSelected = currentUserVoteId === opt.id;

                return (
                  <form action={votePollAction} key={opt.id} className="relative">
                    <input type="hidden" name="pollId" value={poll.id} />
                    <input type="hidden" name="optionId" value={opt.id} />
                    <button
                      type="submit"
                      disabled={!authEmail}
                      className={`w-full text-left relative overflow-hidden border p-3 rounded-lg transition group ${isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                        : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                    >
                      {/* Progress Bar Background */}
                      {(currentUserVoteId !== null || !authEmail) && (
                        <div
                          className={`absolute inset-y-0 start-0 ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-zinc-100 dark:bg-zinc-800/50'} -z-0`}
                          style={{ width: `${percentage}%` }}
                        />
                      )}

                      <div className="relative z-10 flex justify-between items-center">
                        <span className={`font-medium ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-zinc-800 dark:text-zinc-200'}`}>
                          {opt.text}
                        </span>
                        {(currentUserVoteId !== null || !authEmail) && (
                          <span className="text-sm font-bold text-zinc-500">
                            {percentage}%
                          </span>
                        )}
                      </div>
                    </button>
                  </form>
                );
              })}
            </div>
            <div className="mt-4 text-xs text-zinc-500">
              {totalVotes} הצבעות • {currentUserVoteId ? 'הצבעת כבר' : authEmail ? 'לחץ כדי להצביע' : 'התחבר כדי להצביע'}
            </div>
          </div>
        )}

        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <div className="flex items-center gap-2 text-zinc-500 font-medium mb-4">
            <MessageSquare className="h-5 w-5" /> {allComments.length} תגובות
          </div>

          {authEmail ? (
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl">
              <h3 className="text-sm font-semibold mb-2">הוסף תגובה לפוסט</h3>
              <CommentForm parentId={mainPost.id} rootPostId={mainPost.id} authEmail={authEmail} />
            </div>
          ) : (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-center text-sm text-indigo-800 dark:text-indigo-300">
              התחבר כדי להגיב. <Link href="/login" className="font-bold underline">להתחברות</Link>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {topLevelComments.map(comment => (
          <CommentNode
            key={comment.post.id}
            comment={comment}
            allComments={allComments}
            rootPostId={mainPost.id}
            authEmail={authEmail}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}
