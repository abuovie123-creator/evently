"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Search, MapPin, Star, Filter, X } from "lucide-react";

interface PlannerProfile {
    id: string;
    full_name: string;
    role: string;
    category: string;
    location: string;
    rating: number;
    avatar_url: string;
    username: string;
    review_count: number;
}

export default function PlannersPage() {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [planners, setPlanners] = useState<PlannerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const categories = ["Wedding Planner", "Corporate Events", "Party Planner", "Event Designer", "Other"];
    const locations = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu"];

    useEffect(() => {
        const fetchPlanners = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'planner');

            if (error) {
                console.error("Error fetching planners:", {
                    message: error.message,
                    code: error.code,
                    hint: error.hint,
                    details: error.details,
                    raw: error,
                });
            } else if (data) {
                setPlanners(data.map(p => ({
                    id: p.id,
                    full_name: p.full_name || "Anonymous Planner",
                    role: p.role,
                    username: p.username || p.id,
                    category: p.category || "Event Specialist",
                    location: p.location || "Nigeria",
                    rating: p.rating || 5.0,
                    review_count: p.review_count || 0,
                    avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username || p.id}`
                })));
            }
            setLoading(false);
        };

        fetchPlanners();
    }, []);

    const filteredPlanners = planners.filter(planner => {
        const matchesSearch =
            planner.full_name.toLowerCase().includes(search.toLowerCase()) ||
            planner.category.toLowerCase().includes(search.toLowerCase()) ||
            planner.location.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = !selectedCategory || planner.category === selectedCategory;
        const matchesLocation = !selectedLocation || planner.location.includes(selectedLocation);

        return matchesSearch && matchesCategory && matchesLocation;
    });

    return (
        <main className="min-h-screen p-6 pt-32 md:pt-40 max-w-7xl mx-auto space-y-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground">Find Your <span className="text-blue-500">Expert</span></h1>
                    <p className="text-muted-foreground text-lg max-w-lg font-light leading-relaxed">Connect with the most creative event professionals to bring your vision to life.</p>
                </div>
                <div className="w-full md:w-[450px] relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={20} />
                    <Input
                        placeholder="Search by name, category or city..."
                        className="pl-14 h-16 bg-foreground/5 border-foreground/10 rounded-2xl focus:border-blue-500/50 shadow-2xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Desktop Filters Sidebar */}
                <div className="hidden lg:block lg:col-span-3 space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Categories</h3>
                            {(selectedCategory || selectedLocation) && (
                                <button
                                    onClick={() => { setSelectedCategory(null); setSelectedLocation(null); }}
                                    className="text-[10px] font-bold text-blue-500 hover:text-blue-400"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                    className={`text-left px-4 py-3 rounded-xl transition-all text-sm font-medium border ${selectedCategory === cat
                                        ? "bg-blue-600/10 border-blue-500/50 text-blue-500 underline decoration-2 underline-offset-4"
                                        : "bg-foreground/5 border-transparent text-muted-foreground hover:bg-foreground/10"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Top Locations</h3>
                        <div className="flex flex-col gap-2">
                            {locations.map(loc => (
                                <button
                                    key={loc}
                                    onClick={() => setSelectedLocation(selectedLocation === loc ? null : loc)}
                                    className={`text-left px-4 py-3 rounded-xl transition-all text-sm font-medium border ${selectedLocation === loc
                                        ? "bg-blue-600/10 border-blue-500/50 text-blue-500 underline decoration-2 underline-offset-4"
                                        : "bg-foreground/5 border-transparent text-muted-foreground hover:bg-foreground/10"
                                        }`}
                                >
                                    {loc}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mobile Filter Button */}
                <div className="lg:hidden flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    <Button
                        variant="glass"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                    >
                        <Filter size={16} className="mr-2" /> Filters
                    </Button>
                    {categories.slice(0, 3).map(cat => (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? "primary" : "glass"}
                            size="sm"
                            className="flex-shrink-0"
                            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>

                {/* Planner Grid Area */}
                <div className="lg:col-span-9">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="aspect-[3/4] glass-panel rounded-[2.5rem] animate-pulse" />
                            ))}
                        </div>
                    ) : filteredPlanners.length === 0 ? (
                        <div className="text-center py-32 glass-panel rounded-[3rem] border-foreground/5 space-y-6 border-dashed">
                            <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto text-muted-foreground/50">
                                <X size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-foreground">No planners found</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">Try adjusting your filters or search keywords.</p>
                            </div>
                            <Button variant="outline" className="px-8" onClick={() => { setSearch(""); setSelectedCategory(null); setSelectedLocation(null); }}>
                                Show all specialists
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                            {filteredPlanners.map((planner, i) => (
                                <Link key={planner.id} href={`/planner/${planner.username}`}>
                                    <Card className="group overflow-hidden p-0 h-full flex flex-col border-foreground/5 hover:border-blue-500/30 transition-all bg-background dark:bg-black/40 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-8 duration-500" style={{ transitionDelay: `${i * 50}ms` }}>
                                        <div className="relative aspect-[4/5] overflow-hidden">
                                            <img
                                                src={planner.avatar_url}
                                                alt={planner.full_name}
                                                className="object-cover w-full h-full group-hover:scale-110 transition-transform [transition-duration:1500ms] ease-out brightness-90 group-hover:brightness-100"
                                            />
                                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                                <div className="bg-background/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-foreground/10 flex items-center gap-1.5 shadow-xl text-foreground">
                                                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                                    <span className="text-xs font-black">{planner.rating.toFixed(1)}</span>
                                                </div>
                                                <div className="bg-blue-600/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xl self-start">
                                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Verified</span>
                                                </div>
                                            </div>

                                            <div className="absolute inset-x-6 bottom-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                                <div className="bg-background/80 dark:bg-black/60 backdrop-blur-xl p-6 rounded-[1.5rem] border border-foreground/10 shadow-2xl shadow-black/50">
                                                    <p className="text-[8px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.2em] mb-1">{planner.category}</p>
                                                    <h3 className="text-xl font-black text-foreground dark:text-white mb-2 leading-tight">{planner.full_name}</h3>
                                                    <div className="flex items-center justify-between pt-4 border-t border-foreground/5 mt-2">
                                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                                                            <MapPin size={12} className="text-blue-500" /> {planner.location}
                                                        </span>
                                                        <span className="text-[10px] font-black text-muted-foreground/60">{planner.review_count} Reviews</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* CTA section */}
            <div className="pt-20">
                <Card className="p-16 rounded-[4rem] border-blue-500/10 bg-gradient-to-br from-blue-600/5 via-transparent to-transparent text-center space-y-8 relative overflow-hidden group/cta">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] group-hover/cta:bg-blue-500/10 transition-colors duration-1000" />
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Are you an event planner?</h2>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg font-light">Join the most prestigious network of event professionals in the country and showcase your best work to high-value clients.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/register-planner">
                            <Button size="lg" className="px-12 h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20">Create Your Portfolio</Button>
                        </Link>
                        <Link href="/about">
                            <Button variant="glass" size="lg" className="px-12 h-16 rounded-2xl">How it works</Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </main>
    );
}
