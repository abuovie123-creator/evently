"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { Calendar, Search, ArrowLeft, Loader2, Clock, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function ClientEventsPage() {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [monthFilter, setMonthFilter] = useState("");
    const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "today">("all");

    useEffect(() => {
        const fetchEvents = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = "/auth/login";
                return;
            }

            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    profiles:planner_id (full_name, category, username)
                `)
                .eq('client_id', session.user.id)
                .order('event_date', { ascending: true });

            if (error) {
                console.error("Error fetching events:", error);
                showToast("Failed to load events", "error");
            } else {
                setBookings(data || []);
            }
            setIsLoading(false);
        };
        fetchEvents();
    }, [showToast]);

    const filteredBookings = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let filtered = bookings;

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(b => 
                b.event_type?.toLowerCase().includes(lowerQuery) || 
                b.profiles?.full_name?.toLowerCase().includes(lowerQuery)
            );
        }

        if (dateFilter) {
            filtered = filtered.filter(b => b.event_date.startsWith(dateFilter));
        }

        if (monthFilter) {
            filtered = filtered.filter(b => b.event_date.startsWith(monthFilter));
        }

        switch (filter) {
            case "upcoming":
                filtered = filtered.filter(b => {
                    const eventDate = new Date(b.event_date);
                    eventDate.setHours(0, 0, 0, 0);
                    return eventDate > today;
                });
                break;
            case "completed":
                filtered = filtered.filter(b => {
                    const eventDate = new Date(b.event_date);
                    eventDate.setHours(0, 0, 0, 0);
                    return eventDate < today;
                });
                break;
            case "today":
                filtered = filtered.filter(b => {
                    const eventDate = new Date(b.event_date);
                    eventDate.setHours(0, 0, 0, 0);
                    return eventDate.getTime() === today.getTime();
                });
                break;
        }

        return filtered;
    }, [bookings, searchQuery, filter, dateFilter, monthFilter]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-charcoal w-8 h-8" />
            </div>
        );
    }

    return (
        <main className="space-y-10 animate-in fade-in duration-700 max-w-6xl mx-auto p-4 md:p-8 lg:p-12 pt-8 md:pt-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-om-border/20 pb-8">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard/client">
                        <button className="h-12 w-12 rounded-xl p-0 flex items-center justify-center border border-om-border/30 text-charcoal hover:bg-charcoal hover:text-cream transition-all duration-700 bg-surface">
                            <ArrowLeft size={20} />
                        </button>
                    </Link>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-sans font-semibold tracking-tight text-charcoal leading-none">Your Events</h1>
                        <p className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#6B5E4E] opacity-70">Manage your past, present, and future commitments.</p>
                    </div>
                </div>
                
                <div className="flex flex-col gap-4 w-full md:w-auto">
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" size={16} />
                            <Input 
                                placeholder="Search events..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12 w-full md:w-64 rounded-xl bg-surface border-om-border/30 focus:border-charcoal font-sans text-sm"
                            />
                        </div>
                        <Input 
                            type="month"
                            value={monthFilter}
                            onChange={(e) => {
                                setMonthFilter(e.target.value);
                                setDateFilter(""); // Clear date if month is used
                            }}
                            className="h-12 w-full md:w-40 rounded-xl bg-surface border-om-border/30 focus:border-charcoal font-sans text-sm text-charcoal/80"
                        />
                        <Input 
                            type="date"
                            value={dateFilter}
                            onChange={(e) => {
                                setDateFilter(e.target.value);
                                setMonthFilter(""); // Clear month if date is used
                            }}
                            className="h-12 w-full md:w-40 rounded-xl bg-surface border-om-border/30 focus:border-charcoal font-sans text-sm text-charcoal/80"
                        />
                    </div>
                    <div className="flex bg-surface border border-om-border/30 rounded-xl p-1 w-full overflow-x-auto scrollbar-hide justify-between md:justify-start gap-1">
                        {(["all", "today", "upcoming", "completed"] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex-shrink-0 flex-1 md:flex-none ${filter === f ? 'bg-charcoal text-cream shadow-sm' : 'text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookings.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-surface/50 border border-om-border/20 rounded-2xl">
                        <Calendar className="mx-auto text-charcoal/20 mb-4" size={40} />
                        <p className="text-xl font-serif text-charcoal/60">No events found.</p>
                        <p className="text-xs text-charcoal/40 uppercase tracking-widest mt-2">Try adjusting your filters</p>
                    </div>
                ) : (
                    filteredBookings.map(booking => {
                        const eventDate = new Date(booking.event_date);
                        const isPast = eventDate.setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
                        const isToday = eventDate.setHours(0,0,0,0) === new Date().setHours(0,0,0,0);
                        
                        return (
                            <div key={booking.id} className="group bg-surface border border-om-border/30 p-6 rounded-2xl hover:border-gold/50 transition-all duration-500 hover:shadow-xl flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${isPast ? 'bg-charcoal/5 text-charcoal' : isToday ? 'bg-gold/10 text-gold' : 'bg-forest/10 text-forest'}`}>
                                        {isPast ? <CheckCircle2 size={24} /> : isToday ? <Clock size={24} /> : <Calendar size={24} />}
                                    </div>
                                    <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border ${isPast ? 'bg-surface border-charcoal/20 text-charcoal/60' : isToday ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-forest/10 border-forest/30 text-forest'}`}>
                                        {isPast ? 'Completed' : isToday ? 'Happening Now' : 'Upcoming'}
                                    </span>
                                </div>
                                
                                <div className="space-y-2 flex-grow mb-6">
                                    <h3 className="text-2xl font-serif text-charcoal leading-tight group-hover:text-gold transition-colors">{booking.event_type}</h3>
                                    <p className="text-xs font-sans text-charcoal/60">
                                        {new Date(booking.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-om-border/20 flex justify-between items-center mt-auto">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40">Planner</p>
                                        <Link href={`/planner/${booking.profiles?.username || booking.planner_id}`} className="text-sm font-medium text-charcoal hover:text-gold transition-colors block">
                                            {booking.profiles?.full_name}
                                        </Link>
                                    </div>
                                    {booking.status === 'approved' && !isPast && (
                                        <Link href="/dashboard/messages" className="px-4 py-2 bg-charcoal text-cream text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-colors">
                                            Consult
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </main>
    );
}
