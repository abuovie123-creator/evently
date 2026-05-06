"use client";

import { useState, useEffect } from "react";
import { Timer, CalendarCheck } from "lucide-react";

interface BookingCountdownProps {
    eventDate: string;
    className?: string;
}

export function BookingCountdown({ eventDate, className = "" }: BookingCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        isExpired: boolean;
        isToday: boolean;
    } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(eventDate) - +new Date();

            if (difference < 0) {
                // Check if it's today
                const eventDay = new Date(eventDate).setHours(0, 0, 0, 0);
                const today = new Date().setHours(0, 0, 0, 0);

                if (eventDay === today) {
                    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false, isToday: true };
                }
                return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, isToday: false };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                isExpired: false,
                isToday: false
            };
        };

        // Initial hit
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000); // Update every minute is enough for this UI

        return () => clearInterval(timer);
    }, [eventDate]);

    if (!timeLeft) return null;

    if (timeLeft.isExpired) {
        return (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-none bg-charcoal/[0.03] border border-om-border/30 text-[10px] font-bold text-[#6B5E4E] uppercase tracking-widest ${className}`}>
                <CalendarCheck size={12} className="opacity-50" />
                Estate Event Concluded
            </div>
        );
    }

    if (timeLeft.isToday) {
        return (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-none bg-forest/10 border border-forest/20 text-[10px] font-black text-forest uppercase tracking-[0.2em] animate-pulse ${className}`}>
                <Sparkles size={12} />
                Commencement Today
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-4 px-5 py-3 rounded-none bg-cream border border-om-border/40 shadow-sm ${className}`}>
            <div className="p-2.5 rounded-none bg-charcoal/5 text-accent animate-in zoom-in duration-700">
                <Timer size={14} className="animate-pulse" />
            </div>
            <div className="flex gap-4">
                <div className="flex flex-col">
                    <span className="text-sm font-serif font-black text-charcoal leading-none transition-all duration-500">{timeLeft.days}</span>
                    <span className="text-[8px] uppercase tracking-widest text-[#6B5E4E] font-bold opacity-60">Days</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-serif font-black text-charcoal leading-none transition-all duration-500">{timeLeft.hours}</span>
                    <span className="text-[8px] uppercase tracking-widest text-[#6B5E4E] font-bold opacity-60">Hours</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-serif font-black text-charcoal leading-none transition-all duration-500">{timeLeft.minutes}</span>
                    <span className="text-[8px] uppercase tracking-widest text-[#6B5E4E] font-bold opacity-60">Mins</span>
                </div>
            </div>
        </div>
    );
}

function Sparkles({ size, className }: { size?: number; className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    );
}
