import { pgTable, text, timestamp, integer, boolean, AnyPgColumn } from 'drizzle-orm/pg-core';
import crypto from 'crypto';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, '')),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  coverColor: text('cover_color').default('#333333'),
  bio: text('bio'),
  showRepliesTab: boolean('show_replies_tab').default(true),
  isPrivate: boolean('is_private').default(false),
  isVerified: boolean('is_verified').default(false),
  isAdmin: boolean('is_admin').default(false),
  readerSettings: text('reader_settings'),
  createdAt: timestamp('created_at').defaultNow(),
});


export const stories = pgTable('stories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, '')),
  title: text('title').notNull(),
  description: text('description'),
  bannerImage: text('banner_image'),
  author: text('author'),
  tags: text('tags'),
  type: text('type'),
  status: text('status'),
  released: text('released'),
  officialTranslation: text('official_translation'),
  animeAdaptation: text('anime_adaptation'),
  adultContent: boolean('adult_content').default(false),
  rss: text('rss'),
  track: text('track'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chapters = pgTable('chapters', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, '')),
  storyId: text('story_id').references(() => stories.id).notNull(),
  chapterNumber: integer('chapter_number').notNull(),
  title: text('title'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const images = pgTable('images', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, '')),
  chapterId: text('chapter_id').references(() => chapters.id).notNull(),
  imageUrl: text('image_url').notNull(),
  order: integer('order').notNull(),
  isWide: boolean('is_wide').default(false),
});

export const communityPosts = pgTable('community_posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, '')),
  userId: text('user_id').references(() => users.id).notNull(),
  parentId: text('parent_id').references((): AnyPgColumn => communityPosts.id),
  rootPostId: text('root_post_id').references((): AnyPgColumn => communityPosts.id),
  chapterId: text('chapter_id').references(() => chapters.id),
  title: text('title'),
  content: text('content').notNull(),
  isDraft: boolean('is_draft').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const polls = pgTable('polls', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, '')),
  postId: text('post_id').references(() => communityPosts.id).notNull(),
  question: text('question').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const pollOptions = pgTable('poll_options', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, '')),
  pollId: text('poll_id').references(() => polls.id).notNull(),
  text: text('text').notNull(),
});

export const pollVotes = pgTable('poll_votes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, '')),
  pollId: text('poll_id').references(() => polls.id).notNull(),
  optionId: text('option_id').references(() => pollOptions.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const postLikes = pgTable('post_likes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, '')),
  postId: text('post_id').references(() => communityPosts.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userSubscriptions = pgTable('user_subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, '')),
  userId: text('user_id').references(() => users.id).notNull(),
  storyId: text('story_id').references(() => stories.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

