"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as LucideIcons from "lucide-react";

interface Reason {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export function WhyUsSection() {
    const [reasons, setReasons] = useState<Reason[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const supabase = createClient();

    useEffect(() => {
        const fetchContent = async () => {
            const { data: rData } = await supabase
                .from('home_reasons')
                .select('*')
                .order('order_index', { ascending: true });

            if (rData) setReasons(rData);

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

    if (isLoading || reasons.length === 0) return null;

    return (
        <section className="py-20 md:py-32 px-6 overflow-hidden relative bg-[#FAF8F3]">
            <div className="max-w-7xl mx-auto space-y-12 md:space-y-20">
                <div className="text-center space-y-4 md:space-y-6 max-w-3xl mx-auto">
                    <span className="section-label">{settings.why_us_label || "The Standard"}</span>
                    <h2 className="text-3xl md:text-6xl font-serif text-[#1C1A16] leading-tight">
                        {settings.why_us_title || "Why the Best Choose Evently"}
                    </h2>
                    <p className="text-base md:text-lg text-[#6B5E4E] font-light leading-relaxed">
                        {settings.why_us_subtitle || "We’ve re-imagined the architectural foundation of the event planning industry."}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
                    {reasons.map((reason) => {
                        const Icon = (LucideIcons as any)[reason.icon] || LucideIcons.Check;

                        return (
                            <div
                                key={reason.id}
                                className="group p-6 md:p-10 bg-white border border-[#D4C5A9]/40 hover:border-[#C4A55A] transition-all duration-500 hover:-translate-y-2"
                            >
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-[#D4C5A9]/60 flex items-center justify-center text-[#2C3A2E] mb-6 md:mb-10 group-hover:bg-[#1A2E1A] group-hover:text-[#FAF8F3] transition-all duration-500">
                                    <Icon size={24} strokeWidth={1} />
                                </div>
                                <h3 className="text-xl font-serif text-[#1C1A16] mb-4 group-hover:text-[#8B7355] transition-colors">{reason.title}</h3>
                                <p className="text-[#6B5E4E] font-light leading-relaxed text-sm">
                                    {reason.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
