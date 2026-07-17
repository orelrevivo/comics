import { db } from "@/db";
import { stories, chapters, images } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ReaderViewer from "@/components/ReaderViewer";
import { cookies } from "next/headers";
import { users, communityPosts, postLikes } from "@/db/schema";
import { sql } from "drizzle-orm";
import { CommentForm } from "@/components/CommentForm";
import PostItem from "@/components/PostItem";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

function CommentNode({ comment, allComments, chapterId, authEmail, currentUserId }: any) {
  const childComments = allComments.filter((c: any) => c.post.parentId === comment.post.id);

  return (
    <PostItem
      post={comment.post}
      author={{ id: comment.authorId, name: comment.authorName, email: comment.authorEmail, avatarUrl: comment.authorAvatar, isVerified: comment.authorIsVerified ?? false }}
      likesCount={comment.likesCount}
      hasLiked={comment.hasLiked}
      currentUserId={currentUserId}
      isComment={true}
      authEmail={authEmail}
      rootPostId={undefined}
    >
      {/* For nested replies, we actually still need to know rootPostId, or just omit rootPostId and it won't allow replies? 
          Wait, CommentForm needs parentId and chapterId now. Let's update PostItem to pass chapterId. */}
      {childComments.map((child: any) => (
        <CommentNode
          key={child.post.id}
          comment={child}
          allComments={allComments}
          chapterId={chapterId}
          authEmail={authEmail}
          currentUserId={currentUserId}
        />
      ))}
    </PostItem>
  );
}

export default async function ChapterPage({ params }: { params: Promise<{ id: string, chapterId: string }> }) {
  const resolvedParams = await params;
  const storyId = resolvedParams.id;
  const chapterId = resolvedParams.chapterId;
  if (!storyId || !chapterId) notFound();

  const storyResults = await db.select().from(stories).where(eq(stories.id, storyId));
  if (storyResults.length === 0) notFound();
  const story = storyResults[0];

  const chapterResults = await db.select().from(chapters).where(eq(chapters.id, chapterId));
  if (chapterResults.length === 0) notFound();
  const chapter = chapterResults[0];

  const rawImages = await db.select({ id: images.id, order: images.order, isWide: images.isWide }).from(images).where(eq(images.chapterId, chapterId)).orderBy(images.order);
  const chapterImages = rawImages.map(img => ({ ...img, imageUrl: `/api/image/${img.id}` }));

  // Pagination for chapters (previous / next)
  const allChapters = await db.select().from(chapters).where(eq(chapters.storyId, storyId)).orderBy(chapters.chapterNumber);
  const currentIndex = allChapters.findIndex(c => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  // Comments logic
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;

  let currentUserId: string | null = null;
  let initialReaderSettings = null;
  
  if (authEmail) {
    const [u] = await db.select({ id: users.id, readerSettings: users.readerSettings }).from(users).where(eq(users.email, authEmail));
    if (u) {
      currentUserId = u.id;
      if (u.readerSettings) {
        try {
          initialReaderSettings = JSON.parse(u.readerSettings);
        } catch (e) {}
      }
    }
  }

  const allComments = await db.select({
    post: communityPosts,
    authorId: users.id,
    authorName: users.name,
    authorEmail: users.email,
    authorAvatar: users.avatarUrl,
    authorIsVerified: users.isVerified,
    likesCount: sql<number>`count(distinct ${postLikes.id})::int`,
    hasLiked: sql<boolean>`bool_or(${postLikes.userId} = ${currentUserId || 0})`,
  })
    .from(communityPosts)
    .leftJoin(users, eq(communityPosts.userId, users.id))
    .leftJoin(postLikes, eq(communityPosts.id, postLikes.postId))
    .where(eq(communityPosts.chapterId, chapterId))
    .groupBy(communityPosts.id, users.id, users.name, users.email, users.avatarUrl, users.isVerified);

  const topLevelComments = allComments.filter(c => !c.post.parentId);

  return (
    <div className="flex flex-col min-h-screen">
      <ReaderViewer
        story={story}
        chapter={chapter}
        chapterImages={chapterImages}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
        initialSettings={initialReaderSettings}
        isLoggedIn={!!currentUserId}
      />

      <div className="container mx-auto py-8 max-w-4xl px-4">
        <div className="brutal-card bg-white dark:bg-zinc-900 p-6">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold mb-6 text-xl">
            <MessageSquare className="h-6 w-6" /> תגובות ({allComments.length})
          </div>

          <div className="mb-8">
            {authEmail ? (
              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-semibold mb-2">הוסף תגובה לפרק</h3>
                <CommentForm chapterId={chapterId} authEmail={authEmail} />
              </div>
            ) : (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-center text-sm text-indigo-800 dark:text-indigo-300">
                התחבר כדי להגיב. <Link href="/login" className="font-bold underline">להתחברות</Link>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {topLevelComments.map(comment => (
              <CommentNode
                key={comment.post.id}
                comment={comment}
                allComments={allComments}
                chapterId={chapterId}
                authEmail={authEmail}
                currentUserId={currentUserId}
              />
            ))}
            {topLevelComments.length === 0 && (
              <div className="text-center text-zinc-500 py-8">אין תגובות עדיין. היה הראשון להגיב!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
