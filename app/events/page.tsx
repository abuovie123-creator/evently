"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { Loader2, MapPin, Calendar, Search, Images } from "lucide-react";

interface EventItem {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    location: string;
    slug: string;
    image: string;
    planner_name?: string;
}

export default function EventsPage() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [events, setEvents] = useState<EventItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const categories = ["All", "Wedding", "Corporate", "Party", "Charity", "Other"];

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            const supabase = createClient();

            // Fetch events with their first media item and planner name
            const { data, error } = await supabase
                .from('events')
                .select(`
                    id,
                    title,
                    description,
                    category,
                    date,
                    location,
                    slug,
                    created_at,
                    profiles!events_planner_id_fkey (full_name),
                    album_media (media_url)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching events:", error);
            } else if (data) {
                const formattedEvents = data.map((event: any) => ({
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    category: event.category,
                    date: event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A',
                    location: event.location,
                    slug: event.slug,
                    image: event.album_media?.[0]?.media_url || "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
                    planner_name: event.profiles?.full_name
                }));
                setEvents(formattedEvents);
            }
            setIsLoading(false);
        };

        fetchEvents();
    }, []);

    const filteredEvents = events.filter(event =>
        (activeCategory === "All" || event.category === activeCategory) &&
        (event.title.toLowerCase().includes(search.toLowerCase()) ||
            event.location?.toLowerCase().includes(search.toLowerCase()))
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground pb-20 pt-32 transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-6 space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight underline decoration-blue-500/30 underline-offset-8 text-foreground">Events Gallery</h1>
                        <p className="text-muted-foreground text-lg max-w-xl font-light">Browse curated albums from the most remarkable celebrations across the country.</p>
                    </div>
                    <div className="w-full md:w-96 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            placeholder="Search by name or city..."
                            className="pl-12 bg-foreground/5 border-foreground/10 h-14 text-foreground"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out delay-100">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border ${activeCategory === cat
                                ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20"
                                : "bg-foreground/5 text-muted-foreground border-foreground/5 hover:border-foreground/20"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredEvents.map((event, i) => (
                        <Link key={event.slug} href={`/events/${event.slug}`} className="group">
                            <Card className="p-0 overflow-hidden border-foreground/5 hover:border-blue-500/30 transition-all h-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out bg-background dark:bg-black/40" style={{ transitionDelay: `${i * 50}ms` }}>
                                <div className="aspect-[16/10] overflow-hidden relative">
                                    <img
                                        src={event.image}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform [transition-duration:1500ms] ease-out brightness-75 group-hover:brightness-100"
                                        alt={event.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                                    <div className="absolute top-4 left-4">
                                        <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                                {event.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-6 left-6 right-6">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">
                                            {event.planner_name ? `Planned by ${event.planner_name}` : "Professional Planner"}
                                        </p>
                                        <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight leading-none">
                                            {event.title}
                                        </h3>
                                    </div>
                                </div>
                                <div className="p-6 bg-foreground/[0.01] flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest font-black border-t border-foreground/5">
                                    <span className="flex items-center gap-2"><MapPin size={12} className="text-blue-500" /> {event.location}</span>
                                    <span className="flex items-center gap-2"><Calendar size={12} className="text-blue-500" /> {event.date}</span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                {filteredEvents.length === 0 && (
                    <div className="text-center py-32 glass-panel rounded-[3rem] border-white/5 space-y-6">
                        <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto text-muted-foreground/30">
                            <Images size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-foreground">No events found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">Try adjusting your filters or search keywords to find what you are looking for.</p>
                        </div>
                        <Button variant="outline" className="px-8" onClick={() => { setSearch(""); setActiveCategory("All"); }}>
                            Show all events
                        </Button>
                    </div>
                )}
            </div>
        </main>
    );
}
