"use client";

import { ArrowLeft } from 'lucide-react';

export function GoBackButton() {
    return (
        <button
            onClick={() => window.history.back()}
            className="flex-1 h-12 flex items-center justify-center gap-2 text-sm font-semibold tracking-wide rounded transition-all duration-200"
            style={{
                background: 'transparent',
                color: 'var(--charcoal)',
                border: '1px solid var(--border)',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--secondary)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--charcoal)';
            }}
        >
            <ArrowLeft size={16} /> Go Back
        </button>
    );
}
