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
        <div className={`fixed bottom-6 right-6 z-[100] max-w-sm w-full transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
            <div className="glass-panel p-6 shadow-2xl border-white/10 relative overflow-hidden group">
                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors duration-500" />

                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                    <X size={18} />
                </button>

                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                        <Bell size={24} className="animate-bounce" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <h3 className="text-lg font-black tracking-tight text-foreground leading-tight">
                            {announcement.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed font-light">
                            {announcement.content}
                        </p>
                    </div>
                </div>

                {announcement.image_url && (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-white/5">
                        <img
                            src={announcement.image_url}
                            alt={announcement.title}
                            className="w-full h-40 object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                )}

                <div className="mt-6 flex items-center gap-3">
                    {announcement.link_url && (
                        <a
                            href={announcement.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                        >
                            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white gap-2 h-11 rounded-xl shadow-lg shadow-blue-600/20">
                                View Details <ExternalLink size={16} />
                            </Button>
                        </a>
                    )}
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className={announcement.link_url ? "px-6 border-white/5 h-11 rounded-xl" : "w-full border-white/5 h-11 rounded-xl"}
                    >
                        Dismiss
                    </Button>
                </div>
            </div>
        </div>
    );
}
