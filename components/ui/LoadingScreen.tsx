"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface LoadingScreenProps {
    message?: string;
    subMessage?: string;
}

export function LoadingScreen({
    message = "Preparing your dashboard...",
    subMessage = "Get ready for excellence!!"
}: LoadingScreenProps) {
    return (
        <div className="min-h-screen fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-colors duration-500 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />

            <div className="relative space-y-8 text-center animate-in fade-in zoom-in duration-700">
                <div className="relative inline-block">
                    <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-2xl shadow-blue-500/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="text-blue-500 animate-pulse" size={32} />
                    </div>
                </div>
            </div>

            {/* Premium decoration */}
            <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center opacity-20 hidden md:flex">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Evently Elite</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Version 2.0.4</span>
            </div>
        </div>
    );
}
