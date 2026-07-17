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
                <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-7xl font-serif text-charcoal font-normal tracking-wide">Events Gallery</h1>
                            <p className="text-muted-foreground text-lg max-w-xl font-light">Browse curated albums from the most remarkable celebrations across the country.</p>
                        </div>
                        <div className="w-full md:w-96 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input
                                placeholder="Search by name or city..."
                                className="pl-12 bg-transparent border-om-border focus:border-gold hover:border-gold/50 rounded-2xl h-14 text-foreground transition-colors duration-300 placeholder:text-muted-foreground font-sans-body"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="gold-divider w-full"></div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out delay-100">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-8 py-3 rounded-full text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 border ${activeCategory === cat
                                ? "bg-charcoal text-cream border-charcoal shadow-lg shadow-charcoal/10"
                                : "bg-transparent text-muted-foreground border-om-border hover:border-gold hover:text-charcoal"
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
                            <Card className="om-card p-0 overflow-hidden h-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out rounded-[2rem] border-none bg-surface" style={{ transitionDelay: `${i * 50}ms` }}>
                                <div className="aspect-[16/10] overflow-hidden relative">
                                    <img
                                        src={event.image}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform [transition-duration:1500ms] ease-out brightness-75 group-hover:brightness-90"
                                        alt={event.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

                                    <div className="absolute top-4 left-4 z-10">
                                        <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 border border-white/10 rounded-2xl shadow-lg">
                                            <span className="text-[9px] font-semibold text-gold uppercase tracking-[0.25em]">
                                                {event.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-6 left-6 right-6 z-10">
                                        <p className="text-[9px] md:text-[10px] text-white uppercase tracking-[0.2em] mb-2 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                            {event.planner_name ? `Planned by ${event.planner_name}` : "Professional Planner"}
                                        </p>
                                        <h3 className="text-xl md:text-2xl font-serif text-white group-hover:text-gold transition-colors tracking-wide leading-snug drop-shadow-lg">
                                            {event.title}
                                        </h3>
                                    </div>
                                </div>
                                <div className="p-4 md:p-6 bg-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 text-[10px] md:text-[11px] text-muted-foreground uppercase tracking-widest font-semibold border-t border-om-border">
                                    <span className="flex items-center gap-2"><MapPin size={14} className="text-accent shrink-0" /> <span className="truncate">{event.location}</span></span>
                                    <span className="flex items-center gap-2"><Calendar size={14} className="text-accent shrink-0" /> {event.date}</span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                {filteredEvents.length === 0 && (
                    <div className="text-center py-32 om-card rounded-[3rem] space-y-6 max-w-3xl mx-auto">
                        <div className="w-20 h-20 border border-om-border bg-transparent rounded-full flex items-center justify-center mx-auto text-gold">
                            <Images size={32} strokeWidth={1} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-serif text-charcoal">No events found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto font-light">Try adjusting your filters or search keywords to find what you are looking for.</p>
                        </div>
                        <button className="om-btn-outline mt-6 rounded-full" onClick={() => { setSearch(""); setActiveCategory("All"); }}>
                            Show all events
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
