"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function ClientDashboard() {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                showToast("Please login to access your dashboard", "error");
                window.location.href = "/auth/login";
                return;
            }

            // Fetch Bookings
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
        };
        fetchDashboardData();
    }, []);

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
                <Card className="md:col-span-2 space-y-6" hover={false}>
                    <h3 className="text-2xl font-bold">Upcoming Events</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bookings.length === 0 ? (
                            <p className="text-gray-500 italic py-8">No bookings found. Start by browsing planners!</p>
                        ) : bookings.map((booking, i) => (
                            <div key={i} className="p-6 glass-panel rounded-[2rem] border-white/5 space-y-4 border hover:border-white/10 transition-colors cursor-pointer group">
                                <h4 className="text-xl font-bold group-hover:text-blue-400 transition-colors">
                                    {booking.event_type} with {booking.profiles?.full_name || "Planner"}
                                </h4>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Date</p>
                                    <p className="text-sm">{new Date(booking.event_date).toLocaleDateString()}</p>
                                </div>
                                <span className={`inline-block px-4 py-1.5 text-xs font-bold rounded-full ${booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                                    booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                        'bg-red-500/10 text-red-400'
                                    }`}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
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
                                className="w-full text-left p-4 glass-panel rounded-2xl border-white/5 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                {link}
                            </button>
                        ))}
                    </div>
                </Card>
            </div>
            );
}
