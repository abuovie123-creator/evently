"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { showToast } = useToast();
    const router = useRouter();

    const [isRedirecting, setIsRedirecting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Initial check: if already logged in, redirect away from login page
    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;

            if (user) {
                setIsRedirecting(true);
                // Use metadata if available for instant routing
                const role = user.user_metadata?.role;
                if (role) {
                    if (role === 'admin') router.push("/dashboard/admin");
                    else if (role === 'planner') router.push("/dashboard/planner");
                    else router.push("/dashboard/client");
                    return;
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                const finalRole = profile?.role || 'client';
                if (finalRole === 'admin') router.push("/dashboard/admin");
                else if (finalRole === 'planner') router.push("/dashboard/planner");
                else router.push("/dashboard/client");
            }
        };
        checkUser();

        router.prefetch("/dashboard/client");
        router.prefetch("/dashboard/planner");
        router.prefetch("/dashboard/admin");
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            setError(signInError.message);
            setLoading(false);
            return;
        }

        // Try instant routing via metadata first
        const metadataRole = data.user?.user_metadata?.role;
        if (metadataRole) {
            showToast("Login Successful");
            setIsRedirecting(true);
            router.refresh();

            if (metadataRole === 'admin') router.push("/dashboard/admin");
            else if (metadataRole === 'planner') {
                const { data: planner } = await supabase.from('planners').select('id').eq('id', data.user.id).single();
                if (!planner) router.push("/auth/register-planner");
                else router.push("/dashboard/planner");
            } else router.push("/dashboard/client");
            return;
        }

        // Get user profile to determine role (fallback)
        let { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        // If profile is missing (e.g. user created before trigger was active), create it
        if (!profile) {
            const { data: newProfile, error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    role: data.user.user_metadata?.role || 'client',
                    full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0]
                })
                .select()
                .single();

            if (!profileError) profile = newProfile;
        }

        if (profile) {
            showToast("Login Successful");
            setIsRedirecting(true);
            router.refresh();
        }

        if (profile?.role === 'admin') {
            router.push("/dashboard/admin");
        } else if (profile?.role === 'planner') {
            // Check if planner record exists
            const { data: planner } = await supabase
                .from('planners')
                .select('id')
                .eq('id', data.user.id)
                .single();

            if (!planner) {
                router.push("/auth/register-planner");
            } else {
                router.push("/dashboard/planner");
            }
        } else {
            router.push("/dashboard/client");
        }
    };

    if (isRedirecting) {
        return <LoadingScreen message="Welcome back" subMessage="Preparing your dashboard..." />;
    }

    return (
        <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-6 pt-20 sm:pt-32">
            <Card className="max-w-md w-full space-y-8 p-6 sm:p-12" hover={false}>
                <div className="text-center space-y-3">
                    <span className="section-label">Access Protocol</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-charcoal">Welcome Back</h2>
                    <p className="text-muted-foreground text-sm font-light italic">Enter your credentials to access your heritage dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-accent ml-1">Email Address</label>
                        <Input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-xs font-bold uppercase tracking-widest text-accent">Password</label>
                            <Link href="/auth/forgot-password" title="Forgot password?" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-charcoal transition-colors">
                                Recovery
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-charcoal transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] uppercase tracking-widest font-bold p-4 rounded-sm animate-in fade-in duration-300 shadow-sm">
                            Protocol Error: {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-14" size="lg" disabled={loading}>
                        {loading ? "Authenticating..." : "Sign In"}
                    </Button>
                </form>

                <p className="text-center text-xs tracking-wide text-muted-foreground pt-4">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/register" className="text-charcoal hover:underline font-bold uppercase text-[10px] tracking-widest ml-1">
                        Register
                    </Link>
                </p>
            </Card>
        </div>
    );
}
