"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Instagram, Twitter, Linkedin, ArrowRight } from "lucide-react";

export function Footer() {
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

    const socialLinks = [
        { icon: Instagram, href: settings.social_instagram || "#", label: "Instagram" },
        { icon: Twitter, href: settings.social_twitter || "#", label: "Twitter" },
        { icon: Linkedin, href: settings.social_linkedin || "#", label: "LinkedIn" },
    ];

    return (
        <footer className="bg-[#1A2E1A] text-[#FAF8F3]/90 py-24 px-6 md:px-10 border-t border-[#D4C5A9]/10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-12">
                {/* Brand Column */}
                <div className="space-y-8">
                    <Link href="/" className="text-3xl font-serif tracking-[0.18em] uppercase font-semibold text-[#FAF8F3]">
                        {settings.site_logo_text || "Evently"}
                    </Link>
                    <p className="text-sm font-light leading-relaxed max-w-xs text-[#FAF8F3]/70">
                        {settings.footer_tagline || "Curating excellence in the world's most prestigious event planning circles."}
                    </p>
                    <div className="flex gap-5 pt-2">
                        {socialLinks.map((social, i) => (
                            <a
                                key={i}
                                href={social.href}
                                className="w-10 h-10 rounded-full border border-[#FAF8F3]/10 flex items-center justify-center hover:bg-[#FAF8F3] hover:text-[#1A2E1A] transition-all duration-300"
                            >
                                <social.icon size={18} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Discovery Column */}
                <div className="space-y-8">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A55A]">Discovery</h4>
                    <nav className="flex flex-col gap-4">
                        <Link href="/planners" className="text-sm font-light hover:text-[#FAF8F3] transition-colors">Browse Planners</Link>
                        <Link href="/auth/register-planner" className="text-sm font-light hover:text-[#FAF8F3] transition-colors">Join as Planner</Link>
                        <Link href="/events" className="text-sm font-light hover:text-[#FAF8F3] transition-colors">Events Gallery</Link>
                        <Link href="/pricing" className="text-sm font-light hover:text-[#FAF8F3] transition-colors">Membership</Link>
                    </nav>
                </div>

                {/* Support Column */}
                <div className="space-y-8">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A55A]">Support</h4>
                    <nav className="flex flex-col gap-4">
                        <Link href="/contact" className="text-sm font-light hover:text-[#FAF8F3] transition-colors">Contact Us</Link>
                        <Link href="/faq" className="text-sm font-light hover:text-[#FAF8F3] transition-colors">FAQ</Link>
                        <Link href={settings.privacy_policy_url || "/privacy"} className="text-sm font-light hover:text-[#FAF8F3] transition-colors">Privacy Policy</Link>
                        <Link href={settings.terms_conditions_url || "/terms"} className="text-sm font-light hover:text-[#FAF8F3] transition-colors">Terms & Conditions</Link>
                    </nav>
                </div>

                {/* Newsletter Column */}
                <div className="space-y-8">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A55A]">Stay in the know</h4>
                    <p className="text-sm font-light text-[#FAF8F3]/70">
                        {settings.footer_newsletter_description || "Join our legacy network for exclusive insights."}
                    </p>
                    <form className="relative group">
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-transparent border-b border-[#FAF8F3]/20 py-3 text-sm font-light focus:outline-none focus:border-[#C4A55A] transition-colors pr-10"
                        />
                        <button className="absolute right-0 top-1/2 -translate-y-1/2 text-[#C4A55A] group-hover:translate-x-1 transition-transform duration-300">
                            <ArrowRight size={20} />
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-[#FAF8F3]/10 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[10px] font-medium tracking-widest uppercase text-[#FAF8F3]/40">
                    © {new Date().getFullYear()} {settings.site_logo_text || "Evently"} Heritage. All Rights Reserved.
                </p>
                <div className="flex gap-8 text-[10px] font-medium tracking-widest uppercase text-[#FAF8F3]/40">
                    <Link href="/privacy" className="hover:text-[#FAF8F3] transition-colors">Legal</Link>
                    <Link href="/cookies" className="hover:text-[#FAF8F3] transition-colors">Cookies</Link>
                </div>
            </div>
        </footer>
    );
}
