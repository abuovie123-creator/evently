"use client";
import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Calendar, MapPin, Tag, Star, TrendingUp, X, Check, MessageSquare, Share2 } from "lucide-react";

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

    // Booking Form States
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingData, setBookingData] = useState({
        eventDate: "",
        eventType: "Wedding",
        message: ""
    });

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
                if ((error as any).message) errorDetails.message = (error as any).message;
                if ((error as any).code) errorDetails.code = (error as any).code;
                if ((error as any).details) errorDetails.details = (error as any).details;
                if ((error as any).hint) errorDetails.hint = (error as any).hint;
            }
            console.error(`${context} (Detailed):`, errorDetails);
        } catch (err) {
            console.error(`${context} (Logging helper failed):`, err);
        }
    };

    const [showAllEvents, setShowAllEvents] = useState(false);

    useEffect(() => {
        const fetchPlannerData = async () => {
            const supabase = createClient();

            // 1. Fetch Profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', username)
                .single();

            if (profileError || !profile) {
                logError("Profile not found", profileError);
                setIsLoading(false);
                return;
            }

            setPlanner({
                ...profile,
                name: profile.full_name || username,
                category: profile.category || "Wedding & Event Planner",
                location: profile.location || "Nigeria",
                bio: profile.bio || "No bio available.",
                rating: profile.rating || 0.0,
                reviews: profile.review_count || 0,
                avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                stats: {
                    events: profile.completed_events || 0,
                    years: profile.years_experience || 0,
                    clients: profile.satisfied_clients || 0
                }
            });

            // 2. Fetch Events (Albums)
            const { data: events, error: eventsError } = await supabase
                .from('events')
                .select(`
                    *,
                    album_media (media_url)
                `)
                .eq('planner_id', profile.id)
                .order('created_at', { ascending: false });

            if (eventsError) {
                logError("Error fetching events", eventsError);
            }

            if (events) {
                setAlbums(events.map(event => ({
                    id: event.id,
                    title: event.title,
                    date: event.date ? new Date(event.date).toLocaleDateString() : 'N/A',
                    image: event.album_media?.[0]?.media_url || "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
                    slug: event.slug
                })));
            }

            // 3. Check for approved booking to enable chat
            const { data: { user } } = await supabase.auth.getUser();
            if (user && profile.id !== user.id) {
                const { data: booking } = await supabase
                    .from('bookings')
                    .select('id')
                    .eq('client_id', user.id)
                    .eq('planner_id', profile.id)
                    .eq('status', 'approved')
                    .maybeSingle();

                if (booking) {
                    setHasApprovedBooking(true);
                }
            }

            // 4. Check for booking trigger from URL
            if (typeof window !== 'undefined') {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('book') === 'true') {
                    setShowBookingModal(true);
                }
            }

            setIsLoading(false);
        };

        fetchPlannerData();
    }, [username]);

    // Track Profile View
    useEffect(() => {
        if (!planner || isLoading) return;

        const trackView = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            await supabase
                .from('profile_views')
                .insert({
                    profile_id: planner.id,
                    viewer_id: session?.user.id || null
                });
        };

        trackView();
    }, [planner, isLoading]);

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            showToast("Please login to send a booking request", "error");
            return;
        }

        if (session.user.id === planner?.id) {
            showToast("You cannot book yourself!", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('bookings')
                .insert({
                    client_id: session.user.id,
                    planner_id: planner?.id,
                    event_date: bookingData.eventDate,
                    event_type: bookingData.eventType,
                    message: bookingData.message,
                    status: 'pending'
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
        const shareData = {
            title: planner?.name || "Evently Planner",
            text: `Check out ${planner?.name}'s portfolio on Evently!`,
            url: url,
        };

        try {
            // 1. Try native sharing first
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                return; // Success
            }
        } catch (err: any) {
            // Ignore AbortError (user cancelled)
            if (err.name === 'AbortError') return;
            console.error("Native share failed:", err);
        }

        // 2. Fallback to clipboard if native share fails or isn't supported
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(url);
                showToast("Link copied to clipboard!", "success");
            } else {
                throw new Error("Clipboard API not available");
            }
        } catch (err) {
            // 3. Last resort legacy fallback
            try {
                const textArea = document.createElement("textarea");
                textArea.value = url;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast("Link copied!", "success");
            } catch (copyErr) {
                console.error("All share/copy methods failed:", copyErr);
                showToast("Could not copy link. Please copy the URL manually.", "error");
            }
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!planner) return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white flex-col gap-4">
            <h2 className="text-2xl font-bold">Planner Not Found</h2>
            <Link href="/planners">
                <Button variant="outline">Back to Planners</Button>
            </Link>
        </div>
    );

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="relative">
                <div className="relative h-[250px] md:h-[350px] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-black/60 to-black z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80"
                        className="w-full h-full object-cover opacity-60"
                        alt="Hero background"
                    />
                </div>

                <div className="absolute inset-x-0 bottom-0 z-20 max-w-7xl mx-auto px-6 md:px-8 translate-y-1/2">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                        <div className="w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden border-4 border-black shadow-2xl glass-panel shrink-0">
                            <img src={planner.avatar} className="w-full h-full object-cover" alt={planner.name} />
                        </div>
                        <div className="flex-1 text-center md:text-left pb-2 md:pb-4">
                            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-2">
                                <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-xl">{planner.name}</h1>
                                <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-white">Verified</span>
                                </div>
                            </div>
                            <p className="text-lg md:text-xl text-gray-300 font-medium">{planner.category}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-8 md:mt-0 pb-0 md:pb-4 justify-center md:justify-end">
                            <Button size="lg" className="w-full sm:w-auto shadow-2xl h-14 md:h-12 bg-blue-600 hover:bg-blue-700" onClick={() => setShowBookingModal(true)}>
                                Book Now
                            </Button>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <Button
                                    variant="glass"
                                    size="lg"
                                    className="flex-1 sm:w-auto shadow-2xl h-14 md:h-12"
                                    onClick={() => {
                                        if (hasApprovedBooking) {
                                            router.push("/dashboard/messages");
                                        } else {
                                            showToast("Chat becomes available once your booking is approved!", "info");
                                        }
                                    }}
                                >
                                    <MessageSquare size={18} className="mr-2" />
                                    Chat
                                </Button>
                                <Button
                                    variant="glass"
                                    size="lg"
                                    className="px-4 shadow-2xl h-14 md:h-12"
                                    onClick={handleShare}
                                >
                                    <Share2 size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showBookingModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isSubmitting && setShowBookingModal(false)} />
                    <Card className="relative w-full max-w-lg p-8 space-y-8 animate-in zoom-in-95 duration-300 border-white/10" hover={false}>
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black">Inquire with {planner.name}</h3>
                                <p className="text-gray-400 text-sm">Tell them about your next big event.</p>
                            </div>
                            <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleBookingSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Event Type</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none appearance-none"
                                        value={bookingData.eventType}
                                        onChange={(e) => setBookingData({ ...bookingData, eventType: e.target.value })}
                                        required
                                    >
                                        <option value="Wedding" className="bg-gray-900">Wedding</option>
                                        <option value="Corporate" className="bg-gray-900">Corporate</option>
                                        <option value="Birthday" className="bg-gray-900">Birthday</option>
                                        <option value="Concert" className="bg-gray-900">Concert</option>
                                        <option value="Other" className="bg-gray-900">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Event Date</label>
                                    <Input
                                        type="date"
                                        value={bookingData.eventDate}
                                        onChange={(e) => setBookingData({ ...bookingData, eventDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Your Message</label>
                                <Textarea
                                    placeholder="Briefly describe your event needs..."
                                    value={bookingData.message}
                                    onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                                    className="min-h-[120px]"
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-white/5">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    type="button"
                                    onClick={() => setShowBookingModal(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Send Inquiry"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 md:px-8 pt-32 md:pt-40 pb-20 grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12">
                <div className="lg:col-span-1 space-y-12">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">About Me</h3>
                        <p className="text-gray-300 leading-relaxed">{planner.bio}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {planner && Object.entries(planner.stats).map(([label, value]) => (
                            <div key={label} className="glass-panel p-4 rounded-2xl text-center">
                                <span className="block text-2xl font-bold">{String(value)}+</span>
                                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-tighter">{label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Business Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <span>📍</span> {planner.location}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <span>⭐</span> {planner.rating} ({planner.reviews} reviews)
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        <h2 className="text-2xl md:text-3xl font-bold">Featured Albums</h2>
                        {albums.length > 2 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => setShowAllEvents(!showAllEvents)}
                            >
                                {showAllEvents ? "Show Less" : "View All Events"}
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {albums.length === 0 ? (
                            <p className="text-gray-500 italic">No featured albums yet.</p>
                        ) : (showAllEvents ? albums : albums.slice(0, 2)).map((album: any) => (
                            <Link href={`/events/${album.slug}`} key={album.id}>
                                <Card className="group p-0 overflow-hidden cursor-pointer h-full">
                                    <div className="aspect-video relative overflow-hidden">
                                        <img
                                            src={album.image}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            alt={album.title}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1 block">
                                                {album.date}
                                            </span>
                                            <h4 className="text-lg font-bold group-hover:text-blue-400 transition-colors">
                                                {album.title}
                                            </h4>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
