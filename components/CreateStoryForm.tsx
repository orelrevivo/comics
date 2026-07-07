'use client';

import { createStoryMetaAction, saveChapterImageAction } from "@/app/actions/story";
import { useState, useRef } from "react";
import { Upload, BookPlus, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateStoryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0, phase: '' });
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ─── Phase 1: Create story + chapter (lightweight, no images) ───
      setProgress({ current: 0, total: images.length, phase: 'יוצר סיפור...' });
      const formData = new FormData(e.currentTarget);
      // Remove chapterImages from formData so the server action stays small
      formData.delete('chapterImages');

      const { storyId, chapterId } = await createStoryMetaAction(formData);

      // ─── Phase 2: Upload images ONE BY ONE ───
      const sortedImages = [...images].sort((a, b) => a.name.localeCompare(b.name));

      for (let i = 0; i < sortedImages.length; i++) {
        setProgress({ current: i + 1, total: sortedImages.length, phase: `מעלה תמונה ${i + 1} מתוך ${sortedImages.length}...` });

        const imgFormData = new FormData();
        imgFormData.append('file', sortedImages[i]);

        const res = await fetch('/api/upload', { method: 'POST', body: imgFormData });
        if (!res.ok) throw new Error(`Failed to upload image ${i + 1}`);
        const { url } = await res.json();

        await saveChapterImageAction(chapterId, url, i + 1);
      }

      // ─── Phase 3: Navigate to story ───
      setProgress({ current: sortedImages.length, total: sortedImages.length, phase: 'הסתיים! מעביר...' });
      router.push(`/story/${storyId}`);
    } catch (err: any) {
      alert(`שגיאה: ${err.message || 'משהו השתבש'}`);
      setIsSubmitting(false);
      setProgress({ current: 0, total: 0, phase: '' });
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-10 px-4">
      <div className="mb-8 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BookPlus className="h-8 w-8 text-indigo-600" />
          צור סיפור חדש
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          העלה מנגה או סיפור חדש, הגדר פרטים, והוסף את הפרק הראשון.
        </p>
      </div>

      {/* Progress Bar */}
      {isSubmitting && (
        <div className="mb-6 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 p-4 border border-indigo-200 dark:border-indigo-700">
          <div className="flex items-center gap-3 mb-2">
            {progress.current === progress.total && progress.total > 0 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
            )}
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{progress.phase}</span>
          </div>
          {progress.total > 0 && (
            <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          )}
          {progress.total > 0 && (
            <p className="text-xs text-indigo-500 mt-1 text-right">{progress.current} / {progress.total}</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <h2 className="text-xl font-semibold">פרטי הסיפור</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="col-span-full">
              <label className="block text-sm font-medium mb-1">כותרת</label>
              <input name="title" required className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium mb-1">תקציר</label>
              <textarea name="description" rows={4} className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">יוצר/ת</label>
              <input name="author" className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">תגיות (מופרדות בפסיק)</label>
              <input name="tags" placeholder="Action, Fantasy..." className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">סוג</label>
              <input name="type" placeholder="Manga, Manhwa..." className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">סטטוס</label>
              <select name="status" className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="Ongoing">רץ עכשיו (Ongoing)</option>
                <option value="Completed">הסתיים (Completed)</option>
                <option value="Hiatus">בהפסקה (Hiatus)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">שנת הוצאה</label>
              <input name="released" type="number" className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" name="adultContent" id="adult" className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600" />
              <label htmlFor="adult" className="text-sm font-medium">18+ תוכן למבוגרים</label>
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium mb-2">תמונת רקע (Banner)</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-300 border-dashed rounded-lg cursor-pointer bg-zinc-50 dark:hover:bg-zinc-800 dark:bg-zinc-900 hover:bg-zinc-100 dark:border-zinc-700">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-zinc-500 dark:text-zinc-400" />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400"><span className="font-semibold">לחץ להעלאת תמונה</span></p>
                  </div>
                  <input name="banner" type="file" accept="image/*" className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <h2 className="text-xl font-semibold">הפרק הראשון</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">מספר פרק</label>
              <input name="chapterNumber" type="number" required defaultValue="1" className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">כותרת הפרק (אופציונלי)</label>
              <input name="chapterTitle" className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium mb-2">תמונות הפרק (העלה תיקייה)</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-indigo-300 border-dashed rounded-lg cursor-pointer bg-indigo-50/50 dark:hover:bg-indigo-900/20 dark:bg-zinc-900 hover:bg-indigo-50 dark:border-zinc-700">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-indigo-500" />
                    <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400"><span className="font-semibold">לחץ לבחירת תיקייה</span></p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{images.length} קבצים נבחרו</p>
                  </div>
                  <input 
                    name="chapterImages" 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange} 
                    required 
                    {...{ webkitdirectory: "", directory: "" } as any}
                  />
                </label>
              </div>
              <p className="text-xs text-zinc-400 mt-2 text-center">התמונות מועלות אחת-אחת — גם תיקיות גדולות מאוד יעלו בהצלחה ✓</p>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full flex justify-center items-center gap-2 brutal-btn bg-indigo-600 px-8 py-4 text-lg font-bold text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> {progress.phase || 'מעבד...'}</>
          ) : (
            <><BookPlus className="h-5 w-5" /> פרסם סיפור</>
          )}
        </button>
      </form>
    </div>
  );
}
