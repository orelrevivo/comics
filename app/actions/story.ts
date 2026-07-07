'use server';

import { db } from '@/db';
import { stories, chapters, images } from '@/db/schema';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

async function uploadFileLocally(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(uploadDir, fileName), buffer);
  return `/uploads/${fileName}`;
}

export async function createStoryAction(formData: FormData) {
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;

  if (authEmail !== 'orel@gmail.com') {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const author = formData.get('author') as string;
  const tags = formData.get('tags') as string;
  const type = formData.get('type') as string;
  const status = formData.get('status') as string;
  const released = formData.get('released') as string;
  const officialTranslation = formData.get('officialTranslation') as string;
  const animeAdaptation = formData.get('animeAdaptation') as string;
  const adultContent = formData.get('adultContent') === 'on';
  const rss = formData.get('rss') as string;
  const track = formData.get('track') as string;
  const chapterNumber = parseInt(formData.get('chapterNumber') as string || '1', 10);
  const chapterTitle = formData.get('chapterTitle') as string;

  // Handle Banner Upload
  const bannerFile = formData.get('banner') as File;
  let bannerUrl = '';

  if (bannerFile && bannerFile.size > 0) {
    bannerUrl = await uploadFileLocally(bannerFile);
  }

  // Insert Story
  const [newStory] = await db.insert(stories).values({
    title,
    description,
    author,
    tags,
    type,
    status,
    released,
    officialTranslation,
    animeAdaptation,
    adultContent,
    rss,
    track,
    bannerImage: bannerUrl,
  }).returning();

  // Insert Chapter
  const [newChapter] = await db.insert(chapters).values({
    storyId: newStory.id,
    chapterNumber,
    title: chapterTitle,
  }).returning();


  // Handle Chapter Images
  const allEntries = Array.from(formData.entries());
  let imageFiles = allEntries.filter(([key, val]) => key === 'chapterImages' && val instanceof File) as [string, File][];
  
  // Sort by filename to ensure correct page order
  imageFiles.sort((a, b) => a[1].name.localeCompare(b[1].name));
  
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i][1];
    if (file && file.size > 0) {
      const imageUrl = await uploadFileLocally(file);
      await db.insert(images).values({
        chapterId: newChapter.id,
        imageUrl,
        order: i + 1,
      });
    }
  }

  redirect(`/story/${newStory.id}`);
}

// Creates story + chapter WITHOUT images, returns IDs so client can upload images separately
export async function createStoryMetaAction(formData: FormData): Promise<{ storyId: string; chapterId: string }> {
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;

  if (authEmail !== 'orel@gmail.com') {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const author = formData.get('author') as string;
  const tags = formData.get('tags') as string;
  const type = formData.get('type') as string;
  const status = formData.get('status') as string;
  const released = formData.get('released') as string;
  const adultContent = formData.get('adultContent') === 'on';
  const chapterNumber = parseInt(formData.get('chapterNumber') as string || '1', 10);
  const chapterTitle = formData.get('chapterTitle') as string;

  // Handle Banner Upload
  const bannerFile = formData.get('banner') as File;
  let bannerUrl = '';

  if (bannerFile && bannerFile.size > 0) {
    bannerUrl = await uploadFileLocally(bannerFile);
  }

  const [newStory] = await db.insert(stories).values({
    title, description, author, tags, type, status, released,
    adultContent, bannerImage: bannerUrl,
  }).returning();

  const [newChapter] = await db.insert(chapters).values({
    storyId: newStory.id,
    chapterNumber,
    title: chapterTitle,
  }).returning();

  return { storyId: newStory.id, chapterId: newChapter.id };
}

// Save a single image URL to a chapter (called by client after each individual upload)
export async function saveChapterImageAction(chapterId: string, imageUrl: string, order: number) {
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;
  if (authEmail !== 'orel@gmail.com') throw new Error('Unauthorized');

  await db.insert(images).values({ chapterId, imageUrl, order });
}


async function getCurrentUser() {
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;
  if (!authEmail) return null;
  const { users } = await import('@/db/schema');
  const { eq } = await import('drizzle-orm');
  const [user] = await db.select().from(users).where(eq(users.email, authEmail));
  return user || null;
}

export async function toggleStorySubscriptionAction(storyId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('You must be logged in to subscribe to stories.');
  }

  const { userSubscriptions } = await import('@/db/schema');
  const { eq, and } = await import('drizzle-orm');
  
  const existingSub = await db.select()
    .from(userSubscriptions)
    .where(and(eq(userSubscriptions.storyId, storyId), eq(userSubscriptions.userId, user.id)));

  if (existingSub.length > 0) {
    // Unsubscribe
    await db.delete(userSubscriptions).where(eq(userSubscriptions.id, existingSub[0].id));
  } else {
    // Subscribe
    await db.insert(userSubscriptions).values({
      storyId,
      userId: user.id,
    });
  }

  revalidatePath(`/story/${storyId}`);
  revalidatePath('/profile');
}

