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

export default function RegisterPage() {
    const [role, setRole] = useState<"client" | "planner">("client");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { showToast } = useToast();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Prefetch for snappier transitions
    useEffect(() => {
        router.prefetch("/auth/register-planner");
        router.prefetch("/dashboard/client");
        router.prefetch("/dashboard/planner");
        router.prefetch("/dashboard/admin");
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role,
                    full_name: email.split('@')[0], // Default name from email
                }
            }
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        if (role === "planner") {
            showToast("Account created! Let's set up your profile.");
            router.push("/auth/register-planner");
        } else {
            showToast("Account created successfully!");
            setSuccess(true);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-6 pt-20 sm:pt-32">
            <Card className="max-w-md w-full space-y-8 p-6 sm:p-12" hover={false}>
                <div className="text-center space-y-3">
                    <span className="section-label">New Membership</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-charcoal">Create Account</h2>
                    <p className="text-muted-foreground text-sm font-light italic">Join the guild as a client or a professional architect</p>
                </div>

                <div className="flex border border-border p-1 bg-white/50">
                    <button
                        onClick={() => setRole("client")}
                        className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold transition-all ${role === "client" ? "bg-charcoal text-cream shadow-md" : "text-muted-foreground hover:text-charcoal"
                            }`}
                    >
                        Guest / Client
                    </button>
                    <button
                        onClick={() => setRole("planner")}
                        className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold transition-all ${role === "planner" ? "bg-charcoal text-cream shadow-md" : "text-muted-foreground hover:text-charcoal"
                            }`}
                    >
                        Master Planner
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-accent ml-1">Email Address</label>
                        <Input
                            type="email"
                            placeholder="name@heritage.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-accent ml-1">Secure Password</label>
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
                        <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] uppercase tracking-widest font-bold p-4 rounded-sm">
                            Registry Issue: {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 text-[10px] uppercase tracking-widest font-bold p-4 rounded-sm text-center shadow-sm">
                            Verification dispatch sent! Check your inbox.
                        </div>
                    )}

                    <Button type="submit" className="w-full h-14" size="lg" disabled={loading}>
                        {loading ? "Registering..." : role === "planner" ? "Continue to Setup" : "Initialize Account"}
                    </Button>
                </form>

                <p className="text-center text-xs tracking-wide text-muted-foreground pt-4">
                    Already an associate?{" "}
                    <Link href="/auth/login" className="text-charcoal hover:underline font-bold uppercase text-[10px] tracking-widest ml-1">
                        Sign In
                    </Link>
                </p>
            </Card>
        </div>
    );
}
