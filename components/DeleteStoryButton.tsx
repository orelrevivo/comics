'use client';

import { deleteStoryAction } from "@/app/actions/story";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export function DeleteStoryButton({ storyId, storyTitle }: { storyId: string, storyTitle: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <button
      type="button"
      disabled={isDeleting}
      className="brutal-btn bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 flex items-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
      onClick={async () => {
        if (!confirm(`האם אתה בטוח שברצונך למחוק את "${storyTitle}"? פעולה זו בלתי הפיכה!`)) {
          return;
        }
        
        setIsDeleting(true);
        try {
          await deleteStoryAction(storyId);
        } catch (error) {
          alert('שגיאה במחיקת הסיפור');
          setIsDeleting(false);
        }
      }}
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      {isDeleting ? 'מוחק...' : 'מחק סיפור'}
    </button>
  );
}
