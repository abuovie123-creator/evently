"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as LucideIcons from "lucide-react";
import { Card } from "./ui/Card";

interface Feature {
    id: string;
    title: string;
    description: string;
    icon: string;
    image_url: string;
}

const defaultFeatures = [
    {
        id: "1",
        title: "All-in-One Dashboard",
        description: "Manage your bookings, messages, and portfolio from a single, intuitive command center.",
        icon: "Layout",
        image_url: "/mockups/analytics.png"
    },
    {
        id: "2",
        title: "Premium Portfolios",
        description: "Showcase your best work with high-fidelity media galleries and verified badges.",
        icon: "Image",
        image_url: "/mockups/portfolio.png"
    },
    {
        id: "3",
        title: "Direct Client Chat",
        description: "Engage with clients in real-time through our branded messaging portal.",
        icon: "MessageSquare",
        image_url: "/mockups/messaging.png"
    }
];

export function GrowSection() {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const supabase = createClient();

    useEffect(() => {
        const fetchContent = async () => {
            const { data: fData } = await supabase
                .from('home_features')
                .select('*')
                .order('order_index', { ascending: true });

            if (fData && fData.length > 0) {
                setFeatures(fData);
            } else {
                setFeatures(defaultFeatures);
            }

            const { data: sData } = await supabase
                .from('site_settings')
                .select('key, value');
            if (sData) {
                const s: Record<string, string> = {};
                sData.forEach(item => s[item.key] = item.value);
                setSettings(s);
            }

            setIsLoading(false);
        };
        fetchContent();
    }, [supabase]);

    if (isLoading) return null;

    return (
        <section className="py-20 md:py-32 px-6 bg-[#FAF8F3] border-y border-[#D4C5A9]/30 overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-20 md:space-y-32">
                <div className="text-center space-y-4 md:space-y-6 max-w-3xl mx-auto">
                    <span className="section-label">{settings.grow_section_label || "Philosophy"}</span>
                    <h2 className="text-3xl md:text-6xl font-serif tracking-tight leading-tight text-[#1C1A16]">
                        {settings.grow_section_title || "The Digital Estate"}
                    </h2>
                    <p className="text-base md:text-lg text-[#6B5E4E] font-light leading-relaxed">
                        {settings.grow_section_subtitle || "We transcend the standard directory; Evently is a curated sanctuary where excellence and talent intersect."}
                    </p>
                </div>

                <div className="space-y-24 md:space-y-40">
                    {features.map((feature, i) => {
                        const Icon = (LucideIcons as any)[feature.icon] || LucideIcons.Zap;
                        const isEven = i % 2 === 0;

                        return (
                            <div
                                key={feature.id}
                                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 md:gap-24`}
                            >
                                <div className="flex-1 space-y-8 md:space-y-10 text-center lg:text-left">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-[#D4C5A9] flex items-center justify-center text-[#8B7355] mx-auto lg:mx-0 bg-[#F5F0E8]">
                                        <Icon className="w-7 h-7 md:w-8 md:h-8" strokeWidth={1.5} />
                                    </div>
                                    <div className="space-y-4 md:space-y-6">
                                        <h3 className="text-2xl md:text-4xl font-serif text-[#1C1A16]">{feature.title}</h3>
                                        <p className="text-base md:text-lg text-[#6B5E4E] font-light leading-relaxed italic">
                                            "{feature.description}"
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-[#D4C5A9] text-[10px] font-bold uppercase tracking-widest text-[#8B7355] bg-[#F5F0E8]">
                                            <LucideIcons.ShieldCheck size={14} />
                                            Authentic Heritage
                                        </div>
                                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-[#D4C5A9] text-[10px] font-bold uppercase tracking-widest text-[#8B7355] bg-[#F5F0E8]">
                                            <LucideIcons.Star size={14} />
                                            Verified Excellence
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 relative group w-full px-4 md:px-0">
                                    <div className="om-card p-2 md:p-3 rounded-[1px] overflow-hidden bg-white shadow-2xl md:rotate-1 group-hover:rotate-0 transition-all duration-700">
                                        <img
                                            src={feature.image_url}
                                            alt={feature.title}
                                            className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                                        />
                                    </div>
                                    {/* Ornamental element */}
                                    <div className="absolute -bottom-6 -right-6 w-32 h-32 border-r border-b border-[#C4A55A]/30 -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-700" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
