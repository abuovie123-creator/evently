"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut, User as UserIcon, Settings } from "lucide-react";
import { Button } from "./ui/Button";
import { ThemeToggle } from "./ThemeToggle";
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

        return () => subscription.unsubscribe();
    }, [supabase, router]);

    const handleSignOut = async () => {
        setIsLoggingOut(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Logout error:", error);
            showToast("Logout failed", "error");
            setIsLoggingOut(false);
            return;
        }

        showToast("Logged out successfully", "success");
        window.location.href = "/";
    };

    const dashboardLink = role === 'admin' ? '/dashboard/admin' : role === 'planner' ? '/dashboard/planner' : '/dashboard/client';

    if (pathname?.startsWith('/dashboard')) return null;

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-center">
                <div className="max-w-7xl w-full glass-panel px-6 md:px-8 py-4 rounded-full flex items-center justify-between transition-all duration-300 ease-in-out border border-white/10 shadow-2xl">
                    <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/40 tracking-tight">
                        Evently
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/planners" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-foreground transition-colors">Browse Planners</Link>
                        <Link href="/events" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-foreground transition-colors">Events Gallery</Link>
                        <Link href="/pricing" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-foreground transition-colors">Pricing</Link>

                        {externalLinks.length > 0 && role !== 'admin' && externalLinks.map((link) => (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-foreground transition-colors flex items-center gap-1"
                            >
                                {link.label}
                            </a>
                        ))}

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href={dashboardLink}>
                                    <Button variant="outline" size="sm" className="flex items-center gap-2 border-white/10 hover:bg-white/5">
                                        <Settings size={14} /> Dashboard
                                    </Button>
                                </Link>
                                <Button size="sm" onClick={handleSignOut} className="bg-foreground text-background hover:bg-foreground/90">
                                    Logout
                                </Button>
                                <div className="h-6 w-px bg-foreground/10 mx-1 hidden lg:block" />
                                <NotificationBell />
                                <ThemeToggle />
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/auth/login">
                                    <button className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-foreground transition-colors">Log In</button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">Get Started</Button>
                                </Link>
                                <div className="h-6 w-px bg-foreground/10 mx-1 hidden lg:block" />
                                <ThemeToggle />
                            </div>
                        )}
                    </div>

                    <div className="flex md:hidden items-center gap-3">
                        {user && <NotificationBell />}
                        <ThemeToggle />
                        <button
                            className="text-foreground p-2 hover:bg-foreground/5 rounded-full transition-colors"
                            onClick={() => setIsOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </nav>

            <div className={`md:hidden fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xl" onClick={() => setIsOpen(false)} />
                <div className={`absolute top-0 right-0 bottom-0 w-[85%] bg-white dark:bg-black border-l border-foreground/10 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full p-8">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-bold text-foreground">Evently</span>
                                {user && <NotificationBell />}
                                <ThemeToggle />
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:text-foreground">
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="space-y-6">
                            {[
                                { label: "Browse Planners", href: "/planners" },
                                { label: "Events Gallery", href: "/events" },
                                { label: "Subscription Pricing", href: "/pricing" },
                                { label: "About Platform", href: "/about" }
                            ].map((link: any, i: number) => (
                                <Link
                                    key={i}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`block text-2xl font-bold transition-all duration-300 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                                    style={{ transitionDelay: `${i * 50 + 100}ms` }}
                                >
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50 hover:to-foreground transition-all">
                                        {link.label}
                                    </span>
                                </Link>
                            ))}
                            {externalLinks.length > 0 && role !== 'admin' && externalLinks.map((link, i) => (
                                <a
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsOpen(false)}
                                    className={`block text-2xl font-bold transition-all duration-300 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                                    style={{ transitionDelay: `${(4 + i) * 50 + 100}ms` }}
                                >
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-400 hover:to-blue-600 transition-all">
                                        {link.label}
                                    </span>
                                </a>
                            ))}
                        </nav>

                        <div className="mt-auto space-y-4 border-t border-white/10 pt-8">
                            {user ? (
                                <>
                                    <Link href={dashboardLink} onClick={() => setIsOpen(false)} className="block w-full">
                                        <Button size="lg" variant="outline" className="w-full border-white/10 text-white">Go to Dashboard</Button>
                                    </Link>
                                    <Button size="lg" onClick={handleSignOut} className="w-full bg-foreground text-background">Sign Out</Button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/login" onClick={() => setIsOpen(false)} className="block w-full">
                                        <Button size="lg" variant="outline" className="w-full border-foreground/10 text-foreground">Log In</Button>
                                    </Link>
                                    <Link href="/auth/register" onClick={() => setIsOpen(false)} className="block w-full">
                                        <Button size="lg" className="w-full bg-foreground text-background">Get Started</Button>
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
