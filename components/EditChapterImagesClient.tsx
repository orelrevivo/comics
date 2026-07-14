'use client';

import { useState } from 'react';
import { saveChapterImageAction, deleteChapterImageAction } from '@/app/actions/story';
import { Trash2, Upload, Loader2, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ImageItem {
  id: string;
  url: string;
  order: number;
}

export default function EditChapterImagesClient({
  storyId,
  chapterId,
  initialImages
}: {
  storyId: string;
  chapterId: string;
  initialImages: ImageItem[];
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, phase: '' });
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    const filesArray = Array.from(selectedFiles);
    
    // Find the starting order index
    const startOrder = initialImages.length > 0 
      ? Math.max(...initialImages.map(img => img.order)) + 1 
      : 1;

    try {
      for (let i = 0; i < filesArray.length; i++) {
        setProgress({ current: i + 1, total: filesArray.length, phase: `מעלה תמונה ${i + 1} מתוך ${filesArray.length}...` });

        const imgFormData = new FormData();
        imgFormData.append('file', filesArray[i]);
        imgFormData.append('chapterId', chapterId);
        imgFormData.append('order', String(startOrder + i));

        const res = await fetch('/api/upload', { method: 'POST', body: imgFormData });
        if (!res.ok) throw new Error(`Failed to upload image ${i + 1}`);
      }

      setProgress({ current: filesArray.length, total: filesArray.length, phase: 'ההעלאה הושלמה!' });
      setSelectedFiles(null);
      (document.getElementById('file-upload') as HTMLInputElement).value = '';
      router.refresh();
    } catch (error) {
      alert('שגיאה בהעלאת תמונות. נסה לבחור קבצים קטנים יותר או פחות קבצים בכל פעם.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress({ current: 0, total: 0, phase: '' }), 2000);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק תמונה זו?')) return;
    try {
      await deleteChapterImageAction(imageId, chapterId, storyId);
    } catch (error) {
      alert('שגיאה במחיקת תמונה');
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <div className="brutal-card bg-zinc-50 dark:bg-zinc-900 p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Upload className="w-5 h-5" /> העלה תמונות חדשות</h2>
        
        {isUploading && progress.total > 0 && (
          <div className="mb-6 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 p-4 border border-indigo-200 dark:border-indigo-700">
            <div className="flex items-center gap-3 mb-2">
              {progress.current === progress.total ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
              )}
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{progress.phase}</span>
            </div>
            <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <input 
            type="file" 
            id="file-upload"
            multiple 
            accept="image/*" 
            onChange={(e) => setSelectedFiles(e.target.files)}
            className="block w-full text-sm text-zinc-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-none file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-500 file:text-white
              hover:file:bg-indigo-600
              cursor-pointer brutal-input bg-white dark:bg-zinc-800 p-1"
          />
          <button 
            type="submit" 
            disabled={!selectedFiles || selectedFiles.length === 0 || isUploading}
            className="brutal-btn bg-indigo-600 text-white font-bold px-6 py-2 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'העלה תמונות'}
          </button>
        </form>
        <p className="text-xs text-zinc-500 mt-2">התמונות מועלות אחת-אחת (Progress Bar) כדי לא לחסום את השרת, ניתן לבחור עשרות תמונות בבת אחת!</p>
      </div>

      {/* Image Grid */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5" /> תמונות קיימות ({initialImages.length})</h2>
        
        {initialImages.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 brutal-card bg-zinc-50 dark:bg-zinc-800/50">
            אין תמונות בפרק זה
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {initialImages.map((img, index) => (
              <div key={img.id} className="brutal-card relative group bg-white dark:bg-zinc-800 p-2">
                <div className="absolute top-0 right-0 bg-black/70 text-white px-2 py-1 text-xs font-bold z-10 m-2">
                  עמוד {index + 1}
                </div>
                <button 
                  onClick={() => handleDelete(img.id)}
                  className="absolute top-0 left-0 bg-red-500 text-white p-2 z-10 m-2 opacity-0 group-hover:opacity-100 transition-opacity brutal-btn"
                  title="מחק תמונה"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="aspect-[2/3] w-full relative overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  <img 
                    src={img.url} 
                    alt={`Page ${index + 1}`} 
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
