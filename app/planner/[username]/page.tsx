"use client";
import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Star, X, MessageSquare, Share2, Instagram, Twitter, Linkedin, Facebook, Mail, Heart, Award, Calendar, Users, ChevronDown, ShieldCheck } from "lucide-react";

interface PlannerProfile {
    id: string;
    name: string;
    category: string;
    location: string;
    bio: string;
    rating: number;
    reviews: number;
    avatar: string;
    stats: {
        events: number;
        years: number;
        clients: number;
    };
    username: string;
    full_name: string;
    completed_events: number;
    years_experience: number;
    satisfied_clients: number;
    review_count: number;
    avatar_url: string;
    cover_image_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    linkedin_url?: string;
    facebook_url?: string;
    public_email?: string;
    unavailable_dates?: string[];
    verification_status?: string;
}

interface Album {
    id: string;
    title: string;
    date: string;
    image: string;
    slug: string;
}

export default function PlannerProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = use(params);
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [planner, setPlanner] = useState<PlannerProfile | null>(null);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [hasApprovedBooking, setHasApprovedBooking] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const [isUserAdmin, setIsUserAdmin] = useState(false);
    const [isTogglingSave, setIsTogglingSave] = useState(false);

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingData, setBookingData] = useState({
        eventDate: "",
        eventType: "Wedding",
        message: ""
    });
    const [showAllEvents, setShowAllEvents] = useState(false);

    const logError = (context: string, error: any) => {
        console.error(`${context} (Raw):`, error);
        try {
            const errorDetails: any = {
                typeof: typeof error,
                isEvent: typeof Event !== 'undefined' && error instanceof Event,
                isError: error instanceof Error,
                constructor: error?.constructor?.name,
            };
            if (error && typeof error === 'object') {
                Object.getOwnPropertyNames(error).forEach(key => {
                    errorDetails[key] = (error as any)[key];
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

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select(`*, planners(unavailable_dates)`)
                .eq('username', username)
                .single();

            if (profileError || !profile) {
                logError("Profile not found", profileError);
                setIsLoading(false);
                return;
            }

            const { data: reviewsData } = await supabase
                .from('reviews')
                .select('rating')
                .eq('planner_id', profile.id);

            const reviewCount = reviewsData?.length || 0;
            const avgRating = reviewCount > 0
                ? parseFloat((reviewsData!.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount).toFixed(1))
                : profile.rating || 0.0;

            const { count: clientsCount } = await supabase
                .from('bookings')
                .select('id', { count: 'exact', head: true })
                .eq('planner_id', profile.id)
                .in('status', ['approved', 'confirmed']);

            setPlanner({
                ...profile,
                name: profile.full_name || username,
                category: profile.category || "Wedding & Event Planner",
                location: profile.location || "Nigeria",
                bio: profile.bio || "No bio available.",
                rating: avgRating,
                reviews: reviewCount,
                avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                cover_image_url: profile.cover_image_url,
                stats: {
                    events: profile.events_completed || 0,
                    years: profile.years_experience || 0,
                    clients: clientsCount || profile.clients_served || 0
                },
                unavailable_dates: profile.planners?.[0]?.unavailable_dates || profile.planners?.unavailable_dates || [],
                verification_status: profile.verification_status || 'unverified'
            });

            const { data: events, error: eventsError } = await supabase
                .from('events')
                .select(`*, album_media (media_url)`)
                .eq('planner_id', profile.id)
                .order('created_at', { ascending: false });

            if (eventsError) logError("Error fetching events", eventsError);

            if (events) {
                setAlbums(events.map(event => ({
                    id: event.id,
                    title: event.title,
                    date: event.date ? new Date(event.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' }) : 'N/A',
                    image: event.album_media?.[0]?.media_url || "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
                    slug: event.slug
                })));
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (user && profile.id !== user.id) {
                const { data: currentUserProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                if (currentUserProfile?.role === 'admin') setIsUserAdmin(true);

                const { data: booking } = await supabase
                    .from('bookings').select('id')
                    .eq('client_id', user.id).eq('planner_id', profile.id).eq('status', 'approved')
                    .maybeSingle();
                if (booking) setHasApprovedBooking(true);

                const { data: savedStatus } = await supabase
                    .from('saved_planners').select('id')
                    .eq('client_id', user.id).eq('planner_id', profile.id)
                    .maybeSingle();
                if (savedStatus) setIsSaved(true);
            }

            if (typeof window !== 'undefined') {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('book') === 'true') setShowBookingModal(true);
            }

            setIsLoading(false);
        };

        fetchPlannerData();
    }, [username]);

    useEffect(() => {
        if (!planner || isLoading) return;
        const trackView = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            await supabase.from('profile_views').insert({ profile_id: planner.id, viewer_id: session?.user.id || null });
        };
        trackView();
    }, [planner, isLoading]);

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push(`/auth/login?redirect=${encodeURIComponent(`/planner/${username}?book=true`)}`);
            return;
        }
        if (session.user.id === planner?.id) { showToast("You cannot book yourself!", "error"); return; }
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('bookings').insert({
                client_id: session.user.id, planner_id: planner?.id,
                event_date: bookingData.eventDate, event_type: bookingData.eventType,
                message: bookingData.message, status: 'pending'
            });
            if (error) throw error;
            showToast("Booking request sent successfully!", "success");
            setShowBookingModal(false);
            setBookingData({ eventDate: "", eventType: "Wedding", message: "" });
        } catch (error: any) {
            showToast(error.message || "Failed to send request", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        const shareData = { title: planner?.name || "Evently Planner", text: `Check out ${planner?.name}'s portfolio on Evently!`, url };
        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) { await navigator.share(shareData); return; }
        } catch (err: any) { if (err.name === 'AbortError') return; }
        try {
            if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); showToast("Link copied to clipboard!", "success"); }
        } catch (err) {
            try {
                const ta = document.createElement("textarea"); ta.value = url;
                document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                showToast("Link copied!", "success");
            } catch { showToast("Could not copy link.", "error"); }
        }
    };

    const toggleSavePlanner = async () => {
        if (!planner) return;
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { showToast("Please login to save planners", "error"); return; }
        if (session.user.id === planner?.id) { showToast("You cannot save yourself!", "error"); return; }
        setIsTogglingSave(true);
        try {
            if (isSaved) {
                await supabase.from('saved_planners').delete().eq('client_id', session.user.id).eq('planner_id', planner.id);
                setIsSaved(false); showToast("Planner removed from saved list", "success");
            } else {
                await supabase.from('saved_planners').insert({ client_id: session.user.id, planner_id: planner.id });
                setIsSaved(true); showToast("Planner saved!", "success");
            }
        } catch (err: any) { logError("Toggle save failed", err); showToast("Failed to update saved planners", "error"); }
        finally { setIsTogglingSave(false); }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-cream">
            <div className="w-8 h-8 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
        </div>
    );

    if (!planner) return (
        <div className="min-h-screen flex items-center justify-center bg-cream flex-col gap-4">
            <h2 className="text-2xl font-serif italic text-charcoal">Planner Not Found</h2>
            <Link href="/planners"><Button variant="outline">Back to Planners</Button></Link>
        </div>
    );

    const visibleAlbums = showAllEvents ? albums : albums.slice(0, 6);
    const statItems = [
        { icon: Calendar, label: "Events", value: planner.stats.events },
        { icon: Award, label: "Years Exp.", value: planner.stats.years },
        { icon: Users, label: "Clients", value: planner.stats.clients },
    ];

    return (
        <>
        <main className={`min-h-screen bg-cream text-charcoal font-sans transition-all duration-500 ${showBookingModal ? "blur-sm scale-[0.99] brightness-90 pointer-events-none" : ""}`}>

            {/* ── Hero Cover ── */}
            <div className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden">
                <img
                    src={planner.cover_image_url || "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80"}
                    className="w-full h-full object-cover"
                    alt="Cover"
                />
                {/* Multi-layer gradient overlay for old-money depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/10 to-cream" />
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal/20 to-transparent" />

                {/* Top action row — pushed below fixed navbar */}
                <div className="absolute top-[70px] md:top-[90px] right-6 z-30 flex items-center gap-3">
                    {!isUserAdmin && (
                        <button
                            onClick={toggleSavePlanner}
                            disabled={isTogglingSave}
                            className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center justify-center hover:bg-white/30 hover:scale-105 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-300 group relative overflow-hidden"
                        >
                            {/* Subtle inner gloss reflection */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            {isTogglingSave
                                ? <Loader2 size={18} className="animate-spin text-white relative z-10" />
                                : <Heart size={18} className={`relative z-10 transition-colors duration-300 ${isSaved ? "fill-red-500 text-red-500 drop-shadow-sm" : "text-white/90 group-hover:text-white drop-shadow-sm"}`} />
                            }
                        </button>
                    )}
                    <button
                        onClick={handleShare}
                        className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center justify-center hover:bg-white/30 hover:scale-105 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-300 group relative overflow-hidden"
                    >
                        {/* Subtle inner gloss reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Share2 size={18} className="text-white/90 group-hover:text-white drop-shadow-sm transition-colors duration-300 relative z-10" />
                    </button>
                </div>

                {/* Hero name overlay */}
                <div className="absolute bottom-0 left-0 right-0 z-10 px-5 md:px-16 pb-8 md:pb-14">
                    <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-cream/90 mb-2 md:mb-3 drop-shadow-md">
                        {planner.category}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1
                            className="font-sans font-black text-4xl sm:text-5xl md:text-7xl text-white leading-none tracking-tight"
                            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.7)" }}
                        >
                            {planner.name}
                        </h1>
                        {planner.verification_status === "verified" && (
                            <div
                                title="Verified Planner"
                                className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 shadow-lg flex-shrink-0 self-center"
                            >
                                <ShieldCheck size={15} className="text-white" strokeWidth={2.5} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Sticky floating CTA bar ── */}
            {!isUserAdmin && (
                <div className="sticky top-[57px] md:top-[65px] z-40 bg-cream/95 backdrop-blur-md border-b border-charcoal/10 shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 md:px-16 py-3 flex items-center justify-end gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    if (hasApprovedBooking) {
                                        router.push("/dashboard/messages");
                                    } else {
                                        showToast("Chat becomes available once your booking is approved!", "info");
                                    }
                                }}
                                title={!hasApprovedBooking ? "Available after booking is approved" : "Open chat"}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border border-charcoal/20 text-[11px] font-bold uppercase tracking-widest transition-all ${
                                    hasApprovedBooking
                                        ? "text-charcoal hover:bg-charcoal/5 cursor-pointer"
                                        : "text-charcoal/40 cursor-not-allowed"
                                }`}
                            >
                                <MessageSquare size={14} />
                                Chat
                            </button>
                            <button
                                onClick={() => setShowBookingModal(true)}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-charcoal text-cream text-[11px] font-bold uppercase tracking-widest hover:bg-charcoal/90 transition-all shadow-sm"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Main Content ── */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 py-16 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">

                    {/* ── Left Column: Profile Info ── */}
                    <div className="lg:col-span-1 space-y-10">

                        {/* Avatar + Name + location (mobile) */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 overflow-hidden border border-charcoal/10 rounded-2xl flex-shrink-0">
                                <img src={planner.avatar} className="w-full h-full object-cover" alt={planner.name} />
                            </div>
                            <div className="min-w-0">
                                <h2 className="font-serif italic text-xl sm:text-2xl text-charcoal leading-tight truncate">{planner.name}</h2>
                                {/* Location visible on mobile (hidden in hero on mobile) */}
                                <div className="flex items-center gap-1.5 mt-1 sm:hidden">
                                    <MapPin size={11} className="text-charcoal/40 flex-shrink-0" />
                                    <span className="text-xs text-charcoal/50 truncate">{planner.location}</span>
                                </div>
                                <div className="hidden sm:flex items-center gap-1.5 mt-1">
                                    <MapPin size={12} className="text-charcoal/40" />
                                    <span className="text-xs text-charcoal/50 tracking-wide">{planner.location}</span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-charcoal/10" />

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-3">
                            {statItems.map(({ icon: Icon, label, value }) => (
                                <div key={label} className="text-center p-4 border border-charcoal/10 bg-white/60 rounded-2xl">
                                    <span className="text-2xl font-serif text-charcoal">{value}+</span>
                                    <span className="block text-[9px] font-bold uppercase tracking-widest text-charcoal/40 mt-1">{label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-charcoal/10" />

                        {/* Bio */}
                        <div className="space-y-3">
                            <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-charcoal/40">About</p>
                            <p className="text-sm text-charcoal/70 leading-relaxed font-sans">{planner.bio}</p>
                        </div>

                        {/* Business Details — email only, rating moved to hero */}
                        {planner.public_email && (
                            <div className="space-y-3">
                                <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-charcoal/40">Contact</p>
                                <div className="flex items-center gap-3 text-sm text-charcoal/60">
                                    <Mail size={14} className="text-charcoal/40 flex-shrink-0" />
                                    <a href={`mailto:${planner.public_email}`} className="hover:text-charcoal transition-colors truncate">
                                        {planner.public_email}
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Rating & Location — below contact */}
                        <div className="space-y-3">
                            <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-charcoal/40">Details</p>
                            <div className="flex items-center gap-2.5 text-sm text-charcoal/60">
                                <Star size={14} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                                <span>{planner.rating} rating &middot; {planner.reviews} reviews</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm text-charcoal/60">
                                <MapPin size={14} className="text-charcoal/40 flex-shrink-0" />
                                <span>{planner.location}</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        {(planner.instagram_url || planner.twitter_url || planner.linkedin_url || planner.facebook_url) && (
                            <div className="space-y-4 pt-2 border-t border-charcoal/10">
                                <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-charcoal/40">Connect</p>
                                <div className="flex flex-wrap gap-3">
                                    {planner.instagram_url && (
                                        <a href={planner.instagram_url} target="_blank" rel="noopener noreferrer"
                                            className="w-9 h-9 rounded-xl border border-charcoal/15 flex items-center justify-center text-charcoal/40 hover:text-charcoal hover:border-charcoal/40 transition-all">
                                            <Instagram size={16} />
                                        </a>
                                    )}
                                    {planner.twitter_url && (
                                        <a href={planner.twitter_url} target="_blank" rel="noopener noreferrer"
                                            className="w-9 h-9 rounded-xl border border-charcoal/15 flex items-center justify-center text-charcoal/40 hover:text-charcoal hover:border-charcoal/40 transition-all">
                                            <Twitter size={16} />
                                        </a>
                                    )}
                                    {planner.linkedin_url && (
                                        <a href={planner.linkedin_url} target="_blank" rel="noopener noreferrer"
                                            className="w-9 h-9 rounded-xl border border-charcoal/15 flex items-center justify-center text-charcoal/40 hover:text-charcoal hover:border-charcoal/40 transition-all">
                                            <Linkedin size={16} />
                                        </a>
                                    )}
                                    {planner.facebook_url && (
                                        <a href={planner.facebook_url} target="_blank" rel="noopener noreferrer"
                                            className="w-9 h-9 rounded-xl border border-charcoal/15 flex items-center justify-center text-charcoal/40 hover:text-charcoal hover:border-charcoal/40 transition-all">
                                            <Facebook size={16} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right Column: Event Album Gallery ── */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-end justify-between">
                            <div>
                                <h2 className="font-serif italic text-3xl md:text-4xl text-charcoal">Event Albums</h2>
                            </div>
                            {albums.length > 6 && (
                                <button
                                    onClick={() => setShowAllEvents(!showAllEvents)}
                                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-charcoal/50 hover:text-charcoal transition-colors"
                                >
                                    {showAllEvents ? "Show Less" : "View All"}
                                    <ChevronDown size={14} className={`transition-transform ${showAllEvents ? "rotate-180" : ""}`} />
                                </button>
                            )}
                        </div>

                        {albums.length === 0 ? (
                            <div className="border border-charcoal/10 rounded-2xl p-16 text-center">
                                <p className="font-serif italic text-2xl text-charcoal/30">No albums yet.</p>
                                <p className="text-xs text-charcoal/30 mt-2">This planner hasn't uploaded any event albums.</p>
                            </div>
                        ) : (
                            <>
                                {/* Masonry-style gallery grid */}
                                <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                                    {visibleAlbums.map((album, index) => (
                                        <Link href={`/events/${album.slug}`} key={album.id} className="block break-inside-avoid">
                                            <div className={`group relative overflow-hidden rounded-2xl ${index % 3 === 0 ? "aspect-[4/5]" : index % 3 === 1 ? "aspect-square" : "aspect-[3/4]"}`}>
                                                <img
                                                    src={album.image}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                    alt={album.title}
                                                />
                                                {/* Elegant overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                {/* Always-visible bottom bar */}
                                                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gold mb-1">{album.date}</p>
                                                    <h4 className="font-serif italic text-lg text-cream leading-tight">{album.title}</h4>
                                                </div>
                                                {/* Subtle date chip always visible */}
                                                <div className="absolute top-3 left-3 px-2.5 py-1 bg-cream/90 backdrop-blur-sm rounded-full">
                                                    <span className="text-[8px] font-bold uppercase tracking-widest text-charcoal/60">{album.date}</span>
                                                </div>
                                            </div>
                                            <div className="pt-3 pb-5 border-b border-charcoal/10">
                                                <h4 className="font-serif italic text-lg text-charcoal group-hover:text-charcoal/70 transition-colors">{album.title}</h4>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {albums.length > 6 && (
                                    <div className="text-center pt-4">
                                        <button
                                            onClick={() => setShowAllEvents(!showAllEvents)}
                                            className="inline-flex items-center gap-3 px-8 py-3 rounded-full border border-charcoal/20 text-[10px] font-bold uppercase tracking-[0.3em] text-charcoal hover:bg-charcoal hover:text-cream transition-all duration-300"
                                        >
                                            {showAllEvents ? "Collapse" : `View All ${albums.length} Albums`}
                                            <ChevronDown size={14} className={`transition-transform ${showAllEvents ? "rotate-180" : ""}`} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>

            {/* ── Booking Modal (outside main so blur doesn't affect it) ── */}
            {showBookingModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-xl" onClick={() => !isSubmitting && setShowBookingModal(false)} />
                    <div className="relative w-full max-w-lg bg-cream border border-charcoal/15 rounded-3xl p-8 md:p-10 space-y-8 animate-in zoom-in-95 duration-300 shadow-2xl">
                        {/* Modal header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-charcoal/40 mb-2">Send an Inquiry</p>
                                <h3 className="font-serif italic text-3xl text-charcoal leading-tight">
                                    Book {planner.name}
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="p-2 text-charcoal/40 hover:text-charcoal transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="h-px bg-charcoal/10" />

                        <form onSubmit={handleBookingSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-charcoal/50">Event Type</label>
                                    <select
                                        className="w-full h-11 rounded-xl bg-white border border-charcoal/15 px-4 text-sm text-charcoal focus:outline-none focus:border-charcoal/40 transition-all appearance-none"
                                        value={bookingData.eventType}
                                        onChange={(e) => setBookingData({ ...bookingData, eventType: e.target.value })}
                                        required
                                    >
                                        <option value="Wedding">Wedding</option>
                                        <option value="Corporate">Corporate</option>
                                        <option value="Birthday">Birthday</option>
                                        <option value="Concert">Concert</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-charcoal/50">Event Date</label>
                                    <Input
                                        type="date"
                                        className="h-11 rounded-xl bg-white border-charcoal/15 text-charcoal focus:border-charcoal/40"
                                        value={bookingData.eventDate}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (planner?.unavailable_dates?.includes(val)) {
                                                showToast("This date is unavailable. Please select another.", "error");
                                                setBookingData({ ...bookingData, eventDate: "" });
                                            } else {
                                                setBookingData({ ...bookingData, eventDate: val });
                                            }
                                        }}
                                        min={new Date().toISOString().split("T")[0]}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-charcoal/50">Your Message</label>
                                <Textarea
                                    placeholder="Tell us about your event vision..."
                                    value={bookingData.message}
                                    onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                                    className="min-h-[120px] rounded-xl bg-white text-charcoal border-charcoal/15 focus:border-charcoal/40"
                                    required
                                />
                            </div>

                            <div className="h-px bg-charcoal/10" />

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowBookingModal(false)}
                                    disabled={isSubmitting}
                                    className="flex-1 h-11 rounded-xl border border-charcoal/20 text-charcoal text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-charcoal/5 transition-all disabled:opacity-40"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 h-11 rounded-xl bg-charcoal text-cream text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-charcoal/90 transition-all disabled:opacity-40 flex items-center justify-center"
                                >
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Send Inquiry"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
