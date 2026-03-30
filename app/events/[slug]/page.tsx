"use client";
import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Play, Image as ImageIcon, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function EventAlbumPage({ params }: { params: Promise<{ "slug": string }> }) {
    const paramData = use(params);
    const eventSlug = paramData["slug"];

    const [isLoading, setIsLoading] = useState(true);
    const [event, setEvent] = useState<any>(null);
    const [media, setMedia] = useState<any[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<any>(null);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchEventData = async () => {
            const supabase = createClient();

            // 1. Fetch Event with Planner info
            const { data: eventData, error: eventError } = await supabase
                .from('events')
                .select(`
                    *,
                    planner:profiles (
                        full_name,
                        username,
                        avatar_url
                    )
                `)
                .eq('slug', eventSlug)
                .single();

            if (eventError || !eventData) {
                console.error("Event not found:", eventError);
                setIsLoading(false);
                return;
            }

            setEvent({
                id: eventData.id,
                title: eventData.title,
                description: eventData.description,
                category: eventData.category,
                date: eventData.date ? new Date(eventData.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A',
                location: eventData.location,
                planner: {
                    name: eventData.planner?.full_name || eventData.planner?.username,
                    username: eventData.planner?.username,
                    avatar: eventData.planner?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${eventData.planner?.username}`
                }
            });

            // 2. Fetch Media (Images & Videos)
            const { data: mediaData } = await supabase
                .from('album_media')
                .select('*')
                .eq('event_id', eventData.id)
                .order('display_order', { ascending: true });

            if (mediaData) {
                setMedia(mediaData);
            }

            setIsLoading(false);
        };

        fetchEventData();
    }, [eventSlug]);

    const handleShare = async () => {
        const url = window.location.href;
        const shareData = {
            title: event.title,
            text: `Check out this amazing event by ${event.planner.name} on Evently!`,
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
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
    );

    if (!event) return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white flex-col gap-4">
            <h2 className="text-2xl font-bold">Event Not Found</h2>
            <Link href="/planners">
                <Button variant="outline">Back to Explore</Button>
            </Link>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white pb-20 pt-32">
            <div className="max-w-7xl mx-auto px-6">
                {/* Event Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
                    <div className="space-y-4 max-w-3xl">
                        <div className="flex gap-2">
                            <span className="px-3 py-1 glass-panel text-[10px] font-bold uppercase tracking-widest text-blue-400 border-blue-400/20 rounded-full">
                                {event.category}
                            </span>
                            <span className="px-3 py-1 glass-panel text-[10px] font-bold uppercase tracking-widest text-gray-500 border-white/10 rounded-full">
                                {event.date}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">{event.title}</h1>
                        <p className="text-xl text-gray-400 leading-relaxed font-light">{event.description}</p>
                    </div>

                    <Link href={event.planner.username ? `/planner/${event.planner.username}` : `/planner/profile/${event.id}`} className="group w-full md:w-auto">
                        <Card className="flex items-center gap-4 py-4 pr-8 border-white/10 hover:border-white/30 transition-all">
                            <img src={event.planner.avatar} className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" alt={event.planner.name} />
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Planned by</p>
                                <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{event.planner.name}</p>
                            </div>
                        </Card>
                    </Link>
                </div>

                {/* Gallery Grid (Pins style) */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {media.length === 0 ? (
                        <p className="text-gray-500 italic">No media found for this event.</p>
                    ) : media.map((item: any, i: number) => (
                        <div
                            key={item.id || i}
                            className="relative group overflow-hidden rounded-3xl glass-panel border-white/10 cursor-pointer"
                            onClick={() => setSelectedMedia(item)}
                        >
                            {item.media_type === 'video' ? (
                                <div className="relative aspect-video bg-black">
                                    <video
                                        src={item.media_url}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        poster={item.thumbnail_url}
                                        muted
                                        loop
                                        onMouseEnter={(e) => e.currentTarget.play()}
                                        onMouseLeave={(e) => e.currentTarget.pause()}
                                    />
                                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white">
                                        <Play size={14} fill="currentColor" />
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={item.media_url}
                                    className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    alt={`${event.title} image ${i + 1}`}
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                <Button size="sm" variant="glass" className="backdrop-blur-xl w-full md:w-auto">
                                    {item.media_type === 'video' ? 'Play Video' : 'View Full Image'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-24 text-center space-y-8 glass-panel p-10 md:p-16 rounded-[2rem] md:rounded-[3rem] border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                    <h2 className="text-3xl md:text-4xl font-bold">Inspired by this event?</h2>
                    <p className="text-gray-400 max-w-xl mx-auto">Book {event.planner.name} for your own celebration and make it unforgettable.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={event.planner.username ? `/planner/${event.planner.username}?book=true` : `/planner/profile/${event.id}?book=true`} className="w-full sm:w-auto">
                            <Button size="lg" className="w-full">Send Booking Request</Button>
                        </Link>
                        <Button variant="outline" size="lg" onClick={handleShare} className="w-full sm:w-auto">Share Album</Button>
                    </div>
                </div>
            </div>

            {/* Lightbox / Media Viewer */}
            {selectedMedia && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={() => setSelectedMedia(null)} />
                    <button
                        onClick={() => setSelectedMedia(null)}
                        className="absolute top-8 right-8 z-[160] p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white"
                    >
                        <X size={24} />
                    </button>

                    <div className="relative z-10 max-w-5xl w-full aspect-auto animate-in zoom-in-95 duration-300">
                        {selectedMedia.media_type === 'video' ? (
                            <video
                                src={selectedMedia.media_url}
                                className="w-full max-h-[80vh] rounded-2xl shadow-2xl"
                                controls
                                autoPlay
                            />
                        ) : (
                            <img
                                src={selectedMedia.media_url}
                                className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                                alt="Full size"
                            />
                        )}
                        <div className="mt-6 flex justify-between items-center px-4">
                            <h4 className="text-xl font-bold">{event.title}</h4>
                            <div className="flex gap-4">
                                <Button variant="outline" size="sm" onClick={handleShare}>Share</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
