"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface LoadingScreenProps {
    message?: string;
    subMessage?: string;
}

export function LoadingScreen({
    message = "Preparing your dashboard...",
    subMessage = "Get ready for excellence..."
}: LoadingScreenProps) {
    return (
        <div className="min-h-screen fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--cream)] transition-colors duration-500 overflow-hidden">
            {/* Elegant Warm Gold Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[#C4A55A]/5 blur-[80px] md:blur-[100px] rounded-full animate-pulse pointer-events-none" />

            <div className="relative flex flex-col items-center space-y-6 md:space-y-8 text-center px-4 md:px-6 animate-in fade-in zoom-in-95 duration-700 w-full max-w-sm md:max-w-md">
                {/* Gold minimalist loader */}
                <div className="relative inline-flex items-center justify-center">
                    {/* Outer Ring */}
                    <div className="w-16 h-16 md:w-20 md:h-20 border-[2px] border-[#C4A55A]/10 border-t-[#C4A55A] rounded-full animate-spin" />
                    {/* Inner core decoration */}
                    <div className="absolute w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--cream)] border border-[var(--border)] flex items-center justify-center shadow-inner">
                        <Sparkles className="text-[#C4A55A] animate-pulse" size={16} />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-[var(--charcoal)] font-sans-body">
                        {message}
                    </h3>
                    <p className="text-[10px] md:text-[11px] font-medium italic text-[var(--charcoal)]/60 font-serif">
                        {subMessage}
                    </p>
                </div>
            </div>

            {/* Premium luxury footer decoration */}
            <div className="absolute bottom-8 md:bottom-12 left-6 md:left-12 right-6 md:right-12 flex justify-between items-center opacity-40 pointer-events-none">
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.25em] text-[var(--charcoal)]/40 font-sans-body">Evently Elite</span>
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.25em] text-[var(--charcoal)]/40 font-sans-body hidden sm:inline-block">Version 2.0.4</span>
            </div>
        </div>
    );
}
