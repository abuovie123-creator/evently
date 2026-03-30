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
                className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-md transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={handleClose}
            />

            <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] max-w-lg w-[92%] sm:w-full transition-all duration-700 transform ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                <div className="glass-panel p-6 md:p-10 shadow-[0_0_50px_-12px_rgba(37,99,235,0.3)] border-white/10 relative overflow-hidden group rounded-[2rem] md:rounded-[3rem]">
                    {/* Background Decor */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors duration-500" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-colors duration-500" />

                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-white/5 rounded-full"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                        <div className="w-16 h-16 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-500 shadow-xl shadow-blue-500/5">
                            <Bell size={32} className="animate-bounce" />
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground leading-tight">
                                {announcement.title}
                            </h3>
                            <p className="text-base text-muted-foreground leading-relaxed font-light max-w-sm mx-auto">
                                {announcement.content}
                            </p>
                        </div>

                        {announcement.image_url && (
                            <div className="w-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                                <img
                                    src={announcement.image_url}
                                    alt={announcement.title}
                                    className="w-full h-48 md:h-64 object-cover hover:scale-105 transition-transform duration-700"
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
                                    <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white gap-2 h-12 rounded-2xl shadow-lg shadow-blue-600/20 text-sm font-bold">
                                        View Details <ExternalLink size={18} />
                                    </Button>
                                </a>
                            )}
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className={`h-12 rounded-2xl border-white/10 text-sm font-bold ${announcement.link_url ? "w-full sm:w-32" : "w-full"}`}
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
