'use client';
import { useEffect, useState } from 'react';
import { updateCoverColorAction, getBannerTemplatesAction } from '@/app/actions/auth';

export default function Cover({
    user,
    isOwner,
}: {
    user: {
        id: string;
        name: string | null;
        email: string;
        avatarUrl: string | null;
        coverColor: string | null;
        createdAt: Date | null;
        bio: string | null;
        isVerified?: boolean;
    };
    isOwner: boolean;
}) {
    const [coverColor, setCoverColor] = useState(user.coverColor || '#333333');
    const [isEditingCover, setIsEditingCover] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [templates, setTemplates] = useState<string[]>([]);

    useEffect(() => {
        if (isEditingCover && templates.length === 0) {
            getBannerTemplatesAction().then(setTemplates);
        }
    }, [isEditingCover, templates.length]);

    const displayName = user.name || user.email.split('@')[0];
    const handle = `@${user.id.slice(0, 12)}`; // Mock handle based on ID for visual
    const joinedDate = user.createdAt ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(user.createdAt) : 'Unknown';

    const handleSaveColor = async () => {
        setIsSaving(true);
        try {
            await updateCoverColorAction(user.id, coverColor);
            setIsEditingCover(false);
        } catch (error) {
            alert('שגיאה בעדכון צבע הרקע');
        } finally {
            setIsSaving(false);
        }
    };
    return (
        <div>
            {/* Cover Banner */}
            <div
                className="h-32 sm:h-48 w-full relative group transition-colors"
                style={coverColor.startsWith('/')
                    ? { backgroundImage: `url("${coverColor}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { backgroundColor: coverColor }}
            >
                {isOwner && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                        {!isEditingCover && (
                            <button
                                onClick={() => setIsEditingCover(true)}
                                className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm hover:bg-black/80 transition-colors"
                            >
                                Change Cover Color
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Color Picker Overlay */}
            {isEditingCover && (
                <div className="absolute top-4 right-4 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-20 animate-in fade-in zoom-in duration-200">
                    <h3 className="text-sm font-bold mb-3 text-zinc-900 dark:text-zinc-100">Choose Cover Color</h3>
                    <div className="flex flex-wrap gap-2 mb-4 w-48">
                        {['#333333', '#1D9BF0', '#F91880', '#00BA7C', '#FF7A00', '#7856FF', '#111111', '#0B1416'].map(color => (
                            <button
                                key={color}
                                onClick={() => setCoverColor(color)}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${coverColor === color ? 'border-zinc-400 ring-2 ring-indigo-500 scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                        <input
                            type="color"
                            value={coverColor.startsWith('#') ? coverColor : '#333333'}
                            onChange={(e) => setCoverColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-xs text-zinc-500 font-mono uppercase">{coverColor.startsWith('#') ? coverColor : 'Custom Color'}</span>
                    </div>

                    {templates.length > 0 && (
                        <>
                            <h3 className="text-sm font-bold mb-3 text-zinc-900 dark:text-zinc-100">Browse Templates</h3>
                            <div className="grid grid-cols-2 gap-3 mb-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                                {templates.map(template => (
                                    <button
                                        key={template}
                                        onClick={() => setCoverColor(template)}
                                        className={`w-full h-20 rounded-md border-2 transition-transform hover:scale-105 bg-cover bg-center shadow-sm ${coverColor === template ? 'border-white ring-2 ring-indigo-500 scale-105' : 'border-transparent'}`}
                                        style={{ backgroundImage: `url("${template}")` }}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                    <div className="flex gap-2 justify-end border-t border-zinc-200 dark:border-zinc-800 pt-3">
                        <button
                            onClick={() => {
                                setCoverColor(user.coverColor || '#333333');
                                setIsEditingCover(false);
                            }}
                            className="text-sm px-3 py-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveColor}
                            disabled={isSaving}
                            className="text-sm px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-full font-bold transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}