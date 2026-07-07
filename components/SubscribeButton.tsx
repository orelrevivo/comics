'use client';

import { useState } from 'react';
import { toggleStorySubscriptionAction } from '@/app/actions/story';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubscribeButtonProps {
  storyId: string;
  initialIsSubscribed: boolean;
}

export function SubscribeButton({ storyId, initialIsSubscribed }: SubscribeButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await toggleStorySubscriptionAction(storyId);
      setIsSubscribed(!isSubscribed);
    } catch (error) {
      console.error(error);
      alert('You must be logged in to subscribe.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleToggle}
      disabled={isLoading}
      className={`brutal-btn flex items-center gap-2 px-4 py-2 font-bold transition-all ${
        isSubscribed 
          ? 'bg-red-100 text-red-600 dark:bg-red-900/30' 
          : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
      } disabled:opacity-50`}
    >
      <motion.div animate={{ scale: isSubscribed ? [1, 1.2, 1] : 1 }}>
        <Heart className={`w-5 h-5 ${isSubscribed ? 'fill-current text-red-600' : ''}`} />
      </motion.div>
      {isSubscribed ? 'Subscribed' : 'Subscribe'}
    </motion.button>
  );
}
