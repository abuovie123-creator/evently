"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function AnimatedBackground() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none select-none transition-opacity duration-1000">
            {/* Subtle blobs */}
            <div className={`absolute top-[10%] left-[15%] w-[30rem] h-[30rem] blur-[120px] rounded-full animate-float transition-colors duration-1000 ${resolvedTheme === 'dark' ? 'bg-blue-500/5' : 'bg-blue-300/20 mix-blend-multiply'
                }`} />
            <div className={`absolute bottom-[10%] right-[10%] w-[35rem] h-[35rem] blur-[120px] rounded-full animate-float transition-colors duration-1000 ${resolvedTheme === 'dark' ? 'bg-purple-500/5' : 'bg-purple-300/20 mix-blend-multiply'
                }`} style={{ animationDelay: "-4s" }} />

            {/* Subtle glass orbs */}
            <div className={`absolute top-[20%] right-[20%] w-64 h-64 rounded-full border border-white/5 backdrop-blur-3xl animate-float transition-all duration-1000 ${resolvedTheme === 'dark' ? 'bg-gradient-to-tr from-white/[0.02] to-transparent opacity-30 shadow-[0_0_40px_rgba(255,255,255,0.02)]' : 'bg-gradient-to-tr from-blue-400/[0.05] to-transparent opacity-40 shadow-[0_0_40px_rgba(59,130,246,0.05)]'
                }`} style={{ animationDelay: "-2s" }} />
            <div className={`absolute bottom-[30%] left-[15%] w-48 h-48 rounded-full border border-white/5 backdrop-blur-2xl animate-float transition-all duration-1000 ${resolvedTheme === 'dark' ? 'bg-gradient-to-tr from-white/[0.01] to-transparent opacity-20' : 'bg-gradient-to-tr from-purple-400/[0.05] to-transparent opacity-30 shadow-[0_0_40px_rgba(168,85,247,0.05)]'
                }`} style={{ animationDelay: "-6s" }} />
        </div>
    );
}
