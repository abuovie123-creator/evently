"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { Star, Search, ArrowLeft, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function ClientFavoritesPage() {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [savedPlanners, setSavedPlanners] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        const fetchFavorites = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = "/auth/login";
                return;
            }

            const { data, error } = await supabase
                .from('saved_planners')
                .select(`
                    id,
                    profiles:planner_id (id, username, full_name, category, avatar_url, location)
                `)
                .eq('client_id', session.user.id);

            if (error) {
                console.error("Error fetching favorites:", error);
                showToast("Failed to load favorites", "error");
            } else {
                setSavedPlanners(data || []);
            }
            setIsLoading(false);
        };
        fetchFavorites();
    }, [showToast]);

    const categories = useMemo(() => {
        const cats = new Set<string>();
        savedPlanners.forEach(saved => {
            if (saved.profiles?.category) cats.add(saved.profiles.category);
        });
        return ["all", ...Array.from(cats)];
    }, [savedPlanners]);

    const filteredFavorites = useMemo(() => {
        let filtered = savedPlanners;

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(saved => 
                saved.profiles?.full_name?.toLowerCase().includes(lowerQuery) || 
                saved.profiles?.location?.toLowerCase().includes(lowerQuery)
            );
        }

        if (categoryFilter !== "all") {
            filtered = filtered.filter(saved => saved.profiles?.category === categoryFilter);
        }

        return filtered;
    }, [savedPlanners, searchQuery, categoryFilter]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-charcoal w-8 h-8" />
            </div>
        );
    }

    return (
        <main className="space-y-10 animate-in fade-in duration-700 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-om-border/20 pb-8">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard/client">
                        <button className="h-12 w-12 rounded-xl p-0 flex items-center justify-center border border-om-border/30 text-charcoal hover:bg-charcoal hover:text-cream transition-all duration-700 bg-surface">
                            <ArrowLeft size={20} />
                        </button>
                    </Link>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-sans font-semibold tracking-tight text-charcoal leading-none">Your Favorites</h1>
                        <p className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#6B5E4E] opacity-70">A curated collection of your preferred planners.</p>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" size={16} />
                        <Input 
                            placeholder="Search by name or location..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 w-full md:w-64 rounded-xl bg-surface border-om-border/30 focus:border-charcoal font-sans text-sm"
                        />
                    </div>
                    {categories.length > 1 && (
                        <div className="flex bg-surface border border-om-border/30 rounded-xl p-1 w-full md:w-auto overflow-x-auto scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex-shrink-0 ${categoryFilter === cat ? 'bg-charcoal text-cream shadow-sm' : 'text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredFavorites.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-surface/50 border border-om-border/20 rounded-2xl">
                        <Star className="mx-auto text-charcoal/20 mb-4" size={40} />
                        <p className="text-xl font-serif text-charcoal/60">No favorites found.</p>
                        <p className="text-xs text-charcoal/40 uppercase tracking-widest mt-2">Discover new planners in the directory.</p>
                        <Link href="/planners" className="inline-block mt-6 px-6 py-3 bg-charcoal text-cream text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-colors">
                            View All Planners
                        </Link>
                    </div>
                ) : (
                    filteredFavorites.map(saved => (
                        <Link href={`/planner/${saved.profiles?.username || saved.profiles?.id}`} key={saved.id} className="group block space-y-4">
                            <div className="relative aspect-[4/5] overflow-hidden bg-surface border border-om-border/10 rounded-2xl">
                                <img src={saved.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${saved.profiles?.id}`} alt={saved.profiles?.full_name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                <div className="absolute top-4 right-4 bg-cream/90 backdrop-blur-sm p-2.5 rounded-full border border-om-border/20 text-gold shadow-sm transition-transform group-hover:scale-110">
                                    <Star className="w-5 h-5 fill-gold" />
                                </div>
                                {saved.profiles?.location && (
                                    <div className="absolute bottom-4 left-4 right-4 bg-cream/90 backdrop-blur-sm px-3 py-2 rounded-xl border border-om-border/20 flex items-center gap-2">
                                        <MapPin size={12} className="text-charcoal/60 shrink-0" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-charcoal truncate">
                                            {saved.profiles.location}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1 px-1">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40">{saved.profiles?.category || "ESTATE SERIES"}</p>
                                <h3 className="text-xl font-serif text-charcoal group-hover:text-gold transition-colors">{saved.profiles?.full_name}</h3>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </main>
    );
}
