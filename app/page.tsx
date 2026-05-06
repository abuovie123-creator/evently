"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlertCircle, X, Star, ArrowRight, MapPin, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { GrowSection } from "@/components/GrowSection";
import { WhyUsSection } from "@/components/WhyUsSection";

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
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [searchLocation, setSearchLocation] = useState("");
    const [searchType, setSearchType] = useState("");

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        router.prefetch("/planners");
        router.prefetch("/events");
    }, [router]);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch top 5 planners for carousel
            const { data: planners } = await supabase
                .from('profiles')
                .select('id, full_name, username, category, avatar_url, rating')
                .eq('role', 'planner')
                .order('rating', { ascending: false })
                .limit(5);

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

            // Fetch site settings
            const { data: sData } = await supabase
                .from('site_settings')
                .select('key, value');
            if (sData) {
                const s: Record<string, string> = {};
                sData.forEach(item => s[item.key] = item.value);
                setSettings(s);
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
    }, [supabase, router]);

    // Auto-play for carousel
    useEffect(() => {
        if (featuredPlanners.length === 0) return;

        const interval = setInterval(() => {
            setCarouselIndex((prev) => (prev + 1) % featuredPlanners.length);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, [featuredPlanners]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchLocation) params.set("location", searchLocation);
        if (searchType) params.set("type", searchType);
        router.push(`/planners?${params.toString()}`);
    };

    const nextCarousel = () => setCarouselIndex((prev) => (prev + 1) % featuredPlanners.length);
    const prevCarousel = () => setCarouselIndex((prev) => (prev - 1 + featuredPlanners.length) % featuredPlanners.length);

    return (
        <main className="min-h-screen bg-[#FAF8F3] text-[#1C1A16] relative">
            {/* Hero Section */}
            <section className="relative h-screen w-full flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
                {/* Hero Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={settings.hero_bg_url || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3"}
                        alt="Hero Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-[#1C1A16]/40 via-transparent to-[#FAF8F3]" />
                </div>

                <div className="max-w-7xl mx-auto text-center space-y-8 md:space-y-12 z-10 animate-fade-up">
                    <h1 className="text-4xl sm:text-5xl md:text-8xl font-serif tracking-tight leading-[1.1] text-white px-4">
                        {settings.hero_headline_part1 || "Curate Your"} <em className="italic font-normal">{settings.hero_headline_part2 || "Legacy."}</em>
                    </h1>

                    <div className="w-full max-w-4xl mx-auto mt-8 md:mt-16 px-4">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-2 md:gap-3 bg-white p-2 md:p-3 rounded-[1px] shadow-2xl border border-[#D4C5A9]/30">
                            <div className="flex-1 w-full relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B7355]" size={16} />
                                <input
                                    type="text"
                                    placeholder={settings.hero_search_loc_placeholder || "Where is your event?"}
                                    className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-transparent text-xs md:text-sm focus:outline-none placeholder-[#6B5E4E]/50"
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                />
                            </div>
                            <div className="h-[1px] md:h-8 w-full md:w-[1px] bg-[#D4C5A9]/30" />
                            <div className="flex-1 w-full relative">
                                <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B7355]" size={16} />
                                <input
                                    type="text"
                                    placeholder={settings.hero_search_type_placeholder || "Event Type"}
                                    className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-transparent text-xs md:text-sm focus:outline-none placeholder-[#6B5E4E]/50"
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="w-full md:w-auto om-btn-primary px-12 py-3 md:py-4 text-xs md:text-sm">
                                Explore
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* The Master Planners Section */}
            <section className="py-32 px-6 md:px-10 bg-[#FAF8F3]">
                <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 md:gap-0">
                        <div className="space-y-4 text-center md:text-left">
                            <span className="section-label">{settings.planners_label || "Planners"}</span>
                            <h2 className="text-3xl md:text-6xl font-serif text-[#1C1A16]">{settings.planners_title || "The Master Planners"}</h2>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={prevCarousel} className="carousel-arrow"><ArrowRight className="rotate-180" size={18} /></button>
                            <button onClick={nextCarousel} className="carousel-arrow"><ArrowRight size={18} /></button>
                        </div>
                    </div>

                    <div className="relative overflow-hidden">
                        <div
                            className="carousel-track gap-4 md:gap-8"
                            style={{ transform: `translateX(-${carouselIndex * (100 / featuredPlanners.length)}%)` }}
                        >
                            {featuredPlanners.map((planner) => (
                                <Link
                                    key={planner.id}
                                    href={`/planner/${planner.username}`}
                                    className="min-w-[90%] sm:min-w-[45%] md:min-w-[30%] group"
                                >
                                    <div className="space-y-4 md:space-y-6">
                                        <div className="aspect-[3/4] relative overflow-hidden bg-[#F5F0E8] border border-[#D4C5A9]/30">
                                            <img
                                                src={planner.avatar_url}
                                                alt={planner.full_name}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="space-y-2 text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-1 text-[#C4A55A] mb-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={10} className={i < Math.floor(planner.rating) ? "fill-[#C4A55A]" : ""} />
                                                ))}
                                                <span className="text-[10px] font-bold ml-1 text-[#1C1A16]">{planner.rating.toFixed(1)}</span>
                                            </div>
                                            <h3 className="text-2xl font-serif text-[#1C1A16] leading-tight">{planner.full_name}</h3>
                                            <p className="section-label text-[9px] text-[#6B5E4E]">{planner.category}</p>
                                            <div className="pt-4 flex items-center justify-center md:justify-start gap-2 text-[10px] font-bold uppercase tracking-widest text-[#8B7355] opacity-0 group-hover:opacity-100 transition-opacity">
                                                View Profile <ArrowRight size={12} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <GrowSection />

            {/* Notable Heritage Moments Section */}
            <section className="py-20 md:py-32 px-6 md:px-10 bg-[#FAF8F3] border-t border-[#D4C5A9]/20">
                <div className="max-w-7xl mx-auto space-y-12 md:space-y-20">
                    <div className="text-center md:text-left space-y-4">
                        <span className="section-label">{settings.portfolio_label || "Portfolio"}</span>
                        <h2 className="text-3xl md:text-6xl font-serif text-[#1C1A16]">{settings.portfolio_title || "Notable Heritage Moments"}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto md:h-[800px]">
                        <div className="md:col-span-8 group relative overflow-hidden h-[400px] md:h-full">
                            <Link href={recentEvents[0] ? `/events/${recentEvents[0].slug}` : "#"}>
                                <div className="w-full h-full border border-[#D4C5A9]/30 overflow-hidden relative">
                                    <img
                                        src={recentEvents[0]?.image || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200"}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                                        alt="Main Event"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                                    <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 text-white text-left">
                                        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold mb-2 block">{recentEvents[0]?.category}</span>
                                        <h3 className="text-2xl md:text-3xl font-serif">{recentEvents[0]?.title}</h3>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="md:col-span-4 flex flex-col gap-8">
                            {[recentEvents[1], recentEvents[2]].map((event, i) => (
                                <div key={i} className="flex-1 group relative overflow-hidden h-[300px] md:h-auto">
                                    <Link href={event ? `/events/${event.slug}` : "#"}>
                                        <div className="w-full h-full border border-[#D4C5A9]/30 overflow-hidden relative">
                                            <img
                                                src={event?.image || (i === 0 ? "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800" : "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800")}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                                                alt="Side Event"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                                            <div className="absolute bottom-6 left-6 text-white text-left">
                                                <span className="text-[8px] uppercase tracking-[0.2em] font-bold mb-1 block">{event?.category}</span>
                                                <h4 className="text-lg md:text-xl font-serif">{event?.title}</h4>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Visionaries Section */}
            <section className="py-24 md:py-40 px-6 bg-[#1A2E1A] text-[#FAF8F3] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/linen.png')]" />
                </div>

                <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-12 relative z-10">
                    <h2 className="text-4xl md:text-7xl font-serif leading-tight px-4">
                        {settings.visionaries_title || "For the Visionaries"}
                    </h2>
                    <p className="text-lg md:text-2xl font-light text-[#FAF8F3]/70 leading-relaxed italic px-4">
                        {settings.visionaries_subtitle || "Are you an architect of memories? Showcase your portfolio to the world's most discerning guests."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                        <Link href="/auth/register-planner">
                            <button className="om-btn-outline border-[#C4A55A] text-[#FAF8F3] hover:bg-[#C4A55A] hover:text-[#1A2E1A]">
                                Join as Planner
                            </button>
                        </Link>
                        <Link href="/planners">
                            <button className="om-btn-primary bg-[#FAF8F3] text-[#1A2E1A] border-[#FAF8F3] hover:bg-transparent hover:text-[#FAF8F3]">
                                Explore More
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Auth Error Banner */}
            {authError && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md animate-fade-up">
                    <div className="mx-4 p-5 bg-white border border-red-500/20 flex items-start gap-4 shadow-2xl">
                        <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-red-600">Protocol Issue</p>
                            <p className="text-sm text-[#1C1A16] mt-1">{authError}</p>
                        </div>
                        <button onClick={() => setAuthError(null)} className="text-[#6B5E4E] hover:text-[#1C1A16]">
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            <FAQ />
            <Footer />
        </main>
    );
}
