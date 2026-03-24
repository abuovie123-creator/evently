"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut, User as UserIcon, Settings } from "lucide-react";
import { Button } from "./ui/Button";
import { ThemeToggle } from "./ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "./ui/Toast";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    const { showToast } = useToast();


    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
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

        getUser();
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
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        showToast("Logged out successfully");
        router.refresh();
        router.push("/");
    };

    const dashboardLink = role === 'admin' ? '/dashboard/admin' : role === 'planner' ? '/dashboard/planner' : '/dashboard/client';

    // Hide Navbar on dashboard pages (must be after all hooks)
    if (pathname?.startsWith('/dashboard')) return null;

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-center">
                <div className="max-w-7xl w-full glass-panel px-6 md:px-8 py-4 rounded-full flex items-center justify-between transition-all duration-300 ease-in-out border border-white/10 shadow-2xl">
                    <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40 tracking-tight">
                        Evently
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/planners" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Browse Planners</Link>
                        <Link href="/events" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Events Gallery</Link>
                        <Link href="/pricing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pricing</Link>

                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <div className="h-6 w-px bg-white/10 mx-1" />
                        </div>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href={dashboardLink}>
                                    <Button variant="outline" size="sm" className="flex items-center gap-2 border-white/10 hover:bg-white/5">
                                        <Settings size={14} /> Dashboard
                                    </Button>
                                </Link>
                                <Button size="sm" onClick={handleSignOut} className="bg-white text-black hover:bg-gray-200">
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/auth/login">
                                    <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Log In</button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button size="sm" className="bg-white text-black hover:bg-gray-200">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-white p-2 hover:bg-white/5 rounded-full transition-colors"
                        onClick={() => setIsOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </nav>

            {/* Public Mobile Sidebar */}
            <div className={`md:hidden fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsOpen(false)} />
                <div className={`absolute top-0 right-0 bottom-0 w-[85%] bg-black/90 border-l border-white/10 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full p-8">
                        <div className="flex items-center justify-between mb-12">
                            <span className="text-2xl font-bold text-white">Evently</span>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white">
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
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 hover:to-white transition-all">
                                        {link.label}
                                    </span>
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto space-y-4 border-t border-white/10 pt-8">
                            {user ? (
                                <>
                                    <Link href={dashboardLink} onClick={() => setIsOpen(false)} className="block w-full">
                                        <Button size="lg" variant="outline" className="w-full border-white/10 text-white">Go to Dashboard</Button>
                                    </Link>
                                    <Button size="lg" onClick={handleSignOut} className="w-full bg-white text-black">Sign Out</Button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/login" onClick={() => setIsOpen(false)} className="block w-full">
                                        <Button size="lg" variant="outline" className="w-full border-white/10 text-white">Log In</Button>
                                    </Link>
                                    <Link href="/auth/register" onClick={() => setIsOpen(false)} className="block w-full">
                                        <Button size="lg" className="w-full bg-white text-black">Get Started</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
