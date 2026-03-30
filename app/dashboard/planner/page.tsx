"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { Crown, Sparkles, ArrowUpRight, Check, Calendar, Image as ImageIcon, Star, TrendingUp, X, Send, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/Input";

interface StatItem {
    label: string;
    value: string;
    change: string;
    icon: any;
}

interface BookingItem {
    id: string;
    title: string;
    date: string;
    location: string;
    status: string;
    eventType: string;
    client_id: string;
    description?: string;
    budget?: string;
    decline_reason?: string;
}

interface PlanFeature {
    label: string;
    enabled: boolean;
}

export default function PlannerDashboard() {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState({
        name: "Starter",
        price: "₦0",
        period: "month",
        renewalDate: "N/A",
        daysLeft: 0,
        usage: {
            portfolioImages: { used: 0, total: 5 },
            featuredListing: false,
            analytics: false,
            directMessaging: false,
        },
    });

    const [stats, setStats] = useState([
        { label: "Bookings", value: "0", change: "+0", icon: Calendar },
        { label: "Profile Views", value: "0", change: "+0%", icon: TrendingUp },
        { label: "Revenue", value: "₦0", change: "+₦0", icon: Sparkles },
        { label: "Rating", value: "0.0", change: "★", icon: Star },
    ]);

    const [recentBookings, setRecentBookings] = useState<BookingItem[]>([]);
    const [recentMessages, setRecentMessages] = useState<any[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
    const [declineReason, setDeclineReason] = useState("");
    const [showDeclineInput, setShowDeclineInput] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState<Record<string, boolean>>({});

    const logError = (context: string, error: any) => {
        console.error(`${context} (Raw):`, error);
        try {
            const errorDetails: any = {
                typeof: typeof error,
                isEvent: typeof Event !== 'undefined' && error instanceof Event,
                isError: error instanceof Error,
                constructor: error?.constructor?.name,
                message: error?.message || (error as any)?.error_description,
                code: error?.code || error?.status,
                details: error?.details,
                hint: error?.hint,
            };

            if (error && typeof error === 'object') {
                Object.getOwnPropertyNames(error).forEach(key => {
                    if (!errorDetails.hasOwnProperty(key)) {
                        errorDetails[key] = (error as any)[key];
                    }
                });
            }
            console.error(`${context} (Detailed):`, errorDetails);
        } catch (err) {
            console.error(`${context} (Logging helper failed):`, err);
        }
    };

    const fetchDashboardData = useCallback(async (uid: string) => {
        const supabase = createClient();

        // 1. Fetch Profile & Subscription Info
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*, plan_id')
            .eq('id', uid)
            .single();

        if (profileError) logError("Error fetching planner profile", profileError);

        // 2. Fetch Platform Settings for plan details
        const { data: settings } = await supabase
            .from('platform_settings')
            .select('subscription_plans')
            .eq('id', 'default')
            .single();

        // 3. Fetch Portfolio Image Count
        let imageCount = 0;
        const { data: plannerEvents } = await supabase
            .from('events')
            .select('id')
            .eq('planner_id', uid);

        if (plannerEvents?.length) {
            const eventIds = plannerEvents.map((e: any) => e.id);
            const { count: mediaCount } = await supabase
                .from('album_media')
                .select('id', { count: 'exact', head: true })
                .in('event_id', eventIds);
            imageCount = mediaCount || 0;
        }

        if (profile && settings) {
            const plans = settings.subscription_plans || [];
            const userPlan = plans.find((p: any) => p.id === (profile.plan_id || 'starter')) || plans[0];

            if (userPlan) {
                setCurrentPlan({
                    name: userPlan.name,
                    price: `₦${Number(userPlan.price).toLocaleString()}`,
                    period: userPlan.period,
                    renewalDate: profile.subscription_end_date ? new Date(profile.subscription_end_date).toLocaleDateString() : 'N/A',
                    daysLeft: profile.subscription_end_date ? Math.max(0, Math.ceil((new Date(profile.subscription_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0,
                    usage: {
                        portfolioImages: {
                            used: imageCount || 0,
                            total: userPlan.imageLimit === -1 ? 999 : (userPlan.imageLimit || (userPlan.id === 'starter' ? 5 : 25))
                        },
                        featuredListing: userPlan.features.some((f: string) => f.toLowerCase().includes('featured')),
                        analytics: userPlan.features.some((f: string) => f.toLowerCase().includes('analytics')),
                        directMessaging: userPlan.features.some((f: string) => f.toLowerCase().includes('messaging')),
                    }
                });
            }
        }

        // 4. Fetch Stats
        const { count: bookingsCount } = await supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('planner_id', uid);
        const { count: viewsCount } = await supabase.from('profile_views').select('id', { count: 'exact', head: true }).eq('profile_id', uid);

        setStats([
            { label: "Bookings", value: bookingsCount?.toString() || "0", change: "+0", icon: Calendar },
            { label: "Profile Views", value: viewsCount?.toString() || "0", change: "+0%", icon: TrendingUp },
            { label: "Revenue", value: "₦0", change: "+₦0", icon: Sparkles },
            { label: "Rating", value: profile?.rating?.toString() || "0.0", change: "★", icon: Star },
        ]);

        // 5. Fetch Recent Bookings
        const { data: bData } = await supabase
            .from('bookings')
            .select('*, profiles:client_id(full_name, location)')
            .eq('planner_id', uid)
            .order('created_at', { ascending: false })
            .limit(5);

        if (bData) {
            setRecentBookings(bData.map((b: any) => ({
                id: b.id,
                title: `Inquiry from ${b.profiles?.full_name || 'Client'}`,
                date: new Date(b.created_at).toLocaleDateString(),
                location: b.profiles?.location || "N/A",
                status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
                eventType: b.event_type,
                client_id: b.client_id,
                description: b.description,
                budget: b.budget
            })));
        }

        // 6. Fetch Conversations
        const { data: cData } = await supabase
            .from('conversations')
            .select('*, profiles:client_id(full_name, avatar_url)')
            .eq('planner_id', uid)
            .order('last_message_at', { ascending: false })
            .limit(3);

        if (cData) {
            setRecentMessages(cData.map(c => ({
                id: c.id,
                name: c.profiles?.full_name || "Client",
                lastMessage: c.last_message,
                avatar: c.profiles?.avatar_url,
                time: c.last_message_at
            })));

            const { data: unreads } = await supabase.from('messages').select('conversation_id').eq('is_read', false).neq('sender_id', uid);
            if (unreads) {
                const unreadMap: Record<string, boolean> = {};
                unreads.forEach(u => unreadMap[u.conversation_id] = true);
                setUnreadMessages(unreadMap);
            }
        }

        setIsLoading(false);
    }, []);

    const handleStatusUpdate = async (bookingId: string, status: string, reason?: string) => {
        setIsUpdating(true);
        const supabase = createClient();

        const { error } = await supabase
            .from('bookings')
            .update({
                status: status.toLowerCase(),
                decline_reason: reason || null
            })
            .eq('id', bookingId);

        if (error) {
            logError("Error updating booking status", error);
            showToast("Failed to update booking", "error");
        } else {
            showToast(`Booking ${status} successfully`, "success");

            // Optimistic update
            setRecentBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, status: status.charAt(0).toUpperCase() + status.slice(1) } : b
            ));

            setSelectedBooking(null);
            setDeclineReason("");
            setShowDeclineInput(false);

            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.id) fetchDashboardData(session.user.id);
        }
        setIsUpdating(false);
    };

    useEffect(() => {
        const supabase = createClient();
        let userId: string | null = null;

        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            userId = session?.user?.id || null;
            if (userId) {
                fetchDashboardData(userId);

                const bookingsSub = supabase
                    .channel('planner_bookings')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `planner_id=eq.${userId}` }, () => fetchDashboardData(userId!))
                    .subscribe();

                const convosSub = supabase
                    .channel('planner_convos')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `planner_id=eq.${userId}` }, () => fetchDashboardData(userId!))
                    .subscribe();

                return () => {
                    supabase.removeChannel(bookingsSub);
                    supabase.removeChannel(convosSub);
                };
            }
        };

        init();
    }, [fetchDashboardData]);

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 glass-panel p-6 md:p-8 rounded-[2rem] border-white/5 bg-white/[0.02]">
                <div className="flex-1 min-w-0">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 truncate">Planner Dashboard</h1>
                    <p className="text-gray-400 text-xs md:text-sm truncate">Manage your portfolio, bookings, and clients.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <Link href="/dashboard/planner/profile" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full h-12 rounded-2xl font-bold border-white/10 hover:bg-white/5">
                            Edit Profile Handle
                        </Button>
                    </Link>
                    <Link href="/dashboard/planner/portfolio" className="w-full sm:w-auto">
                        <Button className="bg-blue-600 hover:bg-blue-700 w-full h-12 rounded-2xl font-bold shadow-lg shadow-blue-600/20">
                            Manage Portfolio
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat: StatItem, i: number) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={i} className={`space-y-2 group ${isLoading ? 'animate-pulse' : ''}`}>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
                                <Icon size={14} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-2xl font-bold">{stat.value}</span>
                                <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-400' : 'text-gray-500'}`}>{stat.change}</span>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* My Subscription Card */}
            <Card className="p-0 overflow-hidden" hover={false}>
                <div className="relative">
                    {/* Gradient header */}
                    <div className="absolute inset-0 h-32 bg-gradient-to-r from-blue-600/20 via-cyan-600/10 to-transparent" />
                    <div className="relative p-6 md:p-8 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Sparkles size={24} className="text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-bold">My Subscription</h3>
                                        <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                            {currentPlan.name}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {currentPlan.price}/{currentPlan.period} • Renews {currentPlan.renewalDate}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <Link href="/pricing" className="flex-1 md:flex-initial">
                                    <Button variant="outline" size="sm" className="w-full group">
                                        View Plans
                                        <ArrowUpRight size={14} className="inline ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </Button>
                                </Link>
                                <Link href="/payout?tier=elite" className="flex-1 md:flex-initial">
                                    <Button size="sm" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none hover:shadow-lg hover:shadow-amber-500/25 group">
                                        <Crown size={14} className="inline mr-1" />
                                        Upgrade to Elite
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Usage Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                            {/* Portfolio Images Usage */}
                            <div className="p-4 glass-panel rounded-2xl border-white/5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <ImageIcon size={14} className="text-blue-400" />
                                    <span className="text-xs font-bold text-gray-400">Portfolio Images</span>
                                </div>
                                <p className="text-lg font-bold">
                                    {currentPlan.usage.portfolioImages.used}
                                    <span className="text-gray-500 font-normal text-sm">/{currentPlan.usage.portfolioImages.total}</span>
                                </p>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${(currentPlan.usage.portfolioImages.used / currentPlan.usage.portfolioImages.total) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Feature Checks */}
                            {[
                                { label: "Featured Listing", enabled: currentPlan.usage.featuredListing },
                                { label: "Analytics", enabled: currentPlan.usage.analytics },
                                { label: "Direct Messaging", enabled: currentPlan.usage.directMessaging },
                            ].map((feature: PlanFeature, i: number) => (
                                <div key={i} className="p-4 glass-panel rounded-2xl border-white/5 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${feature.enabled ? "bg-green-500/10" : "bg-white/5"}`}>
                                        <Check size={14} className={feature.enabled ? "text-green-400" : "text-gray-600"} />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-400">{feature.label}</span>
                                        <p className={`text-sm font-bold ${feature.enabled ? "text-green-400" : "text-gray-600"}`}>
                                            {feature.enabled ? "Active" : "Inactive"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Renewal Notice */}
                        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Calendar size={16} className="text-blue-400" />
                                <span className="text-sm text-gray-300">
                                    Your subscription renews in <span className="font-bold text-white">{currentPlan.daysLeft} days</span>
                                </span>
                            </div>
                            <button
                                onClick={() => showToast("Manage billing coming soon!", "info")}
                                className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Manage Billing
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card id="bookings" className="space-y-6" hover={false}>
                    <h3 className="text-xl font-bold">Recent Bookings</h3>
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 bg-foreground/5 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : recentBookings.length === 0 ? (
                            <div className="text-center py-12 glass-panel rounded-3xl border-dashed border-foreground/10">
                                <Calendar className="mx-auto text-muted-foreground/20 mb-3" size={32} />
                                <p className="text-muted-foreground text-sm font-medium">No recent bookings found.</p>
                            </div>
                        ) : recentBookings.map((booking: BookingItem, i: number) => (
                            <button
                                key={i}
                                onClick={() => setSelectedBooking(booking)}
                                className="w-full flex items-center justify-between p-4 glass-panel rounded-2xl border-foreground/5 hover:border-blue-500/30 hover:bg-foreground/[0.02] transition-all text-left"
                            >
                                <div>
                                    <p className="font-bold text-foreground">{booking.title}</p>
                                    <p className="text-xs text-muted-foreground">{booking.date} • {booking.location}</p>
                                </div>
                                <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${booking.status.toLowerCase() === 'approved' ? 'bg-green-500/10 text-green-400' :
                                    booking.status.toLowerCase() === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                        'bg-red-500/10 text-red-400'
                                    }`}>
                                    {booking.status}
                                </span>
                            </button>
                        ))}
                    </div>
                </Card>

                <Card className="space-y-6" hover={false}>
                    <h3 className="text-xl font-bold">Platform Messages</h3>
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-16 bg-foreground/5 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : recentMessages.length === 0 ? (
                            <div className="text-center py-12 glass-panel rounded-3xl border-dashed border-foreground/10">
                                <MessageCircle className="mx-auto text-muted-foreground/20 mb-3" size={32} />
                                <p className="text-muted-foreground text-sm font-medium">No messages yet.</p>
                            </div>
                        ) : recentMessages.map((msg, i) => (
                            <Link key={i} href="/dashboard/messages" className="flex items-center gap-4 p-4 glass-panel rounded-2xl border-foreground/5 hover:border-blue-500/30 hover:bg-foreground/[0.02] transition-all relative">
                                {unreadMessages[msg.id] && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                                )}
                                <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center font-bold overflow-hidden border border-foreground/10">
                                    {msg.avatar ? <img src={msg.avatar} alt="" className="w-full h-full object-cover" /> : msg.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-foreground text-sm">{msg.name}</p>
                                        <span className="text-[10px] text-muted-foreground">{new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground italic line-clamp-1 truncate">{msg.lastMessage || "No messages yet..."}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Booking Detail Dialog */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
                    <Card className="relative w-full max-w-lg p-8 space-y-8 animate-in zoom-in-95 duration-200 border-foreground/10 shadow-2xl bg-background" hover={false}>
                        <button onClick={() => setSelectedBooking(null)} className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-full transition-all">
                            <X size={20} />
                        </button>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-2xl">
                                    <Calendar className="text-blue-500" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight">{selectedBooking.eventType}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedBooking.title}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 py-6 border-y border-foreground/5">
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Date</p>
                                    <p className="text-sm font-bold">{selectedBooking.date}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Location</p>
                                    <p className="text-sm font-bold">{selectedBooking.location}</p>
                                </div>
                                {selectedBooking.budget && (
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Budget</p>
                                        <p className="text-sm font-bold text-blue-500">{selectedBooking.budget}</p>
                                    </div>
                                )}
                                {selectedBooking.description && (
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Event Details</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{selectedBooking.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedBooking.status.toLowerCase() === 'pending' && (
                            <div className="space-y-4">
                                {showDeclineInput ? (
                                    <div className="space-y-4 animate-in slide-in-from-top-2">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Optional Reason for Declining</p>
                                            <Input
                                                placeholder="e.g., Not available on this date..."
                                                value={declineReason}
                                                onChange={(e) => setDeclineReason(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <Button variant="outline" className="flex-1" onClick={() => setShowDeclineInput(false)} disabled={isUpdating}>
                                                Cancel
                                            </Button>
                                            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => handleStatusUpdate(selectedBooking.id, 'rejected', declineReason)} disabled={isUpdating}>
                                                Confirm Decline
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3">
                                        <Button variant="outline" className="flex-1 border-red-500/20 text-red-400 hover:bg-red-500/5" onClick={() => setShowDeclineInput(true)} disabled={isUpdating}>
                                            Decline Request
                                        </Button>
                                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleStatusUpdate(selectedBooking.id, 'approved')} disabled={isUpdating}>
                                            Accept Booking
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedBooking.status.toLowerCase() === 'approved' && (
                            <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/20 rounded-lg">
                                        <Check size={16} className="text-green-500" />
                                    </div>
                                    <p className="text-xs font-bold text-green-500 uppercase tracking-wider">Booking Accepted</p>
                                </div>
                                <Link href="/dashboard/messages">
                                    <Button size="sm" variant="outline" className="text-[10px] uppercase font-bold border-green-500/20 text-green-500 hover:bg-green-500/10">
                                        Open Chat
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
