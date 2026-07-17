"use client";

import { useState } from "react";
import Link from "next/link";

type StoryLite = {
    id: string;
    title: string;
    bannerImage: string | null;
};

interface HeroCarouselProps {
    stories: StoryLite[];
}

export function HeroCarousel({ stories }: HeroCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const n = stories.length;

    if (n === 0) return null;

    const goTo = (dir: 1 | -1) => {
        setActiveIndex((prev) => (prev + dir + n) % n);
    };

    // shortest circular distance from a card's index to the active one
    const getDiff = (idx: number) => {
        let diff = idx - activeIndex;
        diff = ((diff % n) + n) % n;
        if (diff > n / 2) diff -= n;
        return diff;
    };

    return (
        <section>
            <div className="flex items-center gap-2 space-x-reverse text-sm font-semibold text-zinc-500 mb-4 uppercase tracking-wider">
                <Link href="/" className="hover:text-zinc-300 transition-colors">ראשי</Link>
                <span>&gt;</span>
                <span className="text-zinc-100">מומלצים</span>
            </div>

            <div className="relative h-[250px] sm:h-[350px] md:h-[450px] overflow-hidden">
                {n > 1 && (
                    <>
                        <button
                            onClick={() => goTo(-1)}
                            aria-label="הקודם"
                            className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-zinc-900/70 border border-zinc-700 text-zinc-200 backdrop-blur-sm transition-all duration-300 hover:bg-zinc-800 hover:scale-110 hover:border-zinc-500"
                        >
                            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6">
                                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        <button
                            onClick={() => goTo(1)}
                            aria-label="הבא"
                            className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-zinc-900/70 border border-zinc-700 text-zinc-200 backdrop-blur-sm transition-all duration-300 hover:bg-zinc-800 hover:scale-110 hover:border-zinc-500"
                        >
                            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6">
                                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </>
                )}

                <div className="absolute inset-0 flex items-center justify-center">
                    {stories.map((fs, idx) => {
                        const diff = getDiff(idx);
                        const isCenter = diff === 0;

                        if (Math.abs(diff) > 2) return null; // don't bother rendering far-off cards

                        let transform = "";
                        let opacity = 1;
                        let zIndex = 10;
                        let pointerEvents: "auto" | "none" = "auto";

                        if (diff === 0) {
                            transform = "translateX(0) scale(1)";
                            zIndex = 20;
                        } else if (diff === -1) {
                            transform = "translateX(-78%) scale(0.78)";
                            opacity = 0.55;
                        } else if (diff === 1) {
                            transform = "translateX(78%) scale(0.78)";
                            opacity = 0.55;
                        } else if (diff === -2) {
                            transform = "translateX(-130%) scale(0.6)";
                            opacity = 0;
                            zIndex = 0;
                            pointerEvents = "none";
                        } else {
                            transform = "translateX(130%) scale(0.6)";
                            opacity = 0;
                            zIndex = 0;
                            pointerEvents = "none";
                        }

                        return (
                            <Link
                                key={fs.id}
                                href={`/story/${fs.id}`}
                                style={{ transform, opacity, zIndex, width: "58%", pointerEvents }}
                                className="group/card absolute h-full transition-all duration-500 ease-out"
                            >
                                {/* LED glow layer, appears on hover after a short delay */}
                                {fs.bannerImage && (
                                    <div
                                        className="pointer-events-none absolute -inset-x-6 -bottom-8 h-20 rounded-full opacity-0 scale-90 blur-2xl transition-all duration-700 delay-300 group-hover/card:opacity-80 group-hover/card:scale-105 -z-10"
                                        style={{
                                            backgroundImage: `url(${fs.bannerImage})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                        }}
                                    />
                                )}

                                <div className="relative h-full w-full overflow-hidden brutal-card bg-zinc-900">
                                    {fs.bannerImage ? (
                                        <img
                                            src={fs.bannerImage}
                                            alt={fs.title}
                                            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover/card:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-500">
                                            No Banner Image
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b26] via-[#1a1b26]/40 to-transparent opacity-90 transition-opacity group-hover/card:opacity-100" />

                                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 z-10 flex flex-col justify-end h-full">
                                        <h2 className={`font-black text-white drop-shadow-lg leading-tight ${isCenter ? "text-2xl sm:text-4xl lg:text-5xl line-clamp-2" : "text-lg sm:text-2xl line-clamp-1"}`}>
                                            {fs.title}
                                        </h2>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}