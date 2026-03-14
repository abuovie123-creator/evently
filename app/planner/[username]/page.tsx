import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

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
    // Add other properties from 'profiles' table if needed
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
    // - [x] Connect Planner Profile page (`/planner/[username]`) to Supabase <!-- id: 4 -->
    const { username } = use(params);
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [planner, setPlanner] = useState<PlannerProfile | null>(null);
    const [albums, setAlbums] = useState<Album[]>([]);

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
                console.error("Profile not found:", profileError);
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

            if (events) {
                setAlbums(events.map(event => ({
                    id: event.id,
                    title: event.title,
                    date: event.date ? new Date(event.date).toLocaleDateString() : 'N/A',
                    image: event.album_media?.[0]?.media_url || "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
                    slug: event.slug
                })));
            }

            setIsLoading(false);
        };

        fetchPlannerData();
    }, [username]);

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
            {/* Hero Header */}
            <div className="relative">
                {/* Background Container - Clipped */}
                <div className="relative h-[250px] md:h-[350px] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-black/60 to-black z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80"
                        className="w-full h-full object-cover opacity-60"
                        alt="Hero background"
                    />
                </div>

                {/* Profile Info Container - Not Clipped */}
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
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0 pb-0 md:pb-4">
                            <Button size="lg" className="w-full sm:w-auto shadow-2xl">Book Now</Button>
                            <Button variant="glass" size="lg" className="w-full sm:w-auto">Chat</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 md:px-8 pt-32 md:pt-40 pb-20 grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12">
                {/* Left Column: Details */}
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

                {/* Right Column: Portfolio Albums */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        <h2 className="text-2xl md:text-3xl font-bold">Featured Albums</h2>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">View All Events</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {albums.length === 0 ? (
                            <p className="text-gray-500 italic">No featured albums yet.</p>
                        ) : albums.map((album: any) => (
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
