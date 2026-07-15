'use client';

import { deleteChapterAction } from "@/app/actions/story";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export function DeleteChapterButton({ chapterId, storyId }: { chapterId: string, storyId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <button
      type="button"
      disabled={isDeleting}
      className="brutal-btn bg-red-500 hover:bg-red-600 text-white p-2 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
      onClick={async () => {
        if (!confirm('האם אתה בטוח שברצונך למחוק את הפרק הזה?')) {
          return;
        }
        
        setIsDeleting(true);
        try {
          await deleteChapterAction(chapterId, storyId);
        } catch (error) {
          alert('שגיאה במחיקת הפרק');
          setIsDeleting(false);
        }
      }}
    >
      {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
    </button>
  );
}
