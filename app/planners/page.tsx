"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

interface PlannerProfile {
    id: string;
    full_name: string;
    role: string;
    category?: string;
    location?: string;
    rating?: number;
    image?: string;
    username?: string;
}

export default function PlannersPage() {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [planners, setPlanners] = useState<PlannerProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlanners = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'planner');

            if (error) {
                console.error("Error fetching planners:", error);
            } else if (data) {
                setPlanners(data.map(p => ({
                    ...p,
                    name: p.full_name, // Map for compatibility with existing UI
                    username: p.username || p.id,
                    category: p.category || "Event Specialist",
                    location: p.location || "Nigeria",
                    rating: p.rating || 5.0,
                    image: p.image || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop"
                })));
            }
            setLoading(false);
        };

        fetchPlanners();
    }, []);

    const filteredPlanners = planners.filter(planner => {
        const name = planner.full_name || "";
        const category = planner.category || "";
        const location = planner.location || "";

        const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
            category.toLowerCase().includes(search.toLowerCase()) ||
            location.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = !selectedCategory || category.toLowerCase().includes(selectedCategory.toLowerCase().replace('s', ''));
        const matchesLocation = !selectedLocation || location.toLowerCase() === selectedLocation.toLowerCase();

        return matchesSearch && matchesCategory && matchesLocation;
    });
    return (
        <main className="min-h-screen p-6 pt-32 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Discover Planners</h1>
                    <p className="text-gray-400">Find the perfect professional for your next event.</p>
                </div>
                <div className="w-full md:w-96">
                    <Input
                        placeholder="Search by name, category or location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="md:col-span-1 space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Categories</h3>
                        <div className="space-y-2">
                            {["Weddings", "Corporate", "Birthdays", "Parties", "Decor"].map(cat => (
                                <label
                                    key={cat}
                                    className="flex items-center gap-3 text-gray-300 hover:text-white cursor-pointer group"
                                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                >
                                    <div className={`w-4 h-4 rounded border ${selectedCategory === cat ? 'bg-white border-white' : 'border-white/10 group-hover:border-white/30'} transition-all`} />
                                    <span className={`text-sm ${selectedCategory === cat ? 'text-white font-bold' : ''}`}>{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Location</h3>
                        <div className="space-y-2">
                            {["Lagos", "Abuja", "Port Harcourt", "Ibadan"].map(loc => (
                                <label
                                    key={loc}
                                    className="flex items-center gap-3 text-gray-300 hover:text-white cursor-pointer group"
                                    onClick={() => setSelectedLocation(selectedLocation === loc ? null : loc)}
                                >
                                    <div className={`w-4 h-4 rounded border ${selectedLocation === loc ? 'bg-white border-white' : 'border-white/10 group-hover:border-white/30'} transition-all`} />
                                    <span className={`text-sm ${selectedLocation === loc ? 'text-white font-bold' : ''}`}>{loc}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Planner Grid */}
                <div className="md:col-span-3">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="aspect-[4/5] glass-panel rounded-[2rem] animate-pulse" />
                            ))}
                        </div>
                    ) : filteredPlanners.length === 0 ? (
                        <div className="text-center py-20 glass-panel rounded-[3rem] border-white/5">
                            <h3 className="text-xl font-bold text-gray-400">No planners found</h3>
                            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPlanners.map(planner => (
                                <Card key={planner.id} className="group overflow-hidden p-0 h-full flex flex-col">
                                    <div className="relative aspect-[4/5] overflow-hidden">
                                        <img
                                            src={planner.image}
                                            alt={planner.full_name}
                                            loading="lazy"
                                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4 glass-panel px-3 py-1 rounded-full border-white/20">
                                            <span className="text-xs font-bold text-white">⭐ {planner.rating}</span>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-3 flex-1 flex flex-col">
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                                {planner.full_name}
                                            </h3>
                                            <p className="text-sm text-gray-500">{planner.category}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>📍 {planner.location}</span>
                                        </div>
                                        <div className="pt-2 mt-auto">
                                            <Link href={`/planner/${planner.username}`}>
                                                <Button variant="outline" size="sm" className="w-full">View Profile</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
