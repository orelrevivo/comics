'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';

// Use a free public test key if no env var is provided, but it's rate-limited
const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'GlVGYHqc3SyXXKbqdO3713h2N2jD4V7Q';

interface GiphySearchProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

export function GiphySearch({ onSelect, onClose }: GiphySearchProps) {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`);
        const data = await res.json();
        if (data.data) {
          setGifs(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch trending GIFs', err);
      }
      setLoading(false);
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    if (!query.trim()) return;

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&rating=g`);
        const data = await res.json();
        if (data.data) {
          setGifs(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch GIFs', err);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-[#0B1416] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
        
        {/* Header & Search */}
        <div className="p-4 border-b border-zinc-800 bg-[#0B1416] z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-zinc-100">Select a GIF</h3>
            <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search GIPHY..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 pe-10 transition-colors"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        
        {/* Results */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 gap-3 hide-scrollbar bg-zinc-950">
        {loading && gifs.length === 0 ? (
          <div className="col-span-2 flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
          </div>
        ) : (
          gifs.map((gif) => (
            <button
              key={gif.id}
              type="button"
              onClick={() => {
                onSelect(gif.images.fixed_height.url);
                onClose();
              }}
              className="relative aspect-video rounded-md overflow-hidden bg-zinc-800 hover:ring-2 hover:ring-indigo-500 transition focus:outline-none"
            >
              <img 
                src={gif.images.fixed_height_small.url} 
                alt={gif.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </button>
          ))
        )}
      </div>
      </div>
    </div>
  );
}
