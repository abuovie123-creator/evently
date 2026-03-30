"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function Footer() {
    const [links, setLinks] = useState<Record<string, string>>({
        privacy: '/privacy',
        terms: '/terms',
        cookies: '/cookies'
    });
    const supabase = createClient();

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('key, value')
                .in('key', ['privacy_policy_url', 'terms_conditions_url', 'cookie_policy_url']);

            if (data) {
                const settings: Record<string, string> = {};
                data.forEach(item => {
                    if (item.key === 'privacy_policy_url') settings.privacy = item.value;
                    if (item.key === 'terms_conditions_url') settings.terms = item.value;
                    if (item.key === 'cookie_policy_url') settings.cookies = item.value;
                });
                setLinks(prev => ({ ...prev, ...settings }));
            }
        };
        fetchSettings();
    }, [supabase]);

    return (
        <footer className="border-t border-foreground/5 py-20 px-6 bg-foreground/[0.01]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="space-y-4 text-center md:text-left">
                    <Link href="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/40">
                        Evently
                    </Link>
                    <p className="text-xs text-muted-foreground font-medium max-w-xs">
                        The elite discovery platform for professional event planners and premium clients.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <Link href={links.privacy} className="hover:text-blue-500 transition-colors">Privacy Policy</Link>
                    <Link href={links.terms} className="hover:text-blue-500 transition-colors">Terms & Conditions</Link>
                    <Link href={links.cookies} className="hover:text-blue-500 transition-colors">Cookie Policy</Link>
                </div>

                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                    © {new Date().getFullYear()} Evently. All Rights Reserved.
                </div>
            </div>
        </footer>
    );
}
