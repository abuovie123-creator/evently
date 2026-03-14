"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlertCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
    const [authError, setAuthError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        router.prefetch("/planners");
    }, [router]);

    useEffect(() => {
        // Check for auth errors in the URL
        const hash = window.location.hash;
        const params = new URLSearchParams(window.location.search);

        let errorMsg = params.get("error_description");

        // Sometimes Supabase puts errors in the hash fragment
        if (!errorMsg && hash.includes("error_description")) {
            const hashParams = new URLSearchParams(hash.replace("#", "?"));
            errorMsg = hashParams.get("error_description");
        }

        if (errorMsg) {
            setAuthError(errorMsg.replace(/\+/g, " "));
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-transparent text-white pt-32 relative">
            {/* Auth Error Banner */}
            {authError && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="mx-4 p-4 glass-panel border-red-500/20 bg-red-500/10 flex items-start gap-4 shadow-2xl shadow-red-500/10">
                        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                        <div className="flex-1">
                            <p className="text-sm font-bold text-red-500">Authentication Issue</p>
                            <p className="text-xs text-gray-300 mt-1">{authError}</p>
                        </div>
                        <button
                            onClick={() => setAuthError(null)}
                            className="text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-4xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
                <h1 className="text-4xl xs:text-5xl sm:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-400 to-gray-600 px-4">
                    Evently
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-6">
                    The professional discovery platform for event planners. Showcase your portfolio. Be discovered. Grow your business.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
                    <Link href="/planners">
                        <Button size="lg">Find a Planner</Button>
                    </Link>
                    <Link href="/auth/register-planner">
                        <Button variant="glass" size="lg">Join as Planner</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
                    {[
                        { title: "Portfolio", desc: "Build a professional website for your events." },
                        { title: "Discovery", desc: "Get found by clients looking for top talent." },
                        { title: "Marketplace", desc: "Full marketplace features coming soon." }
                    ].map((feature, i) => (
                        <Card key={i} className="animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out delay-150">
                            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-400">{feature.desc}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </main>
    );
}
