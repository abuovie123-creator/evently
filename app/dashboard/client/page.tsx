"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { Calendar, MessageCircle, AlertCircle } from "lucide-react";
import { BookingCountdown } from "@/components/BookingCountdown";

export default function ClientDashboard() {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState<any[]>([]);

    const fetchDashboardData = useCallback(async () => {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            showToast("Please login to access your dashboard", "error");
            window.location.href = "/auth/login";
            return;
        }

        const { data: bookingsData, error } = await supabase
            .from('bookings')
            .select(`
                *,
                profiles:planner_id (full_name, category)
            `)
            .eq('client_id', session.user.id)
            .order('event_date', { ascending: true });

        if (error) {
            console.error("Error fetching bookings:", error);
        } else {
            setBookings(bookingsData || []);
        }

        setIsLoading(false);
    }, [showToast]);

    useEffect(() => {
        fetchDashboardData();

        const supabase = createClient();
        const subscription = supabase
            .channel('client_bookings')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchDashboardData())
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [fetchDashboardData]);

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-foreground rounded-full animate-spin" />
        </div>
    );
    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">My Dashboard</h1>
                    <p className="text-gray-400 text-sm">Track your events and manage your bookings.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <Link href="/planners">
                        <Button variant="outline">Browse Planners</Button>
                    </Link>
                    <Button onClick={() => showToast("Event creation coming soon!", "info")}>
                        Create Event
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card id="bookings" className="md:col-span-2 space-y-6 scroll-mt-24" hover={false}>
                    <h3 className="text-2xl font-bold">Upcoming Events</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bookings.length === 0 ? (
                            <div className="text-center py-12 glass-panel rounded-3xl border-dashed border-foreground/10">
                                <Calendar className="mx-auto text-muted-foreground/20 mb-3" size={32} />
                                <p className="text-muted-foreground text-sm font-medium">No bookings found. Start by browsing planners!</p>
                            </div>
                        ) : bookings.map((booking, i) => (
                            <div key={i} className="p-6 glass-panel rounded-[2rem] border-foreground/5 space-y-4 border hover:border-blue-500/20 transition-all group relative overflow-hidden">
                                {booking.status === 'rejected' && (
                                    <div className="absolute top-0 right-0 p-2">
                                        <AlertCircle className="text-red-500/50" size={16} />
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black tracking-tight group-hover:text-blue-400 transition-colors">
                                        {booking.event_type}
                                    </h4>
                                    <p className="text-xs text-muted-foreground font-medium">with {booking.profiles?.full_name || "Planner"}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Date</p>
                                        <p className="text-sm font-bold text-foreground">{new Date(booking.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <div className="flex flex-col items-end justify-center">
                                        <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full ${booking.status === 'approved' || booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                            booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                'bg-red-500/10 text-red-500 border border-red-500/20'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>

                                {booking.status === 'rejected' && booking.decline_reason && (
                                    <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-1">
                                        <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Reason for declining</p>
                                        <p className="text-xs text-muted-foreground italic">"{booking.decline_reason}"</p>
                                    </div>
                                )}

                                {booking.status === 'approved' && (
                                    <div className="space-y-3">
                                        <BookingCountdown eventDate={booking.event_date} />
                                        <Link href="/dashboard/messages" className="block">
                                            <Button size="sm" className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/30 text-[10px] font-black uppercase tracking-widest">
                                                <MessageCircle size={12} className="mr-2" />
                                                Chat with Planner
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                                {booking.status === 'confirmed' && (
                                    <BookingCountdown eventDate={booking.event_date} />
                                )}
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="space-y-6" hover={false}>
                    <h3 className="text-2xl font-bold">Quick Links</h3>
                    <div className="space-y-3">
                        {['My Bookings', 'Saved Planners', 'Message History', 'Receipts', 'Settings'].map((link) => (
                            <button
                                key={link}
                                onClick={() => showToast(`${link} module coming soon!`, "info")}
                                className="w-full text-left p-4 glass-panel rounded-2xl border-foreground/5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
                            >
                                {link}
                            </button>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
