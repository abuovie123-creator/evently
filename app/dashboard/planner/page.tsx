"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { Crown, Sparkles, ArrowUpRight, Check, Calendar, Image as ImageIcon, Star, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

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

    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [recentMessages, setRecentMessages] = useState<any[]>([]);

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

    useEffect(() => {
        const fetchPlannerData = async () => {
            const supabase = createClient();

            // Get current user session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                showToast("Please login to access your dashboard", "error");
                window.location.href = "/auth/login";
                return;
            }

            const userId = session.user.id;

            // Fetch Profile & Subscription Info
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*, plan_id')
                .eq('id', userId)
                .single();

            if (profileError) {
                logError("Error fetching planner profile", profileError);
            }

            // Fetch Platform Settings for plan details
            const { data: settings, error: settingsError } = await supabase
                .from('platform_settings')
                .select('subscription_plans')
                .eq('id', 'default')
                .single();

            if (settingsError && settingsError.code !== 'PGRST116') {
                logError("Error fetching platform settings", settingsError);
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
                            portfolioImages: { used: 0, total: userPlan.id === 'starter' ? 5 : userPlan.id === 'pro' ? 25 : 999 },
                            featuredListing: userPlan.features.some((f: string) => f.toLowerCase().includes('featured')),
                            analytics: userPlan.features.some((f: string) => f.toLowerCase().includes('analytics')),
                            directMessaging: userPlan.features.some((f: string) => f.toLowerCase().includes('messaging')),
                        }
                    });
                }
            }

            // Fetch Real Portfolio Image Count
            const { count: imageCount } = await supabase
                .from('album_media')
                .select('*', { count: 'exact', head: true })
                .eq('media_type', 'image'); // This would ideally filter by events belonging to this planner

            // Fetch Real Stats (Mocked for now until tables are populated)
            // In a real app, these would come from bookings/analytics tables
            setStats([
                { label: "Bookings", value: "0", change: "+0", icon: Calendar },
                { label: "Profile Views", value: "0", change: "+0%", icon: TrendingUp },
                { label: "Revenue", value: "₦0", change: "+₦0", icon: Sparkles },
                { label: "Rating", value: profile?.rating?.toString() || "0.0", change: "★", icon: Star },
            ]);

            // Fetch Recent Bookings
            const { data: bookings } = await supabase
                .from('bank_transfers') // Temporary use to show activity or if we have a bookings table
                .select('*')
                .eq('profile_id', userId)
                .order('created_at', { ascending: false })
                .limit(3);

            if (bookings) {
                setRecentBookings(bookings.map(b => ({
                    title: `Plan Upgrade: ${b.target_tier}`,
                    date: new Date(b.created_at).toLocaleDateString(),
                    location: "Online",
                    status: b.status.charAt(0).toUpperCase() + b.status.slice(1)
                })));
            }

            setIsLoading(false);
        };

        fetchPlannerData();
    }, []);

    return (
        <main className="min-h-screen p-6 md:p-8 pt-24 md:pt-32 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">Planner Dashboard</h1>
                    <p className="text-gray-400 text-sm">Manage your portfolio, bookings, and clients.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <Button variant="outline" onClick={() => showToast("Portfolio editor coming soon!", "info")}>
                        Edit Portfolio
                    </Button>
                    <Button onClick={() => showToast("Booking management coming soon!", "info")}>
                        Manage Bookings
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
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
                            ].map((feature, i) => (
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
                <Card className="space-y-6" hover={false}>
                    <h3 className="text-xl font-bold">Recent Bookings</h3>
                    <div className="space-y-4">
                        {isLoading ? (
                            <p className="text-gray-500 text-sm animate-pulse">Loading bookings...</p>
                        ) : recentBookings.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">No recent bookings found.</p>
                        ) : recentBookings.map((booking, i) => (
                            <div key={i} className="flex items-center justify-between p-4 glass-panel rounded-2xl border-white/5">
                                <div>
                                    <p className="font-bold">{booking.title}</p>
                                    <p className="text-xs text-gray-500">{booking.date} • {booking.location}</p>
                                </div>
                                <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${booking.status === 'Approved' ? 'bg-green-500/10 text-green-400' :
                                    booking.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                        'bg-red-500/10 text-red-400'
                                    }`}>
                                    {booking.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="space-y-6" hover={false}>
                    <h3 className="text-xl font-bold">Platform Messages</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 glass-panel rounded-2xl border-white/5">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold">C</div>
                                <div>
                                    <p className="font-bold">Client Message</p>
                                    <p className="text-xs text-gray-500 italic line-clamp-1">"Hi, are you available for a corporate event in April..."</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </main>
    );
}
