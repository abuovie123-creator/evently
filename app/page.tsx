"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlertCircle, X, Star, ArrowRight, MapPin, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface FeaturedPlanner {
    id: string;
    full_name: string;
    username: string;
    category: string;
    avatar_url: string;
    rating: number;
}

interface RecentEvent {
    id: string;
    title: string;
    slug: string;
    image: string;
    category: string;
}

export default function Home() {
    const [authError, setAuthError] = useState<string | null>(null);
    const [featuredPlanners, setFeaturedPlanners] = useState<FeaturedPlanner[]>([]);
    const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        router.prefetch("/planners");
        router.prefetch("/events");
    }, [router]);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            // Fetch top 3 planners
            const { data: planners } = await supabase
                .from('profiles')
                .select('id, full_name, username, category, avatar_url, rating')
                .eq('role', 'planner')
                .order('rating', { ascending: false })
                .limit(3);

            if (planners) {
                setFeaturedPlanners(planners.map(p => ({
                    id: p.id,
                    full_name: p.full_name || "Expert Planner",
                    username: p.username || p.id,
                    category: p.category || "Event Specialist",
                    avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
                    rating: p.rating || 5.0
                })));
            }

            // Fetch top 3 recent events
            const { data: events } = await supabase
                .from('events')
                .select(`
                    id, 
                    title, 
                    slug, 
                    category,
                    album_media (media_url)
                `)
                .order('created_at', { ascending: false })
                .limit(3);

            if (events) {
                setRecentEvents(events.map((e: any) => ({
                    id: e.id,
                    title: e.title,
                    slug: e.slug,
                    category: e.category,
                    image: e.album_media?.[0]?.media_url || "https://images.unsplash.com/photo-1519741497674-611481863552?w=800"
                })));
            }
            setIsLoading(false);
        };

        fetchData();

        // Check for auth errors in the URL
        const hash = window.location.hash;
        const params = new URLSearchParams(window.location.search);
        let errorMsg = params.get("error_description");

        if (!errorMsg && hash.includes("error_description")) {
            const hashParams = new URLSearchParams(hash.replace("#", "?"));
            errorMsg = hashParams.get("error_description");
        }

        if (errorMsg) {
            setAuthError(errorMsg.replace(/\+/g, " "));
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    return (
        <main className="min-h-screen bg-black text-white relative">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 blur-[150px] -z-10 rounded-full" />

                <div className="max-w-7xl mx-auto text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-white/10 text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4 shadow-xl">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Now Live: Professional Portfolio Builder
                    </div>

                    <h1 className="text-5xl xs:text-6xl sm:text-8xl font-black tracking-tight leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 max-w-5xl mx-auto">
                        Elevate Your <span className="text-blue-500">Planning</span> Career.
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        The elite discovery platform for event planners. Build a world-class portfolio and get discovered by premium clients.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12 pb-12">
                        <Link href="/planners">
                            <Button size="lg" className="px-10 h-16 rounded-2xl bg-white text-black hover:bg-gray-200 shadow-2xl shadow-white/10 flex items-center gap-2 group">
                                Explore Planners <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/auth/register-planner">
                            <Button variant="glass" size="lg" className="px-10 h-16 rounded-2xl border-white/10 hover:border-white/30 backdrop-blur-xl">
                                Join as a Planner
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Section */}
            <section className="max-w-7xl mx-auto px-6 py-24 space-y-16">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-3xl font-black tracking-tighter">Featured Specialists</h2>
                        <p className="text-gray-500 font-light">The highest-rated professionals on our platform today.</p>
                    </div>
                    <Link href="/planners">
                        <Button variant="outline" className="rounded-xl border-white/5 hover:border-white/20">View All Professionals</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {isLoading ? (
                        [1, 2, 3].map(i => <div key={i} className="aspect-[4/5] glass-panel rounded-[2.5rem] animate-pulse" />)
                    ) : (
                        featuredPlanners.map((planner, i) => (
                            <Link key={planner.id} href={`/planner/${planner.username}`}>
                                <Card className="group overflow-hidden p-0 rounded-[2.5rem] border-white/5 hover:border-blue-500/30 transition-all bg-black animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ transitionDelay: `${i * 100}ms` }}>
                                    <div className="aspect-[4/5] relative overflow-hidden">
                                        <img src={planner.avatar_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out brightness-75 group-hover:brightness-100" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                        <div className="absolute bottom-6 left-6 right-6">
                                            <div className="flex items-center gap-1.5 text-yellow-500 mb-1">
                                                <Star size={12} className="fill-yellow-500" />
                                                <span className="text-xs font-black text-white">{planner.rating.toFixed(1)}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors leading-none">{planner.full_name}</h3>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{planner.category}</p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            </section>

            {/* Trending Albums Section */}
            <section className="bg-white/[0.02] border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-24 space-y-16">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
                        <div className="space-y-2 text-center md:text-left">
                            <h2 className="text-3xl font-black tracking-tighter">Recent Portfolio Albums</h2>
                            <p className="text-gray-500 font-light">Get inspired by the latest work from our events gallery.</p>
                        </div>
                        <Link href="/events">
                            <Button variant="outline" className="rounded-xl border-white/5 hover:border-white/20">Explore Gallery</Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {isLoading ? (
                            [1, 2, 3].map(i => <div key={i} className="aspect-video glass-panel rounded-[2rem] animate-pulse" />)
                        ) : (
                            recentEvents.map((event, i) => (
                                <Link key={event.id} href={`/events/${event.slug}`}>
                                    <Card className="group overflow-hidden p-0 rounded-[2rem] border-white/5 hover:border-blue-500/30 transition-all bg-black animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ transitionDelay: `${i * 100}ms` }}>
                                        <div className="aspect-video relative overflow-hidden">
                                            <img src={event.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out brightness-75 group-hover:brightness-100" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                            <div className="absolute bottom-6 left-6">
                                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 block">{event.category}</span>
                                                <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors leading-none">{event.title}</h3>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Features Info Section */}
            <section className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {[
                    { title: "World-Class Portfolio", desc: "Build a professional hub for your business with high-resolution media and dynamic event albums.", icon: "✨" },
                    { title: "Smart Discovery", desc: "Our algorithm connects you with clients based on your specialty, location, and past success.", icon: "🎯" },
                    { title: "Verified Reputation", desc: "Earn badges and collect verified reviews to build trust and win premium contracts.", icon: "🛡️" }
                ].map((feature, i) => (
                    <div key={i} className="space-y-4 p-8 glass-panel border-white/5 rounded-[2.5rem] hover:border-white/10 transition-all hover:-translate-y-2 duration-500">
                        <div className="text-4xl mb-6">{feature.icon}</div>
                        <h3 className="text-2xl font-black tracking-tight">{feature.title}</h3>
                        <p className="text-gray-500 font-light leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </section>

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
        </main>
    );
}
