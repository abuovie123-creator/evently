"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Lock, Mail, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

export default function AdminLoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const router = useRouter();

    // Check if already logged in as admin
    useEffect(() => {
        const checkAdmin = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.role === 'admin') {
                    router.push("/dashboard/admin");
                }
            }
        };
        checkAdmin();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();

        // 1. Clear any existing "client" session to prevent interference
        await supabase.auth.signOut();

        // 2. Fetch the current authorized admin username from platform_settings
        const { data: psData } = await supabase
            .from('platform_settings')
            .select('admin_username')
            .eq('id', 'default')
            .single();

        const authorizedUsername = psData?.admin_username || 'admin';

        // 3. Map username to internal admin email
        const loginEmail = username === authorizedUsername ? 'admin@evently.com' : username;

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password,
        });

        if (signInError) {
            setError(signInError.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError || profile?.role !== 'admin') {
                setError("Access Denied: This account is not authorized for Admin Access. Please use the dedicated 'admin' account.");
                showToast("Logging out incompatible session...", "info");
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            showToast("Welcome to the Command Center", "success");
            router.push("/dashboard/admin");
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements for "Secure" feel */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_50%)]" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full" />

            <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-12 space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/20 mb-6 group transition-transform hover:scale-105 duration-500">
                        <ShieldCheck size={40} className="text-white animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white capitalize">Admin Access</h1>
                    <p className="text-gray-500 text-sm max-w-[320px] mx-auto leading-relaxed">
                        Authorized personnel only. Admin accounts must be separate from regular user accounts.
                    </p>
                </div>

                <Card className="p-10 bg-black/40 backdrop-blur-3xl border-white/5 shadow-2xl space-y-8" hover={false}>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Admin Username</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-400 transition-colors">
                                    <Users size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="admin"
                                    className="w-full flex h-14 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50 pl-12 focus:border-indigo-500/50 transition-all font-medium text-white"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Access Key</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-400 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-12 pr-12 bg-white/5 border-white/10 focus:border-indigo-500/50 transition-all h-14 rounded-2xl"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in shake duration-500">
                                <p className="text-red-500 text-xs text-center font-medium leading-relaxed">
                                    {error}
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-14 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 border-none group transition-all duration-300 active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>Authorizing...</span>
                                </div>
                            ) : (
                                "Authenticate"
                            )}
                        </Button>
                    </form>
                </Card>

                <div className="mt-8 text-center sm:flex sm:items-center sm:justify-center gap-4 space-y-4 sm:space-y-0 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                    <button onClick={() => router.push("/")} className="hover:text-white transition-colors">Back to Terminal</button>
                    <span className="hidden sm:inline opacity-20">•</span>
                    <button className="hover:text-white transition-colors cursor-not-allowed">Reset Access Key</button>
                    <span className="hidden sm:inline opacity-20">•</span>
                    <button className="hover:text-white transition-colors cursor-not-allowed">Support (Encrypted)</button>
                </div>
            </div>
        </div>
    );
}
