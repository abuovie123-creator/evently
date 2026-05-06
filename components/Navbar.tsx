"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Settings } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "./ui/Toast";
import { LoadingScreen } from "./ui/LoadingScreen";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [externalLinks, setExternalLinks] = useState<any[]>([]);
    const [logoText, setLogoText] = useState("Evently");
    const [scrolled, setScrolled] = useState(false);
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    const { showToast } = useToast();

    useEffect(() => {
        const initUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user || null;
            setUser(user);
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                setRole(profile?.role || 'client');
            }
        };

        initUser();

        const fetchLinks = async () => {
            const { data: links } = await supabase
                .from('external_links')
                .select('*')
                .order('order_index', { ascending: true });

            const filteredLinks = (links || []).filter(link =>
                !['Main Website', 'Documentation'].includes(link.label)
            );
            setExternalLinks(filteredLinks);

            // Fetch logo text from site_settings
            const { data: settings } = await supabase
                .from('site_settings')
                .select('key, value')
                .eq('key', 'site_logo_text');
            if (settings && settings.length > 0) {
                setLogoText(settings[0].value || 'Evently');
            }
        };
        fetchLinks();

        router.prefetch("/planners");

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()
                    .then(({ data }) => setRole(data?.role || 'client'));
            } else {
                setRole(null);
            }
        });

        // Scroll listener for navbar transparency
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('scroll', handleScroll);
        };
    }, [supabase, router]);

    const handleSignOut = async () => {
        setIsLoggingOut(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
            showToast("Logout failed", "error");
            setIsLoggingOut(false);
            return;
        }
        showToast("Logged out successfully", "success");
        window.location.href = "/";
    };

    const dashboardLink = role === 'admin' ? '/dashboard/admin' : role === 'planner' ? '/dashboard/planner' : '/dashboard/client';

    if (pathname?.startsWith('/dashboard')) return null;

    const navLinks = [
        { label: "Browse Planners", href: "/planners" },
        { label: "Events Gallery", href: "/events" },
        { label: "Pricing", href: "/pricing" },
    ];

    return (
        <>
            <nav
                className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-[#FAF8F3] border-b border-[#D4C5A9]"
            >
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 md:py-5 flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="text-xl md:text-2xl tracking-widest uppercase font-serif"
                        style={{
                            fontWeight: 600,
                            color: 'var(--charcoal)',
                            letterSpacing: '0.18em',
                        }}
                    >
                        {logoText}
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-xs font-semibold uppercase tracking-widest transition-colors duration-200 text-[#6B5E4E] hover:text-[#1C1A16]"
                                style={{
                                    fontFamily: "var(--font-dm-sans), sans-serif",
                                    letterSpacing: '0.14em',
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {externalLinks.length > 0 && role !== 'admin' && externalLinks.map((link) => (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold uppercase tracking-widest transition-colors duration-200 text-[#6B5E4E] hover:text-[#1C1A16]"
                                style={{
                                    fontFamily: "var(--font-dm-sans), sans-serif",
                                    letterSpacing: '0.14em',
                                }}
                            >
                                {link.label}
                            </a>
                        ))}

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href={dashboardLink}>
                                    <button
                                        className="flex items-center gap-2 text-[10px] uppercase tracking-widest transition-all duration-200 px-4 py-2 border border-[#D4C5A9] text-[#1C1A16] font-bold"
                                        style={{
                                            fontFamily: "var(--font-dm-sans), sans-serif",
                                        }}
                                    >
                                        <Settings size={12} /> Dashboard
                                    </button>
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="om-btn-primary text-[10px] py-2 px-6"
                                >
                                    Logout
                                </button>
                                <NotificationBell />
                            </div>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Link
                                    href="/auth/login"
                                    className="text-xs font-semibold uppercase tracking-widest transition-colors duration-200 text-[#6B5E4E] hover:text-[#1C1A16]"
                                    style={{
                                        fontFamily: "var(--font-dm-sans), sans-serif",
                                        letterSpacing: '0.14em',
                                    }}
                                >
                                    Log In
                                </Link>
                                <Link href="/auth/register">
                                    <button
                                        className="text-[10px] uppercase tracking-widest transition-all duration-200 px-6 py-2.5 bg-[#1C1A16] text-[#FAF8F3] border border-[#1C1A16] font-bold"
                                        style={{
                                            fontFamily: "var(--font-dm-sans), sans-serif",
                                            letterSpacing: '0.14em',
                                        }}
                                    >
                                        Get Started
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Trigger */}
                    <div className="flex md:hidden items-center gap-3">
                        {user && <NotificationBell />}
                        <button
                            onClick={() => setIsOpen(true)}
                            className="p-2 text-[#1C1A16] transition-colors"
                        >
                            <Menu size={22} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer */}
            <div className={`md:hidden fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                <div
                    className={`absolute top-0 right-0 bottom-0 w-[85%] transform transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    style={{ background: 'var(--cream)', borderLeft: '1px solid var(--border)' }}
                >
                    <div className="flex flex-col h-full p-8">
                        <div className="flex items-center justify-between mb-12">
                            <span
                                className="text-xl uppercase tracking-widest"
                                style={{
                                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                                    fontWeight: 600,
                                    color: 'var(--charcoal)',
                                    letterSpacing: '0.18em',
                                }}
                            >
                                {logoText}
                            </span>
                            <div className="flex items-center gap-3">
                                {user && <NotificationBell />}
                                <button onClick={() => setIsOpen(false)} style={{ color: 'var(--muted-foreground)' }}>
                                    <X size={22} />
                                </button>
                            </div>
                        </div>

                        <nav className="space-y-7">
                            {navLinks.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`block text-2xl transition-all duration-300 transform ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                                    style={{
                                        fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                                        fontWeight: 500,
                                        color: 'var(--charcoal)',
                                        transitionDelay: `${i * 60 + 100}ms`,
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {externalLinks.length > 0 && role !== 'admin' && externalLinks.map((link, i) => (
                                <a
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsOpen(false)}
                                    className={`block text-2xl transition-all duration-300 transform ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                                    style={{
                                        fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                                        color: 'var(--accent)',
                                        transitionDelay: `${(navLinks.length + i) * 60 + 100}ms`,
                                    }}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>

                        <div className="mt-auto space-y-3 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
                            {user ? (
                                <>
                                    <Link href={dashboardLink} onClick={() => setIsOpen(false)} className="block w-full">
                                        <button
                                            className="w-full py-3 text-xs uppercase tracking-widest"
                                            style={{
                                                border: '1px solid var(--border)',
                                                color: 'var(--charcoal)',
                                                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                                                letterSpacing: '0.14em',
                                            }}
                                        >
                                            Dashboard
                                        </button>
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="block w-full om-btn-primary"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/login" onClick={() => setIsOpen(false)} className="block w-full">
                                        <button
                                            className="w-full py-3 text-xs uppercase tracking-widest"
                                            style={{
                                                border: '1px solid var(--border)',
                                                color: 'var(--charcoal)',
                                                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                                                letterSpacing: '0.14em',
                                            }}
                                        >
                                            Log In
                                        </button>
                                    </Link>
                                    <Link href="/auth/register" onClick={() => setIsOpen(false)} className="block w-full">
                                        <button className="block w-full om-btn-primary">
                                            Get Started
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isLoggingOut && (
                <LoadingScreen message="Logging you out..." subMessage="See you soon!!" />
            )}
        </>
    );
}
