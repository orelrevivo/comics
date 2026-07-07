'use client';

import { editStoryAction } from "@/app/actions/story";
import { useState } from "react";
import { Upload, Save, Loader2 } from "lucide-react";

interface EditStoryFormProps {
  storyId: string;
  initialData: any;
}

export function EditStoryForm({ storyId, initialData }: EditStoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="container mx-auto max-w-3xl py-10 px-4">
      <div className="mb-8 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Save className="h-8 w-8 text-indigo-600" />
          ערוך סיפור
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          ערוך פרטים עבור {initialData.title}
        </p>
      </div>

      <form 
        action={async (formData) => {
          setIsSubmitting(true);
          try {
            await editStoryAction(storyId, formData);
          } finally {
            setIsSubmitting(false);
          }
        }} 
        className="space-y-8"
      >
        <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <h2 className="text-xl font-semibold">פרטי הסיפור</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="col-span-full">
              <label className="block text-sm font-medium mb-1">כותרת</label>
              <input name="title" defaultValue={initialData.title || ''} required className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium mb-1">תקציר</label>
              <textarea name="description" defaultValue={initialData.description || ''} rows={4} className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">יוצר/ת</label>
              <input name="author" defaultValue={initialData.author || ''} className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">תגיות (מופרדות בפסיק)</label>
              <input name="tags" defaultValue={initialData.tags || ''} placeholder="Action, Fantasy..." className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">סוג</label>
              <input name="type" defaultValue={initialData.type || ''} placeholder="Manga, Manhwa..." className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">סטטוס</label>
              <select name="status" defaultValue={initialData.status || 'Ongoing'} className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="Ongoing">רץ עכשיו (Ongoing)</option>
                <option value="Completed">הסתיים (Completed)</option>
                <option value="Hiatus">בהפסקה (Hiatus)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">שנת הוצאה</label>
              <input name="released" defaultValue={initialData.released || ''} type="number" className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">תרגום רשמי</label>
              <input name="officialTranslation" defaultValue={initialData.officialTranslation || ''} className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">אנימה</label>
              <input name="animeAdaptation" defaultValue={initialData.animeAdaptation || ''} className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">RSS</label>
              <input name="rss" defaultValue={initialData.rss || ''} className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Track</label>
              <input name="track" defaultValue={initialData.track || ''} className="w-full rounded-lg border border-zinc-300 p-2.5 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" name="adultContent" id="adult" defaultChecked={!!initialData.adultContent} className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600" />
              <label htmlFor="adult" className="text-sm font-medium">18+ תוכן למבוגרים</label>
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium mb-2">תמונת רקע (Banner) - אופציונלי (בחר רק אם רוצה להחליף)</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-300 border-dashed rounded-lg cursor-pointer bg-zinc-50 dark:hover:bg-zinc-800 dark:bg-zinc-900 hover:bg-zinc-100 dark:border-zinc-700">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-zinc-500 dark:text-zinc-400" />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400"><span className="font-semibold">לחץ להעלאת תמונה חדשה (אופציונלי)</span></p>
                  </div>
                  <input name="banner" type="file" accept="image/*" className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full flex justify-center items-center gap-2 brutal-btn bg-indigo-600 px-8 py-4 text-lg font-bold text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> שומר שינויים...</>
          ) : (
            <><Save className="h-5 w-5" /> שמור שינויים</>
          )}
        </button>
      </form>
    </div>
  );
}
