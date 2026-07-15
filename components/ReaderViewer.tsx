'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Settings, X, ArrowUp } from 'lucide-react';

type ReaderSettings = {
  simpleTopNav: boolean;
  stickyTopNav: boolean;
  imageGap: boolean;
  backToTop: boolean;
  darkBackground: boolean;
  readingDirection: 'ltr' | 'rtl';
  readingStyle: 'long_strip' | 'single_page' | 'double_page' | 'double_manga_plus';
  imageFit: 'fit_width' | 'fit_height';
};

const defaultSettings: ReaderSettings = {
  simpleTopNav: false,
  stickyTopNav: true,
  imageGap: false,
  backToTop: true,
  darkBackground: true,
  readingDirection: 'rtl',
  readingStyle: 'long_strip',
  imageFit: 'fit_width',
};

const ReaderImage = ({ img, settings }: { img: any, settings: ReaderSettings }) => {
  const [dims, setDims] = useState({ w: 0, h: 0 });

  if (!img.isWide) {
    return (
      <img
        src={img.imageUrl}
        alt={`Page`}
        className={`${settings.imageFit === 'fit_width' ? 'w-full max-w-4xl object-contain' : 'h-[90vh] object-contain'} select-none`}
        loading="lazy"
      />
    );
  }

  return (
    <div 
      className={`relative flex items-center justify-center ${settings.imageFit === 'fit_width' ? 'w-full max-w-4xl' : 'h-[90vh]'}`}
      style={{ 
        aspectRatio: dims.h > 0 ? `${dims.h} / ${dims.w}` : '1 / 1',
        containerType: 'inline-size' 
      }}
    >
      <img
        src={img.imageUrl}
        alt="Page"
        onLoad={(e) => setDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
        className="absolute -rotate-90 origin-center"
        style={{ height: '100cqw', width: 'auto', maxWidth: 'none' }}
        loading="lazy"
      />
    </div>
  );
};

export default function ReaderViewer({
  story,
  chapter,
  chapterImages,
  prevChapter,
  nextChapter,
}: any) {
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('reader_settings');
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('reader_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const updateSetting = <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination Logic for single/double modes
  const handleNextPage = () => {
    const step = settings.readingStyle.startsWith('double') ? 2 : 1;
    if (currentPageIndex + step < chapterImages.length) {
      setCurrentPageIndex((prev) => prev + step);
    } else if (nextChapter) {
      window.location.href = `/story/${story.id}/chapter/${nextChapter.id}`;
    }
  };

  const handlePrevPage = () => {
    const step = settings.readingStyle.startsWith('double') ? 2 : 1;
    if (currentPageIndex - step >= 0) {
      setCurrentPageIndex((prev) => prev - step);
    } else if (prevChapter) {
      window.location.href = `/story/${story.id}/chapter/${prevChapter.id}`;
    }
  };

  const handleAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (settings.readingStyle === 'long_strip') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (settings.readingDirection === 'ltr') {
      if (x > width / 2) handleNextPage();
      else handlePrevPage();
    } else {
      if (x < width / 2) handleNextPage();
      else handlePrevPage();
    }
  };

  // Determine images to render based on mode
  const getRenderedImages = () => {
    if (settings.readingStyle === 'long_strip') {
      return chapterImages;
    }

    if (settings.readingStyle === 'single_page') {
      return [chapterImages[currentPageIndex]].filter(Boolean);
    }

    if (settings.readingStyle === 'double_page') {
      const isRtl = settings.readingDirection === 'rtl';
      let img1 = chapterImages[currentPageIndex];
      let img2 = chapterImages[currentPageIndex + 1];

      // Right-to-left double page reverses visual order
      return isRtl ? [img2, img1].filter(Boolean) : [img1, img2].filter(Boolean);
    }

    if (settings.readingStyle === 'double_manga_plus') {
      const isRtl = settings.readingDirection === 'rtl';
      // First page is always single, then double
      if (currentPageIndex === 0) return [chapterImages[0]].filter(Boolean);

      let img1 = chapterImages[currentPageIndex];
      let img2 = chapterImages[currentPageIndex + 1];
      return isRtl ? [img2, img1].filter(Boolean) : [img1, img2].filter(Boolean);
    }

    return [];
  };

  const renderedImages = getRenderedImages();

  // Theme styles
  const bgClass = settings.darkBackground ? 'bg-zinc-950 text-zinc-50' : 'bg-zinc-100 text-zinc-900';
  const navBgClass = settings.darkBackground ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white/90 border-zinc-300';
  const btnBgClass = settings.darkBackground ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-200 hover:bg-zinc-300';
  const linkTextClass = settings.darkBackground ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black';

  return (
    <div className={`min-h-screen pb-20 ${bgClass} transition-colors duration-200`}>
      {/* Top Navigation Bar */}
      <div className={`${settings.stickyTopNav ? 'sticky top-0' : ''} z-40 w-full border-b backdrop-blur-md ${navBgClass}`}>
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href={`/story/${story.id}`} className={`flex items-center gap-2 transition-colors ${linkTextClass}`}>
              <ArrowLeft className="h-5 w-5" />
              {!settings.simpleTopNav && <span className="font-medium hidden sm:inline">{story.title}</span>}
            </Link>

            <div className="font-semibold">
              פרק {chapter.chapterNumber} {!settings.simpleTopNav && chapter.title && <span className="font-normal opacity-70 ml-2 hidden sm:inline">- {chapter.title}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsSettingsOpen(true)} className={`brutal-btn p-2 ${btnBgClass}`}>
              <Settings className="h-5 w-5" />
            </button>

            {prevChapter ? (
              <Link href={`/story/${story.id}/chapter/${prevChapter.id}`} className={`brutal-btn p-2 ${btnBgClass}`}>
                <ChevronLeft className="h-5 w-5" />
              </Link>
            ) : <div className="p-2 opacity-30"><ChevronLeft className="h-5 w-5" /></div>}

            {nextChapter ? (
              <Link href={`/story/${story.id}/chapter/${nextChapter.id}`} className={`brutal-btn p-2 ${btnBgClass}`}>
                <ChevronRight className="h-5 w-5" />
              </Link>
            ) : <div className="p-2 opacity-30"><ChevronRight className="h-5 w-5" /></div>}
          </div>
        </div>
      </div>

      {/* Reader Viewer */}
      <div
        className={`w-full mx-auto flex flex-col items-center mt-4 ${settings.readingStyle === 'long_strip' ? '' : 'min-h-[80vh] justify-center cursor-pointer select-none'}`}
        onClick={handleAreaClick}
      >
        {chapterImages.length === 0 ? (
          <div className="py-20 text-center opacity-50">לא הועלו תמונות לפרק זה.</div>
        ) : (
          <div
            className={`flex ${settings.readingStyle === 'long_strip' ? 'flex-col items-center' : 'justify-center items-center'} ${settings.imageGap ? 'gap-y-4 gap-x-2' : ''} w-full`}
          >
            {renderedImages.map((img: any, idx: any) => (
              <ReaderImage key={img.id || idx} img={img} settings={settings} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className={`max-w-4xl mx-auto flex justify-between items-center p-6 mt-10 border-t ${settings.darkBackground ? 'border-zinc-800' : 'border-zinc-300'}`}>
        {prevChapter ? (
          <Link href={`/story/${story.id}/chapter/${prevChapter.id}`} className={`brutal-btn flex items-center gap-2 px-6 py-3 font-medium ${btnBgClass}`}>
            <ChevronLeft className="h-5 w-5" /> הקודם
          </Link>
        ) : <div />}

        {nextChapter ? (
          <Link href={`/story/${story.id}/chapter/${nextChapter.id}`} className="brutal-btn flex items-center gap-2 px-6 py-3 bg-indigo-600 font-medium text-white">
            הבא <ChevronRight className="h-5 w-5" />
          </Link>
        ) : (
          <Link href={`/story/${story.id}`} className={`brutal-btn flex items-center gap-2 px-6 py-3 font-medium ${btnBgClass}`}>
            חזור לסיפור
          </Link>
        )}
      </div>

      {/* Back to top button */}
      {settings.backToTop && showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-500 transition-all z-40"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}>
          <div
            className={`w-full max-w-sm h-full overflow-y-auto p-6 brutal-card ${settings.darkBackground ? 'bg-zinc-900 text-zinc-50 border-l border-zinc-800' : 'bg-white text-zinc-900'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-2"><Settings className="h-5 w-5" /> הגדרות קריאה</h2>
              <button onClick={() => setIsSettingsOpen(false)} className={`p-2 rounded-lg ${btnBgClass}`}><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-6">
              {/* Toggles */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase opacity-50 tracking-wider">העדפות</h3>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>רקע כהה</span>
                  <input type="checkbox" checked={settings.darkBackground} onChange={(e) => updateSetting('darkBackground', e.target.checked)} className="rounded text-indigo-600 h-5 w-5" />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>ניווט עליון פשוט</span>
                  <input type="checkbox" checked={settings.simpleTopNav} onChange={(e) => updateSetting('simpleTopNav', e.target.checked)} className="rounded text-indigo-600 h-5 w-5" />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>ניווט עליון דביק</span>
                  <input type="checkbox" checked={settings.stickyTopNav} onChange={(e) => updateSetting('stickyTopNav', e.target.checked)} className="rounded text-indigo-600 h-5 w-5" />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>רווח בין תמונות</span>
                  <input type="checkbox" checked={settings.imageGap} onChange={(e) => updateSetting('imageGap', e.target.checked)} className="rounded text-indigo-600 h-5 w-5" />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>כפתור חזרה למעלה</span>
                  <input type="checkbox" checked={settings.backToTop} onChange={(e) => updateSetting('backToTop', e.target.checked)} className="rounded text-indigo-600 h-5 w-5" />
                </label>
              </div>

              {/* Selects */}
              <div className="space-y-4 pt-4 border-t border-zinc-500/20">
                <h3 className="font-semibold text-sm uppercase opacity-50 tracking-wider">תצוגה</h3>

                <div>
                  <label className="block text-sm mb-1">כיוון קריאה</label>
                  <select
                    value={settings.readingDirection}
                    onChange={(e) => updateSetting('readingDirection', e.target.value as any)}
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none ${settings.darkBackground ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-300'}`}
                  >
                    <option value="ltr">שמאל לימין</option>
                    <option value="rtl">ימין לשמאל</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">סגנון קריאה</label>
                  <select
                    value={settings.readingStyle}
                    onChange={(e) => updateSetting('readingStyle', e.target.value as any)}
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none ${settings.darkBackground ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-300'}`}
                  >
                    <option value="long_strip">גלילה (Long Strip)</option>
                    <option value="single_page">עמוד יחיד</option>
                    <option value="double_page">עמוד כפול</option>
                    <option value="double_manga_plus">עמוד כפול (MangaPlus)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">התאמת תמונה</label>
                  <select
                    value={settings.imageFit}
                    onChange={(e) => updateSetting('imageFit', e.target.value as any)}
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none ${settings.darkBackground ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-300'}`}
                  >
                    <option value="fit_width">התאם לרוחב</option>
                    <option value="fit_height">התאם לגובה</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
