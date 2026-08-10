"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Lock, Users } from "lucide-react";
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
                setError("Access Denied. This account does not have administrator privileges.");
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
        <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-6 pt-20 sm:pt-32 relative overflow-hidden">
            {/* Subtle warm background texture */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse,rgba(196,165,90,0.06),transparent_70%)]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[radial-gradient(ellipse,rgba(139,115,85,0.04),transparent_70%)]" />
            </div>

            <div className="max-w-md w-full relative z-10">
                <Card className="space-y-8 p-6 sm:p-12 rounded-3xl" hover={false}>

                    {/* Header */}
                    <div className="text-center space-y-3 mb-6">
                        <p className="section-label" style={{ color: 'var(--accent)' }}>Restricted Access</p>
                        <h1 className="text-4xl md:text-5xl font-serif" style={{ color: 'var(--charcoal)' }}>
                            Admin
                        </h1>
                        <p className="text-sm font-light italic" style={{ color: 'var(--muted-foreground)' }}>
                            Authorized personnel only
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest ml-1"
                                style={{ color: 'var(--accent)' }}>
                                Admin Username
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{ color: 'var(--accent)' }}>
                                    <Users size={16} />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="admin"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="pl-11"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest ml-1"
                                style={{ color: 'var(--accent)' }}>
                                Access Key
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{ color: 'var(--accent)' }}>
                                    <Lock size={16} />
                                </div>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pl-11 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-colors"
                                    style={{ color: 'var(--muted-foreground)' }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] uppercase tracking-widest font-bold p-4 rounded-sm animate-in fade-in duration-300">
                                Access Denied: {error}
                            </div>
                        )}

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="w-full h-14"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? "Authenticating..." : "Authenticate"}
                        </Button>
                    </form>

                    {/* Footer links */}
                    <div className="pt-2 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: 'var(--muted-foreground)' }}>
                        <button
                            onClick={() => router.push("/")}
                            className="hover:underline transition-colors"
                            style={{ color: 'var(--accent)' }}
                        >
                            Back to Home
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
