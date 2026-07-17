import Link from 'next/link';
import { Home } from 'lucide-react';
import { GoBackButton } from '@/components/GoBackButton';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: 'var(--background)' }}>
            <div className="space-y-8 max-w-lg">

                {/* Decorative rule */}
                <div className="flex items-center gap-4 justify-center">
                    <div className="h-px w-16" style={{ background: 'var(--gold)' }} />
                    <span className="text-xs tracking-[0.35em] uppercase font-medium" style={{ color: 'var(--accent)' }}>
                        Evently
                    </span>
                    <div className="h-px w-16" style={{ background: 'var(--gold)' }} />
                </div>

                {/* 404 numeral */}
                <div className="relative">
                    <p
                        className="font-serif text-[11rem] leading-none font-black select-none"
                        style={{ color: 'var(--muted)', letterSpacing: '-0.04em' }}
                    >
                        404
                    </p>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h1
                            className="font-serif text-4xl md:text-5xl font-bold"
                            style={{ color: 'var(--charcoal)', letterSpacing: '-0.02em' }}
                        >
                            Page Not Found
                        </h1>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px w-24 mx-auto" style={{ background: 'var(--border)' }} />

                {/* Body copy */}
                <p className="text-base leading-relaxed font-light" style={{ color: 'var(--muted-foreground)' }}>
                    The event you're looking for seems to have been rescheduled,
                    moved to a different venue, or simply never existed.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Link href="/" className="flex-1">
                        <button
                            className="w-full h-12 flex items-center justify-center gap-2 text-sm font-semibold tracking-wide rounded transition-all duration-200"
                            style={{
                                background: 'var(--charcoal)',
                                color: 'var(--cream)',
                                border: '1px solid var(--charcoal)',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)';
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'var(--charcoal)';
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--charcoal)';
                            }}
                        >
                            <Home size={16} />
                            Back to Home
                        </button>
                    </Link>
                    <GoBackButton />
                </div>

                {/* Footer note */}
                <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--border)' }}>
                    Est. Excellence · Since Day One
                </p>
            </div>
        </div>
    );
}
