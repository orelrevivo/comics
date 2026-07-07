'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { togglePostLikeAction } from '@/app/actions/community';
import { motion } from 'framer-motion';

export default function LikeButton({ 
  postId, 
  initialLikes, 
  initialHasLiked, 
  disabled 
}: { 
  postId: string, 
  initialLikes: number, 
  initialHasLiked: boolean,
  disabled?: boolean
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [isPending, startTransition] = useTransition();

  const handleLike = () => {
    if (disabled) return;
    
    // Optimistic update
    setHasLiked(!hasLiked);
    setLikes(hasLiked ? likes - 1 : likes + 1);

    startTransition(async () => {
      try {
        await togglePostLikeAction(postId);
      } catch (err) {
        // Revert on error
        setHasLiked(hasLiked);
        setLikes(likes);
      }
    });
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleLike();
      }}
      disabled={disabled || isPending}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition ${hasLiked ? 'text-red-500 bg-red-50 dark:bg-red-950/30 hover:bg-red-100' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
    >
      <motion.div animate={{ scale: hasLiked ? [1, 1.3, 1] : 1 }}>
        <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
      </motion.div>
      <span className="text-sm font-medium">{likes > 0 ? likes : ''}</span>
    </motion.button>
  );
}
