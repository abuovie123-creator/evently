"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

const SAMPLE_EVENTS = [
    { title: "The Royal Wedding", category: "Wedding", date: "Dec 2025", location: "Lagos", image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800", slug: "royal-wedding" },
    { title: "Met Gala Tribute", category: "Corporate", date: "Nov 2025", location: "Abuja", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800", slug: "met-gala" },
    { title: "Skyline Anniversary", category: "Party", date: "Oct 2025", location: "Lagos", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800", slug: "skyline" },
    { title: "Neon Nights Expo", category: "Corporate", date: "Sep 2025", location: "Port Harcourt", image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800", slug: "neon-nights" },
    { title: "Boho Beach Bash", category: "Wedding", date: "Aug 2025", location: "Lagos", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800", slug: "boho-beach" },
    { title: "Silver Lining Gala", category: "Charity", date: "Jul 2025", location: "Abuja", image: "https://images.unsplash.com/photo-1517457373958-b7bdd458ad20?w=800", slug: "silver-lining" },
];

export default function EventsPage() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = ["All", "Wedding", "Corporate", "Party", "Charity"];

    const filteredEvents = SAMPLE_EVENTS.filter(event =>
        (activeCategory === "All" || event.category === activeCategory) &&
        (event.title.toLowerCase().includes(search.toLowerCase()) ||
            event.location.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <main className="min-h-screen bg-black text-white pb-20 pt-32">
            <div className="max-w-7xl mx-auto px-6 space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Events Gallery</h1>
                        <p className="text-gray-400 text-lg max-w-xl">Browse curated albums from the most remarkable celebrations across the country.</p>
                    </div>
                    <div className="w-full md:w-80">
                        <Input
                            placeholder="Search by name or city..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out delay-100">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${activeCategory === cat
                                    ? "bg-white text-black border-white"
                                    : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEvents.map((event, i) => (
                        <Link key={event.slug} href={`/events/${event.slug}`} className="group">
                            <Card className="p-0 overflow-hidden border-white/5 hover:border-white/20 transition-all h-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out" style={{ transitionDelay: `${i * 50}ms` }}>
                                <div className="aspect-[16/10] overflow-hidden relative">
                                    <img
                                        src={event.image}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                                        alt={event.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-4 left-4">
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-1 block">
                                            {event.category}
                                        </span>
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {event.title}
                                        </h3>
                                    </div>
                                </div>
                                <div className="p-5 bg-white/[0.02] flex justify-between items-center text-xs text-gray-500 uppercase tracking-widest font-bold">
                                    <span>📍 {event.location}</span>
                                    <span>{event.date}</span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                {filteredEvents.length === 0 && (
                    <div className="text-center py-20 glass-panel rounded-3xl border-white/5">
                        <p className="text-gray-400">No events found matching your current filters.</p>
                        <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setActiveCategory("All"); }}>
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>
        </main>
    );
}
