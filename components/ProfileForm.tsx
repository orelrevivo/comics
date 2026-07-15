'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ProfileForm({ user }: { user: any }) {
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [showRepliesTab, setShowRepliesTab] = useState(user.showRepliesTab ?? true);
  const [isPrivate, setIsPrivate] = useState(user.isPrivate ?? false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
        setAvatarUrl(data.url);
      }
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      formData.append('avatarUrl', avatarUrl);
      formData.append('showRepliesTab', showRepliesTab.toString());
      formData.append('isPrivate', isPrivate.toString());

      const res = await fetch('/api/profile', { method: 'POST', body: formData });
      if (res.ok) {
        alert('הפרופיל עודכן בהצלחה!');
      }
    } catch (error) {
      console.error('Save failed', error);
      alert('שגיאה בשמירת הפרופיל');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col items-center sm:items-start gap-4">
        <div className="relative group w-32 h-32 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 shadow-lg">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-zinc-400">
              {name ? name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
            <span className="text-white text-sm font-bold">החלף תמונה</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
          </label>
        </div>
        {isUploading && <span className="text-sm text-indigo-500 font-bold animate-pulse">מעלה תמונה...</span>}
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">שם תצוגה</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full brutal-input bg-transparent p-3 text-zinc-900 dark:text-zinc-100"
            placeholder="איך יקראו לך?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">אודות (Bio)</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full brutal-input bg-transparent p-3 text-zinc-900 dark:text-zinc-100 resize-none"
            placeholder="ספר קצת על עצמך..."
          />
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">הגדרות משתמש</h3>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showRepliesTab}
            onChange={(e) => setShowRepliesTab(e.target.checked)}
            className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-600 dark:bg-zinc-800"
          />
          <div>
            <div className="font-medium text-zinc-900 dark:text-zinc-100">הצג לשונית תגובות (Replies)</div>
            <div className="text-sm text-zinc-500">אפשר למשתמשים לראות את התגובות שלך בפרופיל.</div>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-600 dark:bg-zinc-800"
          />
          <div>
            <div className="font-medium text-zinc-900 dark:text-zinc-100">פרופיל פרטי</div>
            <div className="text-sm text-zinc-500">רק אתה תוכל לראות את הפוסטים והתגובות שלך.</div>
          </div>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full sm:w-auto brutal-btn bg-indigo-600 text-white px-8 py-3 font-bold disabled:opacity-50"
      >
        {isSaving ? 'שומר...' : 'שמור שינויים'}
      </button>
      <Link href={`/profile/${user.id}`} className="text-center text-blue-600 dark:text-blue-400 hover:underline">
        Go to your public profile
      </Link>
    </form>
  );
}
