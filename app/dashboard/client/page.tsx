"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { Calendar, MessageCircle, AlertCircle, Star, CheckCircle2 } from "lucide-react";
import { BookingCountdown } from "@/components/BookingCountdown";

export default function ClientDashboard() {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState<any[]>([]);
    const [savedPlanners, setSavedPlanners] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"bookings" | "saved">("bookings");

    // Review State
    const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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
                profiles:planner_id (full_name, category),
                reviews (id, rating, comment)
            `)
            .eq('client_id', session.user.id)
            .order('event_date', { ascending: true });

        if (error) {
            console.error("Error fetching bookings:", error);
        } else {
            setBookings(bookingsData || []);
        }

        const { data: savedData, error: savedError } = await supabase
            .from('saved_planners')
            .select(`
                id,
                profiles:planner_id (id, username, full_name, category, avatar_url, location)
            `)
            .eq('client_id', session.user.id);

        if (!savedError) {
            setSavedPlanners(savedData || []);
        }

        setIsLoading(false);
    }, [showToast]);

    const handleSubmitReview = async (bookingId: string, plannerId: string) => {
        setIsSubmittingReview(true);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        try {
            if (!session) throw new Error("Not authenticated");

            const { error } = await supabase.from('reviews').insert({
                client_id: session.user.id,
                planner_id: plannerId,
                booking_id: bookingId,
                rating,
                comment
            });

            if (error) {
                if (error.code === '23505') throw new Error("You have already reviewed this booking.");
                throw error;
            }
            showToast("Review submitted successfully!", "success");
            setReviewingBookingId(null);
            setRating(5);
            setComment("");
            fetchDashboardData();
        } catch (error: any) {
            console.error("Review error:", error);
            showToast(error.message || "Failed to submit review", "error");
        } finally {
            setIsSubmittingReview(false);
        }
    };

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
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card id="bookings" className="md:col-span-2 space-y-6 scroll-mt-24" hover={false}>
                    <div className="flex gap-6 border-b border-foreground/10 pb-4">
                        <button
                            onClick={() => setActiveTab("bookings")}
                            className={`text-2xl font-bold transition-colors ${activeTab === 'bookings' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Upcoming Events
                        </button>
                        <button
                            onClick={() => setActiveTab("saved")}
                            className={`text-2xl font-bold transition-colors ${activeTab === 'saved' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Saved Planners
                        </button>
                    </div>

                    {activeTab === 'bookings' ? (
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

                                    {(booking.status === 'approved' || booking.status === 'confirmed') && (
                                        <div className="space-y-3">
                                            {new Date(booking.event_date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? (
                                                booking.reviews && booking.reviews.length > 0 ? (
                                                    <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-xl space-y-2 relative">
                                                        <div className="flex items-center gap-1 text-green-500">
                                                            <CheckCircle2 size={12} />
                                                            <span className="text-[9px] uppercase font-black tracking-widest text-green-400">Reviewed Event</span>
                                                        </div>
                                                        <div className="flex text-yellow-500">
                                                            {[...Array(5)].map((_, idx) => (
                                                                <Star key={idx} size={12} className={idx < booking.reviews[0].rating ? "fill-yellow-500" : "opacity-30"} />
                                                            ))}
                                                        </div>
                                                        {booking.reviews[0].comment && (
                                                            <p className="text-xs text-muted-foreground italic">"{booking.reviews[0].comment}"</p>
                                                        )}
                                                    </div>
                                                ) : reviewingBookingId === booking.id ? (
                                                    <div className="p-4 bg-foreground/[0.02] border border-foreground/5 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
                                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-foreground">Rate your experience</h5>
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((starVal) => (
                                                                <button
                                                                    key={starVal}
                                                                    onClick={(e) => { e.preventDefault(); setRating(starVal); }}
                                                                    className={`p-1 transition-transform hover:scale-110 ${starVal <= rating ? 'text-yellow-500' : 'text-gray-600'}`}
                                                                >
                                                                    <Star size={20} className={starVal <= rating ? "fill-yellow-500" : ""} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <textarea
                                                            className="w-full bg-background border border-foreground/10 rounded-xl p-3 text-sm focus:border-blue-500 focus:outline-none resize-none mx-auto block"
                                                            rows={2}
                                                            placeholder="Share your thoughts..."
                                                            value={comment}
                                                            onChange={(e) => setComment(e.target.value)}
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button onClick={() => setReviewingBookingId(null)} variant="outline" size="sm" className="w-full text-xs" disabled={isSubmittingReview}>Cancel</Button>
                                                            <Button onClick={() => handleSubmitReview(booking.id, booking.planner_id)} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold" size="sm" disabled={isSubmittingReview}>
                                                                {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Button onClick={() => setReviewingBookingId(booking.id)} size="sm" className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 text-[10px] font-black uppercase tracking-widest">
                                                        <Star size={12} className="mr-2 fill-yellow-500" /> Leave a Review
                                                    </Button>
                                                )
                                            ) : (
                                                <>
                                                    <BookingCountdown eventDate={booking.event_date} />
                                                    {booking.status === 'approved' && (
                                                        <Link href="/dashboard/messages" className="block">
                                                            <Button size="sm" className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/30 text-[10px] font-black uppercase tracking-widest">
                                                                <MessageCircle size={12} className="mr-2" />
                                                                Chat with Planner
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {savedPlanners.length === 0 ? (
                                <div className="text-center py-12 glass-panel rounded-3xl border-dashed border-foreground/10 col-span-1 md:col-span-2">
                                    <Star className="mx-auto text-muted-foreground/20 mb-3" size={32} />
                                    <p className="text-muted-foreground text-sm font-medium">No saved planners yet.</p>
                                </div>
                            ) : savedPlanners.map((saved, i) => (
                                <Link href={`/planner/${saved.profiles?.username || saved.profiles?.id}`} key={i}>
                                    <Card className="p-4 hover:border-blue-500/30 transition-all flex items-center gap-4 bg-background border-foreground/5 shadow-sm group">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-foreground/10 bg-foreground/5">
                                            <img src={saved.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${saved.profiles?.id}`} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-base tracking-tight group-hover:text-blue-400 transition-colors">{saved.profiles?.full_name}</h4>
                                            <p className="text-xs text-muted-foreground">{saved.profiles?.category}</p>
                                            <p className="text-[10px] text-blue-500 mt-1 uppercase tracking-widest font-bold">{saved.profiles?.location}</p>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </Card>

                <Card className="space-y-6" hover={false}>
                    <h3 className="text-2xl font-bold">Quick Links</h3>
                    <div className="space-y-3">
                        {['My Bookings', 'Message History', 'Receipts', 'Settings'].map((link) => (
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
