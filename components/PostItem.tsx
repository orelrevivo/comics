'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageSquare, CornerDownLeft, CheckCircle2 } from 'lucide-react';
import LikeButton from '@/components/LikeButton';
import { CommentForm } from '@/components/CommentForm';
import { useState } from 'react';

interface PostItemProps {
  post: {
    id: string;
    title?: string | null;
    content: string;
    createdAt?: Date | null;
  };
  author: {
    id: string;
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    isVerified?: boolean;
  };
  likesCount: number;
  hasLiked: boolean;
  currentUserId?: string | null;
  isComment?: boolean;
  isFeedItem?: boolean;
  hideReplyButton?: boolean;
  authEmail?: string | null;
  rootPostId?: string;
  chapterId?: string;
  children?: React.ReactNode;
}

export default function PostItem({
  post,
  author,
  likesCount = 0,
  hasLiked = false,
  currentUserId = null,
  isComment = false,
  isFeedItem = false,
  hideReplyButton = false,
  authEmail,
  rootPostId,
  chapterId,
  children
}: PostItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const displayName = author.name || (author.email ? author.email.split('@')[0] : 'אנונימי');

  // Format time like "2h" or date
  let timeStr = '';
  if (post.createdAt) {
    const diffHours = Math.floor((Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60));
    if (diffHours < 24 && diffHours > 0) {
      timeStr = `${diffHours}h`;
    } else {
      timeStr = post.createdAt.toISOString().slice(0, 10).split('-').reverse().join('/');
    }
  }

  const router = useRouter();

  const Wrapper = 'div';
  const wrapperProps = isFeedItem 
    ? { onClick: () => router.push(`/community/${post.id}`), className: "block cursor-pointer" } 
    : { className: "block" };

  return (
    <div className="relative flex flex-col w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/profile/${author.id}`} className="relative group z-10 block shrink-0" onClick={(e) => e.stopPropagation()}>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0B1416] transition-transform group-hover:scale-105 flex items-center justify-center">
            {author.avatarUrl ? (
              <img src={author.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white bg-indigo-600">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/profile/${author.id}`} className="font-bold text-[15px] text-zinc-100 hover:underline z-10 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {displayName}
            {author.isVerified && <img src="/Verified Badge.svg" alt="Verified" className="w-4 h-4" />}
          </Link>
          <span className="text-zinc-500 text-xs font-medium">{timeStr}</span>
        </div>
      </div>

      {isComment && children && (
        <div className="absolute top-10 bottom-0 start-5 w-[2px] bg-zinc-800 rounded-full opacity-50 -translate-x-1/2" />
      )}

      {/* Content */}
      <div className="mt-2 ms-12">
        <Wrapper {...(wrapperProps as any)}>
          {post.title && !isComment && (
            <h3 className="text-xl font-bold text-indigo-400 mb-2">{post.title}</h3>
          )}

          <div
            className={`text-zinc-300 ${isComment ? 'text-[15px]' : 'text-base'} leading-relaxed prose dark:prose-invert max-w-none break-words`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Wrapper>

        {/* Actions */}
        <div className="flex items-center gap-1 mt-3 relative z-10">
          <LikeButton
            postId={post.id}
            initialLikes={likesCount}
            initialHasLiked={hasLiked}
            disabled={!currentUserId}
          />

          {!hideReplyButton && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition text-sm font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              Reply
            </button>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && authEmail && (rootPostId || chapterId) && (
          <div className="mt-3 relative z-10">
            <CommentForm parentId={post.id} rootPostId={rootPostId} chapterId={chapterId} authEmail={authEmail} />
          </div>
        )}

        {/* Children (Nested Comments) */}
        {children && (
          <div className="mt-3">
            {children}
          </div>
        )}
      </div>
      
      {/* Delete Button (absolute positioning) */}
      {(currentUserId === author.id || authEmail === 'doron2010sha@gmail.com') && (
        <div className="absolute top-2 end-2 sm:top-4 sm:end-4 z-20">
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this post?')) {
                const { deletePostAction } = await import('@/app/actions/community');
                try {
                  await deletePostAction(post.id);
                } catch (err: any) {
                  alert(err.message);
                }
              }
            }}
            className="text-zinc-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-zinc-800"
            title="Delete post"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
