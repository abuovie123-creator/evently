"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut, User, Settings } from "lucide-react";
import { Button } from "./ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/Toast";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();
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

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-center">
            <div className={`max-w-7xl w-full glass-panel px-6 md:px-8 py-4 ${isOpen ? 'rounded-2xl' : 'rounded-full'} flex flex-col md:flex-row md:items-center justify-between transition-all duration-200 ease-in-out`}>
                <div className="flex items-center justify-between w-full md:w-auto">
                    <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Evently
                    </Link>

                    <button
                        className="md:hidden text-white p-2"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <div className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-center gap-6 md:gap-8 mt-6 md:mt-0`}>
                    <Link href="/planners" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Browse Planners
                    </Link>
                    <Link href="/events" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Events
                    </Link>
                    <Link href="/pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Pricing
                    </Link>
                    <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        About
                    </Link>

                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto mt-4 md:mt-0 border-t border-white/10 pt-4 md:pt-0 md:border-t-0">
                        {user ? (
                            <>
                                <Link href={dashboardLink} className="w-full md:w-auto">
                                    <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
                                        <Settings size={14} /> Dashboard
                                    </Button>
                                </Link>
                                <Button
                                    size="sm"
                                    onClick={handleSignOut}
                                    className="w-full md:w-auto flex items-center gap-2"
                                >
                                    <LogOut size={14} /> Log Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className="w-full md:w-auto">
                                    <Button variant="outline" size="sm" className="w-full">Log In</Button>
                                </Link>
                                <Link href="/auth/register" className="w-full md:w-auto">
                                    <Button size="sm" className="w-full">Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
