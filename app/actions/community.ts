'use server';

import { db } from '@/db';
import { communityPosts, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;
  if (!authEmail) return null;
  const [user] = await db.select().from(users).where(eq(users.email, authEmail));
  return user || null;
}

export async function createPostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('You must be logged in to post.');
  }

  const title = formData.get('title') as string;
  const content = (formData.get('content') as string) || '';
  const pollOptions = formData.getAll('pollOption') as string[];

  const hasPoll = pollOptions.length > 0;

  if (!title) {
    throw new Error('Title is required.');
  }

  if (!hasPoll && (!content || content === '<p></p>')) {
    throw new Error('Content or a Poll is required.');
  }

  const [newPost] = await db.insert(communityPosts).values({
    userId: user.id,
    title,
    content,
    parentId: null,
    rootPostId: null, // Top level post
  }).returning();

  if (hasPoll) {
    const { polls, pollOptions: pollOptionsTable } = await import('@/db/schema');
    
    // Create the poll
    const [newPoll] = await db.insert(polls).values({
      postId: newPost.id,
      question: title, // use title as the poll question
    }).returning();

    // Create options
    for (const opt of pollOptions) {
      if (opt.trim() !== '') {
        await db.insert(pollOptionsTable).values({
          pollId: newPoll.id,
          text: opt.trim(),
        });
      }
    }
  }

  redirect(`/community/${newPost.id}`);
}

export async function createCommentAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('You must be logged in to comment.');
  }

  const content = formData.get('content') as string;
  const parentIdStr = formData.get('parentId') as string;
  const rootPostIdStr = formData.get('rootPostId') as string;
  const chapterIdStr = formData.get('chapterId') as string;

  if (!content) {
    throw new Error('Content is required.');
  }

  const parentId = parentIdStr || null;
  const rootPostId = rootPostIdStr || null;
  const chapterId = chapterIdStr || null;

  await db.insert(communityPosts).values({
    userId: user.id,
    content,
    parentId,
    rootPostId,
    chapterId,
  });

  if (rootPostId) {
    revalidatePath(`/community/${rootPostId}`);
  }
  if (chapterId) {
    // We cannot easily determine storyId here to revalidate the exact chapter page,
    // so we revalidate the whole story route.
    revalidatePath('/story/[id]/chapter/[chapterId]', 'page');
  }
}

export async function votePollAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('You must be logged in to vote.');
  }

  const pollIdStr = formData.get('pollId') as string;
  const optionIdStr = formData.get('optionId') as string;

  if (!pollIdStr || !optionIdStr) {
    throw new Error('Missing required fields.');
  }

  const pollId = pollIdStr;
  const optionId = optionIdStr;

  const { pollVotes } = await import('@/db/schema');
  
  // Check if already voted
  const existingVote = await db.select()
    .from(pollVotes)
    .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, user.id)))
    .limit(1);

  if (existingVote.length > 0) {
    // Update existing vote
    await db.update(pollVotes)
      .set({ optionId })
      .where(eq(pollVotes.id, existingVote[0].id));
  } else {
    // Insert new vote
    await db.insert(pollVotes).values({
      pollId,
      optionId,
      userId: user.id,
    });
  }

  // The page that submitted this will be the post details page, so revalidate it.
  // We can't easily get the post id here without another query, but we can revalidate the whole community route.
  revalidatePath('/community/[id]', 'page');
}

export async function togglePostLikeAction(postId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('You must be logged in to like posts.');
  }

  const { postLikes } = await import('@/db/schema');
  const existingLike = await db.select().from(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, user.id)));

  if (existingLike.length > 0) {
    await db.delete(postLikes).where(eq(postLikes.id, existingLike[0].id));
  } else {
    await db.insert(postLikes).values({
      postId,
      userId: user.id,
    });
  }

  revalidatePath('/community');
  revalidatePath(`/community/${postId}`);
}
