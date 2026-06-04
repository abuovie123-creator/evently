"use client";

import { ArrowLeft } from 'lucide-react';

export function GoBackButton() {
    return (
        <button
            onClick={() => window.history.back()}
            className="flex-1 h-14 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
        >
            <ArrowLeft size={18} /> Go Back
        </button>
    );
}