export async function editStoryAction(storyId: string, formData: FormData) {
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;

  if (authEmail !== 'orel@gmail.com') {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const author = formData.get('author') as string;
  const tags = formData.get('tags') as string;
  const type = formData.get('type') as string;
  const status = formData.get('status') as string;
  const released = formData.get('released') as string;
  const officialTranslation = formData.get('officialTranslation') as string;
  const animeAdaptation = formData.get('animeAdaptation') as string;
  const adultContent = formData.get('adultContent') === 'on';
  const rss = formData.get('rss') as string;
  const track = formData.get('track') as string;

  // Handle Banner Upload (Optional)
  const bannerFile = formData.get('banner') as File;
  let bannerUrl = '';

  if (bannerFile && bannerFile.size > 0) {
    bannerUrl = await uploadFileLocally(bannerFile);
  }

  const updateData: any = {
    title,
    description,
    author,
    tags,
    type,
    status,
    released,
    officialTranslation,
    animeAdaptation,
    adultContent,
    rss,
    track,
  };

  if (bannerUrl) {
    updateData.bannerImage = bannerUrl;
  }

  const { eq } = await import('drizzle-orm');
  await db.update(stories).set(updateData).where(eq(stories.id, storyId));

  revalidatePath(`/story/${storyId}`);
  redirect(`/story/${storyId}`);
}

export async function addChapterAction(storyId: string, chapterTitle: string, chapterNumber: number) {
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;
  if (authEmail !== 'orel@gmail.com') throw new Error('Unauthorized');

  await db.insert(chapters).values({
    storyId,
    chapterNumber,
    title: chapterTitle,
  });

  revalidatePath(`/create/edit/${storyId}/chapters`);
}

export async function deleteChapterAction(chapterId: string, storyId: string) {
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;
  if (authEmail !== 'orel@gmail.com') throw new Error('Unauthorized');

  const { eq } = await import('drizzle-orm');
  
  // First delete all images associated with this chapter
  await db.delete(images).where(eq(images.chapterId, chapterId));
  
  // Then delete the chapter
  await db.delete(chapters).where(eq(chapters.id, chapterId));

  revalidatePath(`/create/edit/${storyId}/chapters`);
  revalidatePath(`/story/${storyId}`);
}

export async function uploadChapterImagesAction(chapterId: string, formData: FormData) {
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;
  if (authEmail !== 'orel@gmail.com') throw new Error('Unauthorized');

  const { eq, desc } = await import('drizzle-orm');

  // Find max order
  const existingImages = await db.select().from(images).where(eq(images.chapterId, chapterId)).orderBy(desc(images.order));
  let startOrder = existingImages.length > 0 ? existingImages[0].order + 1 : 1;

  const allEntries = Array.from(formData.entries());
  let imageFiles = allEntries.filter(([key, val]) => key === 'chapterImages' && val instanceof File) as [string, File][];
  
  imageFiles.sort((a, b) => a[1].name.localeCompare(b[1].name));
  
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i][1];
    if (file && file.size > 0) {
      const imageUrl = await uploadFileLocally(file);
      await db.insert(images).values({
        chapterId: chapterId,
        imageUrl,
        order: startOrder + i,
      });
    }
  }

  // Need storyId to revalidate
  const [chapter] = await db.select().from(chapters).where(eq(chapters.id, chapterId));
  if (chapter) {
    revalidatePath(`/create/edit/${chapter.storyId}/chapters/${chapterId}`);
  }
}

export async function deleteChapterImageAction(imageId: string, chapterId: string, storyId: string) {
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;
  if (authEmail !== 'orel@gmail.com') throw new Error('Unauthorized');

  const { eq } = await import('drizzle-orm');
  
  await db.delete(images).where(eq(images.id, imageId));

  revalidatePath(`/create/edit/${storyId}/chapters/${chapterId}`);
}

export async function deleteStoryAction(storyId: string) {
  const cookieStore = await cookies();
  const authEmail = cookieStore.get('auth_email')?.value;
  if (authEmail !== 'orel@gmail.com') throw new Error('Unauthorized');

  const { eq } = await import('drizzle-orm');
  const { userSubscriptions } = await import('@/db/schema');

  // 1. Delete all subscriptions to this story
  await db.delete(userSubscriptions).where(eq(userSubscriptions.storyId, storyId));

  // 2. Get all chapters for this story
  const storyChapters = await db.select().from(chapters).where(eq(chapters.storyId, storyId));

  const { communityPosts, polls, pollOptions, pollVotes, postLikes } = await import('@/db/schema');

  // 3. Delete all images & community posts for each chapter
  for (const chapter of storyChapters) {
    await db.delete(images).where(eq(images.chapterId, chapter.id));

    // Get posts for this chapter
    const posts = await db.select().from(communityPosts).where(eq(communityPosts.chapterId, chapter.id));
    for (const post of posts) {
      // Delete post likes
      await db.delete(postLikes).where(eq(postLikes.postId, post.id));
      
      // Get polls for this post
      const postPolls = await db.select().from(polls).where(eq(polls.postId, post.id));
      for (const poll of postPolls) {
        await db.delete(pollVotes).where(eq(pollVotes.pollId, poll.id));
        await db.delete(pollOptions).where(eq(pollOptions.pollId, poll.id));
        await db.delete(polls).where(eq(polls.id, poll.id));
      }
      
      // Finally delete the post
      await db.delete(communityPosts).where(eq(communityPosts.id, post.id));
    }
  }

  // 4. Delete all chapters
  await db.delete(chapters).where(eq(chapters.storyId, storyId));

  // 5. Delete the story itself
  await db.delete(stories).where(eq(stories.id, storyId));

  revalidatePath('/');
  redirect('/');
}
