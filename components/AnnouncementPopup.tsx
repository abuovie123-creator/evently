"use client";

import React, { useEffect, useState } from "react";
import { X, ExternalLink, Bell, Info } from "lucide-react";
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
                <div className="om-card bg-[#F5F0E8] p-5 md:p-10 shadow-2xl border-[#D4C5A9] relative overflow-hidden group rounded-sm">

                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-white/5 rounded-full"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                        <div className="w-16 h-16 rounded-sm bg-[#1A2E1A]/10 flex items-center justify-center text-[#1A2E1A] shadow-lg">
                            <Bell size={28} className="animate-bounce" />
                        </div>

                        <div className="space-y-3">
                            <span className="section-label">Institutional Notice</span>
                            <h3 className="text-3xl md:text-4xl font-serif text-charcoal leading-tight">
                                {announcement.title}
                            </h3>
                            <p className="text-base text-muted-foreground leading-relaxed font-light italic max-w-sm mx-auto">
                                {announcement.content}
                            </p>
                        </div>

                        {announcement.image_url && (
                            <div className="w-full rounded-sm overflow-hidden border border-border shadow-xl">
                                <img
                                    src={announcement.image_url}
                                    alt={announcement.title}
                                    className="w-full h-48 md:h-64 object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105"
                                />
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
                                    <Button className="w-full bg-charcoal hover:bg-forest text-cream h-12 rounded-sm text-[10px] tracking-widest font-bold uppercase transition-all">
                                        Explore Details <ExternalLink size={14} />
                                    </Button>
                                </a>
                            )}
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className={`h-12 rounded-sm text-[10px] tracking-widest font-bold uppercase ${announcement.link_url ? "w-full sm:w-32" : "w-full"}`}
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
