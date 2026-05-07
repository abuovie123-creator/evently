"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function DashboardFooter() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const supabase = createClient();

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('key, value');

            if (data) {
                const s: Record<string, string> = {};
                data.forEach(item => s[item.key] = item.value);
                setSettings(s);
            }
        };
        fetchSettings();
    }, [supabase]);

    return (
        <footer className="mt-20 pt-8 pb-12 border-t border-om-border/20 opacity-50 hover:opacity-100 transition-opacity duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-1 text-center md:text-left">
                    <p className="text-[10px] font-serif tracking-[0.2em] uppercase font-bold text-charcoal">
                        {settings.site_logo_text || "Evently"} Heritage
                    </p>
                    <p className="text-[9px] font-sans uppercase tracking-widest text-[#6B5E4E]">
                        © {new Date().getFullYear()} All Rights Reserved.
                    </p>
                </div>

                <nav className="flex gap-10 text-[9px] font-bold uppercase tracking-[0.4em] text-[#6B5E4E]/60">
                    <Link href="/planners" className="hover:text-charcoal transition-colors">Discovery</Link>
                    <Link href="/events" className="hover:text-charcoal transition-colors">Portfolios</Link>
                    <Link href="/faq" className="hover:text-charcoal transition-colors">Concierge</Link>
                    <Link href="/privacy" className="hover:text-charcoal transition-colors">Privacy</Link>
                </nav>
            </div>
        </footer>
    );
}
