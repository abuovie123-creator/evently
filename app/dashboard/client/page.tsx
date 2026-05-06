"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { Calendar, MessageCircle, AlertCircle, Star, CheckCircle2, Bookmark, User } from "lucide-react";
import { BookingCountdown } from "@/components/BookingCountdown";
import { NotificationBell } from "@/components/NotificationBell";

export default function ClientDashboard() {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState<any[]>([]);
    const [profileName, setProfileName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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

        const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', session.user.id)
            .single();

        if (profileData) {
            setProfileName(profileData.full_name || "");
            setAvatarUrl(profileData.avatar_url);
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
            // Optimistically update the exact booking to show 'Reviewed Event' state immediately
            setBookings(prev => prev.map(b =>
                b.id === bookingId
                    ? { ...b, reviews: [{ rating, comment, id: "temp-optimistic-id" }] }
                    : b
            ));

            setReviewingBookingId(null);
            setRating(5);
            setComment("");

            await fetchDashboardData();
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
        <div className="min-h-screen flex items-center justify-center bg-cream/30">
            <div className="w-10 h-10 border-2 border-charcoal/5 border-t-gold rounded-none animate-spin" />
        </div>
    );
    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            {/* Top Navigation Bar - Hidden on Mobile (provided by sidebar top-bar) */}
            <div className="hidden md:flex flex-row justify-between items-center pb-12 w-full border-b border-om-border/20">
                <div className="text-2xl font-serif text-charcoal tracking-widest uppercase">
                    EVENTLY<span className="text-gold">.</span>
                </div>
                <nav className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B5E4E]">
                    <Link href="/portfolio" className="hover:text-charcoal transition-colors">Portfolio</Link>
                    <Link href="/planners" className="hover:text-charcoal transition-colors">Browse Planners</Link>
                    <Link href="/events" className="hover:text-charcoal transition-colors">Event Gallery</Link>
                </nav>
                <div className="flex gap-6 items-center text-charcoal">
                    <button className="hover:text-gold transition-colors"><Bookmark size={18} /></button>
                    <Link href="/dashboard/client/settings" className="w-8 h-8 rounded-none border border-om-border/40 overflow-hidden flex items-center justify-center text-charcoal hover:border-gold transition-colors bg-cream">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User size={16} />
                        )}
                    </Link>
                </div>
            </div>

            {/* Header Section - Well aligned to the left */}
            <div className="space-y-4 pt-8 md:pt-2">
                <h1 className="text-4xl md:text-6xl font-serif italic text-charcoal leading-tight">Welcome back, {profileName.split(' ')[0] || "Client"}.</h1>
                <p className="text-[11px] font-sans uppercase tracking-[0.15em] text-muted-foreground max-w-2xl opacity-70">
                    The Estate has curated new architectural inspirations and updated your consultation status for the heritage gala.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 pt-4">
                {/* Left/Center Column: My Favorites */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex justify-between items-center border-b border-om-border/50 pb-4">
                        <h2 className="text-3xl font-serif text-charcoal">My Favorites</h2>
                        <Link href="/planners" className="text-[10px] font-bold uppercase tracking-widest text-[#6B5E4E] hover:text-charcoal border-b border-transparent hover:border-charcoal transition-all">View All Collections</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                        {savedPlanners.length === 0 ? (
                            <div className="text-center py-16 bg-surface/50 rounded-none border border-om-border/30 col-span-1 md:col-span-2">
                                <Star className="mx-auto text-muted-foreground/30 mb-4" size={32} />
                                <p className="text-[#6B5E4E] font-serif italic text-lg opacity-70">No collections saved yet.</p>
                            </div>
                        ) : savedPlanners.map((saved, i) => (
                            <Link href={`/planner/${saved.profiles?.username || saved.profiles?.id}`} key={i} className="group block space-y-4">
                                <div className="relative aspect-[4/5] overflow-hidden bg-surface border border-om-border/20">
                                    <img src={saved.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${saved.profiles?.id}`} alt={saved.profiles?.full_name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                    <div className="absolute top-4 right-4 bg-cream p-3 rounded-none border border-gold/20 text-gold shadow-sm transition-transform group-hover:scale-110">
                                        <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-accent text-opacity-80">{saved.profiles?.category || "ESTATE SERIES"}</p>
                                    <h3 className="text-xl font-serif text-charcoal group-hover:text-gold transition-colors">{saved.profiles?.full_name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right Column: Booking Requests */}
                <div className="lg:col-span-1 border border-om-border/30 bg-surface p-6 md:p-8 space-y-8 h-fit shadow-sm">
                    <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent/70 italic">Booking Requests</h3>

                    <div className="space-y-8">
                        {bookings.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-[#6B5E4E] font-serif italic text-sm">No active bookings.</p>
                            </div>
                        ) : bookings.map((booking, i) => (
                            <div key={i} className="space-y-4 group border-b border-om-border/40 pb-8 last:border-0 last:pb-0">
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-forest flex items-center justify-center text-cream shrink-0 group-hover:bg-charcoal transition-colors">
                                        <Calendar size={14} />
                                    </div>
                                    <div className="space-y-1.5 w-full">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-serif text-[17px] leading-tight text-charcoal group-hover:text-forest transition-colors">{booking.event_type}</h4>
                                            <span className={`px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${booking.status === 'approved' || booking.status === 'confirmed' ? 'bg-[#DDE5DC] text-forest' : booking.status === 'pending' ? 'bg-[#E8D9A8]/40 text-[#8B7355]' : 'bg-red-900/10 text-red-900'}`}>
                                                {booking.status === 'approved' ? 'ACCEPTED' : booking.status}
                                            </span>
                                        </div>
                                        <p className="text-xs font-sans text-muted-foreground/90">{new Date(booking.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {booking.profiles?.full_name || "Planner"}</p>
                                    </div>
                                </div>

                                {booking.status === 'approved' || booking.status === 'confirmed' ? (
                                    <div className="pl-14 space-y-3">
                                        {new Date(booking.event_date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? (
                                            booking.reviews && booking.reviews.length > 0 ? (
                                                <div className="text-[11px] italic text-forest flex items-center gap-1.5 font-serif">
                                                    <Star size={10} className="fill-forest" />
                                                    Reviewed ({booking.reviews[0].rating}/5)
                                                </div>
                                            ) : reviewingBookingId === booking.id ? (
                                                <div className="space-y-3 pt-2">
                                                    <div className="flex gap-1.5 text-gold">
                                                        {[1, 2, 3, 4, 5].map(v => <Star key={v} size={14} className={`cursor-pointer ${v <= rating ? 'fill-gold' : 'text-om-border'}`} onClick={(e) => { e.preventDefault(); setRating(v); }} />)}
                                                    </div>
                                                    <textarea className="w-full text-xs p-3 bg-transparent border border-om-border/70 focus:border-gold transition-colors focus:outline-none placeholder:text-muted-foreground/50 resize-none" rows={2} value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience..."></textarea>
                                                    <div className="flex gap-4">
                                                        <button className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-charcoal transition-colors" onClick={() => setReviewingBookingId(null)}>Cancel</button>
                                                        <button className="text-[10px] uppercase tracking-widest font-bold text-charcoal hover:text-forest transition-colors" disabled={isSubmittingReview} onClick={() => handleSubmitReview(booking.id, booking.planner_id)}>{isSubmittingReview ? "Submitting..." : "Submit"}</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={() => setReviewingBookingId(booking.id)} className="text-[9px] uppercase font-bold tracking-widest text-[#8B7355] hover:text-charcoal transition-colors border-b border-[#8B7355]/30 hover:border-charcoal pb-0.5 inline-block">Leave Review</button>
                                            )
                                        ) : (
                                            <Link href="/dashboard/messages" className="text-[9px] uppercase font-bold tracking-widest text-[#8B7355] hover:text-charcoal transition-colors border-b border-[#8B7355]/30 hover:border-charcoal pb-0.5 inline-block">Consultation Open</Link>
                                        )}
                                    </div>
                                ) : booking.status === 'rejected' && booking.decline_reason && (
                                    <div className="pl-14">
                                        <p className="text-[10px] text-red-900/70 italic font-serif">DECLINED: "{booking.decline_reason}"</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
