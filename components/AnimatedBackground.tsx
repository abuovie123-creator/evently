"use client";

import React from "react";

export function AnimatedBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none select-none">
            {/* Very subtle blobs */}
            <div className="absolute top-[10%] left-[15%] w-[30rem] h-[30rem] bg-blue-500/5 blur-[120px] rounded-full animate-float" />
            <div className="absolute bottom-[10%] right-[10%] w-[35rem] h-[35rem] bg-purple-500/5 blur-[120px] rounded-full animate-float" style={{ animationDelay: "-4s" }} />

            {/* Subtle glass orbs */}
            <div className="absolute top-[20%] right-[20%] w-64 h-64 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-3xl animate-float opacity-30" style={{ animationDelay: "-2s" }} />
            <div className="absolute bottom-[30%] left-[15%] w-48 h-48 rounded-full border border-white/5 bg-white/[0.01] backdrop-blur-2xl animate-float opacity-20" style={{ animationDelay: "-6s" }} />
        </div>
    );
}
