"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function AnimatedBackground() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none select-none transition-opacity duration-1000">
            {/* Very subtle blobs */}
            <div className={`absolute top-[10%] left-[15%] w-[30rem] h-[30rem] blur-[120px] rounded-full animate-float transition-colors duration-1000 ${theme === 'dark' ? 'bg-blue-500/5' : 'bg-blue-200/10'
                }`} />
            <div className={`absolute bottom-[10%] right-[10%] w-[35rem] h-[35rem] blur-[120px] rounded-full animate-float transition-colors duration-1000 ${theme === 'dark' ? 'bg-purple-500/5' : 'bg-purple-200/10'
                }`} style={{ animationDelay: "-4s" }} />

            {/* Subtle glass orbs */}
            <div className={`absolute top-[20%] right-[20%] w-64 h-64 rounded-full border border-white/5 backdrop-blur-3xl animate-float transition-all duration-1000 ${theme === 'dark' ? 'bg-white/[0.02] opacity-30' : 'bg-blue-500/[0.02] opacity-10'
                }`} style={{ animationDelay: "-2s" }} />
            <div className={`absolute bottom-[30%] left-[15%] w-48 h-48 rounded-full border border-white/5 backdrop-blur-2xl animate-float transition-all duration-1000 ${theme === 'dark' ? 'bg-white/[0.01] opacity-20' : 'bg-purple-500/[0.01] opacity-10'
                }`} style={{ animationDelay: "-6s" }} />
        </div>
    );
}
