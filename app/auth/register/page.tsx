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
        <div className="min-h-screen flex items-center justify-center p-6 pt-32">
            <Card className="max-w-md w-full space-y-8 p-10" hover={false}>
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-white">Create Account</h2>
                    <p className="text-gray-400 text-sm">Join Evently as a client or a professional planner</p>
                </div>

                <div className="flex p-1 bg-white/5 rounded-full">
                    <button
                        onClick={() => setRole("client")}
                        className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${role === "client" ? "bg-white text-black" : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Client
                    </button>
                    <button
                        onClick={() => setRole("planner")}
                        className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${role === "planner" ? "bg-white text-black" : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Planner
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                        <Input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-lg animate-in fade-in duration-300">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-xs p-3 rounded-lg animate-in fade-in duration-300 text-center">
                            Check your email to verify your account!
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
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
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                        {loading ? "Creating Account..." : role === "planner" ? "Continue to Planner Setup" : "Create Client Account"}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-white hover:underline font-medium">
                        Log in
                    </Link>
                </p>
            </Card>
        </div>
    );
}
