'use client';

import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { updateChapterTitleAction } from '@/app/actions/story';

export function EditChapterTitle({ chapterId, storyId, initialTitle }: { chapterId: string, storyId: string, initialTitle: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateChapterTitleAction(chapterId, storyId, title);
      setIsEditing(false);
    } catch (error: any) {
      alert(error.message || 'Failed to update title');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="brutal-input px-2 py-1 text-sm font-bold"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setTitle(initialTitle);
              setIsEditing(false);
            }
          }}
        />
        <button onClick={handleSave} disabled={isSaving} className="text-green-500 hover:text-green-600">
          <Check className="w-5 h-5" />
        </button>
        <button onClick={() => { setTitle(initialTitle); setIsEditing(false); }} disabled={isSaving} className="text-red-500 hover:text-red-600">
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <p className="font-bold text-lg">{title || `פרק ${chapterId}`}</p>
      <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-indigo-500 transition-opacity">
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  );
}
