"use client";

import React, { useEffect, useState } from "react";
import { X, ExternalLink, Bell } from "lucide-react";
import { Button } from "./ui/Button";
import { createClient } from "@/lib/supabase/client";

interface Announcement {
    id: string;
    title: string;
    content: string;
    image_url?: string;
    link_url?: string;
}

export function AnnouncementPopup() {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchAnnouncement = async () => {
            const { data, error } = await supabase
                .from('platform_announcements')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!error && data) {
                const dismissedId = localStorage.getItem(`announcement_dismissed_${data.id}`);
                if (!dismissedId) {
                    setAnnouncement(data);
                    // Delay slightly for entry animation
                    setTimeout(() => setIsVisible(true), 1500);
                }
            }
        };

        fetchAnnouncement();
    }, [supabase]);

    const handleClose = () => {
        if (announcement) {
            localStorage.setItem(`announcement_dismissed_${announcement.id}`, 'true');
        }
        setIsVisible(false);
    };

    if (!announcement) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[100] bg-black/40 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={handleClose}
            />

            <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] max-w-lg w-[94%] sm:w-full transition-all duration-700 transform ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                <div className="om-card bg-surface p-5 md:p-10 shadow-2xl border border-border relative overflow-hidden group rounded-xl">

                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-white/5 rounded-full"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                        <div className="w-20 h-20 rounded-full bg-forest-mid/5 border border-border flex items-center justify-center text-accent shadow-sm relative">
                            <div className="absolute inset-0 rounded-full border border-gold/20 animate-spin-slow" />
                            <Bell size={32} className="relative z-10" />
                        </div>

                        <div className="space-y-4 w-full">
                            <div className="flex flex-col items-center">
                                <span className="section-label mb-2">Institutional Notice</span>
                                <div className="gold-divider mb-4" />
                            </div>

                            <h3 className="text-3xl md:text-4xl font-serif text-charcoal leading-tight">
                                {announcement.title}
                            </h3>
                            <p className="text-base text-muted-foreground leading-relaxed font-light italic max-w-sm mx-auto">
                                {announcement.content}
                            </p>
                        </div>

                        {announcement.image_url && (
                            <div className="w-full rounded-lg overflow-hidden border border-gold/30 shadow-xl relative group-hover:border-gold transition-colors duration-500">
                                <img
                                    src={announcement.image_url}
                                    alt={announcement.title}
                                    className="w-full h-48 md:h-60 object-cover grayscale brightness-[0.9] hover:grayscale-0 hover:brightness-100 transition-all duration-1000 hover:scale-105"
                                />
                                <div className="absolute inset-0 pointer-events-none border-[12px] border-surface/20" />
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                            {announcement.link_url && (
                                <a
                                    href={announcement.link_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:flex-1"
                                >
                                    <Button className="w-full h-12 text-[11px] tracking-[0.2em]">
                                        Explore Details <ExternalLink size={14} className="ml-2" />
                                    </Button>
                                </a>
                            )}
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className={`h-12 text-[11px] tracking-[0.2em] ${announcement.link_url ? "w-full sm:w-40" : "w-full"}`}
                            >
                                Dismiss
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
