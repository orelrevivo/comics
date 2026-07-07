'use client';

import { useState } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { createCommentAction } from '@/app/actions/community';
import { GiphySearch } from './GiphySearch';

export function CommentForm({ parentId, rootPostId, chapterId, authEmail }: { parentId?: string; rootPostId?: string; chapterId?: string; authEmail: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showGiphy, setShowGiphy] = useState(false);

  if (!authEmail) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setAttachedImages(prev => [...prev, data.url]);
      }
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form action={createCommentAction} className="mt-3">
      <input type="hidden" name="parentId" value={parentId} />
      {rootPostId && <input type="hidden" name="rootPostId" value={rootPostId} />}
      {chapterId && <input type="hidden" name="chapterId" value={chapterId} />}
      {/* Combine text content with attached image HTML on submit */}
      <input
        type="hidden"
        name="content"
        value={content + attachedImages.map(url => `<br/><img src="${url}" style="max-width: 100%; border-radius: 8px;" />`).join('')}
      />

      <div className={`brutal-input transition-all duration-200 bg-white dark:bg-[#0B1416] overflow-hidden ${isExpanded ? 'pb-2' : ''}`}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onClick={() => setIsExpanded(true)}
          placeholder="Join the conversation"
          rows={isExpanded ? 3 : 1}
          required={attachedImages.length === 0} // Only require text if no images are attached
          className="w-full bg-transparent px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none"
        />

        {/* Render attached image previews */}
        {attachedImages.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-2">
            {attachedImages.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="attached" className="h-24 w-auto object-cover rounded-lg border border-zinc-700" />
                <button
                  type="button"
                  onClick={() => setAttachedImages(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-2 -right-2 bg-zinc-800 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-zinc-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {isExpanded && (
          <div className="flex items-center justify-between px-3 mt-1 relative">
            {showGiphy && (
              <GiphySearch
                onSelect={(url) => setAttachedImages(prev => [...prev, url])}
                onClose={() => setShowGiphy(false)}
              />
            )}

            <div className="flex items-center gap-2 text-zinc-400">
              <label className="p-1.5 hover:bg-zinc-800 rounded-full cursor-pointer transition">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                <ImageIcon className="w-5 h-5" />
              </label>
              <button
                type="button"
                onClick={() => setShowGiphy(!showGiphy)}
                className={`font-bold text-xs px-1.5 py-1 rounded-full transition ${showGiphy ? 'bg-zinc-700 text-white' : 'hover:bg-zinc-800'}`}
              >
                GIF
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setContent('');
                  setAttachedImages([]);
                }}
                className="px-4 py-1.5 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || (content.trim() === '' && attachedImages.length === 0)}
                className="px-4 py-1.5 text-sm font-bold brutal-btn bg-[#145C32] text-white disabled:opacity-50"
              >
                Comment
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
