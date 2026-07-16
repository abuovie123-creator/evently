"use client";
import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Play, X } from "lucide-react";
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
            title: event?.title || "Event Album",
            text: `Check out this amazing event by ${event?.planner?.name || 'Evently Planner'} on Evently!`,
            url: url,
        };

        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                return;
            }
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            console.error("Native share failed:", err);
        }

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(url);
                showToast("Link copied to clipboard!", "success");
            } else {
                throw new Error("Clipboard API not available");
            }
        } catch (err) {
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
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F3]">
            <div className="w-8 h-8 border-2 border-[#1C1A16]/30 border-t-[#C4A55A] rounded-full animate-spin" />
        </div>
    );

    if (!event) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F3] flex-col gap-4">
            <h2 className="font-serif italic text-2xl text-[#1C1A16]">Event Not Found</h2>
            <Link href="/planners">
                <button className="om-btn-outline text-[#1C1A16] border-[#D4C5A9] hover:bg-[#F5F0E8] transition-colors">
                    Back to Explore
                </button>
            </Link>
        </div>
    );

    return (
        <>
            <main className={`min-h-screen bg-[#FAF8F3] text-[#1C1A16] font-sans transition-all duration-500 ${selectedMedia ? "blur-sm scale-[0.99] brightness-90 pointer-events-none" : ""}`}>
                <div className="max-w-7xl mx-auto px-6 md:px-16 pt-32 pb-24">
                    
                    {/* ── Event Header ── */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16 pb-12 border-b border-[#D4C5A9]/40">
                        <div className="space-y-5 max-w-4xl animate-fade-up">
                            <div className="flex flex-wrap gap-2.5">
                                <span className="px-3 py-1 bg-[#F5F0E8] border border-[#D4C5A9] text-[9px] font-bold uppercase tracking-[0.2em] text-[#8B7355] rounded-full">
                                    {event.category}
                                </span>
                                <span className="px-3 py-1 bg-[#F5F0E8] border border-[#D4C5A9] text-[9px] font-bold uppercase tracking-[0.2em] text-[#1C1A16]/50 rounded-full">
                                    {event.date}
                                </span>
                                {event.location && (
                                    <span className="px-3 py-1 bg-[#F5F0E8] border border-[#D4C5A9] text-[9px] font-bold uppercase tracking-[0.2em] text-[#1C1A16]/50 rounded-full">
                                        {event.location}
                                    </span>
                                )}
                            </div>
                            <h1 className="font-serif italic text-4xl sm:text-5xl md:text-6xl text-[#1C1A16] leading-tight tracking-tight">
                                {event.title}
                            </h1>
                            <p className="text-base sm:text-lg text-[#1C1A16]/70 leading-relaxed font-sans font-light max-w-2xl">
                                {event.description}
                            </p>
                        </div>

                        {/* Planner Business Card */}
                        <Link 
                            href={event.planner.username ? `/planner/${event.planner.username}` : `/planner/profile/${event.id}`} 
                            className="group w-full lg:w-auto"
                        >
                            <div className="flex items-center gap-4 p-5 pr-10 bg-[#F5F0E8] border border-[#D4C5A9] hover:border-[#C4A55A] hover:shadow-[0_4px_24px_rgba(196,165,90,0.08)] rounded-2xl transition-all duration-300">
                                <div className="w-14 h-14 rounded-full overflow-hidden border border-[#D4C5A9] flex-shrink-0 bg-white">
                                    <img 
                                        src={event.planner.avatar} 
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105" 
                                        alt={event.planner.name} 
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold text-[#1C1A16]/40 uppercase tracking-[0.2em]">Designed & Planned By</p>
                                    <p className="font-serif italic text-lg text-[#1C1A16] group-hover:text-[#8B7355] transition-colors leading-snug mt-0.5 truncate">
                                        {event.planner.name}
                                    </p>
                                    <span className="text-[10px] uppercase tracking-widest text-[#C4A55A] font-bold mt-1 inline-block">
                                        View Portfolio &rarr;
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* ── Media Gallery: Sticky Overlapping Stack ── */}
                    {media.length === 0 ? (
                        <div className="border border-[#D4C5A9] rounded-2xl p-20 text-center bg-[#F5F0E8]/50">
                            <p className="font-serif italic text-2xl text-[#1C1A16]/30">No photographs or videos found.</p>
                            <p className="text-xs text-[#1C1A16]/30 mt-2">This album doesn't contain any media files yet.</p>
                        </div>
                    ) : (
                        <div className="relative max-w-4xl mx-auto space-y-24 py-10">
                            {media.map((item: any, i: number) => {
                                // Dynamic rotations for physical photograph stacking effect
                                const rotations = [
                                    "rotate-0", 
                                    "rotate-[1deg]", 
                                    "-rotate-[1deg]", 
                                    "rotate-[1.5deg]", 
                                    "-rotate-[1.5deg]", 
                                    "rotate-[0.5deg]", 
                                    "-rotate-[0.5deg]"
                                ];
                                const rotationClass = rotations[i % rotations.length];
                                
                                return (
                                    <div 
                                        key={item.id || i}
                                        className="sticky top-[100px] md:top-[125px] transition-transform duration-300 pb-10"
                                        style={{
                                            zIndex: 10 + i
                                        }}
                                    >
                                        <div 
                                            onClick={() => setSelectedMedia(item)}
                                            className={`group block p-4 sm:p-6 bg-white border border-[#D4C5A9] shadow-xl hover:shadow-2xl rounded-2xl cursor-pointer hover:-translate-y-2 hover:scale-[1.01] hover:rotate-0 transition-all duration-500 ease-out ${rotationClass}`}
                                        >
                                            {/* Photo Inner Matte Frame */}
                                            <div className="relative overflow-hidden rounded-lg border border-[#D4C5A9]/50 bg-[#FAF8F3] p-1.5">
                                                {item.media_type === 'video' ? (
                                                    <div className="relative aspect-video bg-[#1C1A16] overflow-hidden rounded-md">
                                                        <video
                                                            src={item.media_url}
                                                            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                                                            poster={item.thumbnail_url}
                                                            muted
                                                            loop
                                                            onMouseEnter={(e) => e.currentTarget.play()}
                                                            onMouseLeave={(e) => e.currentTarget.pause()}
                                                        />
                                                        {/* Brass-colored Play Badge */}
                                                        <div className="absolute inset-0 flex items-center justify-center bg-[#1C1A16]/20 group-hover:bg-[#1C1A16]/40 transition-colors duration-300">
                                                            <div className="w-16 h-16 rounded-full bg-[#FAF8F3]/90 backdrop-blur-sm border border-[#D4C5A9] text-[#1C1A16] flex items-center justify-center shadow-lg group-hover:bg-[#C4A55A] group-hover:text-white group-hover:border-[#C4A55A] group-hover:scale-110 transition-all duration-300">
                                                                <Play size={20} fill="currentColor" className="ml-1" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute bottom-4 left-4 px-3 py-1 bg-[#1C1A16]/60 backdrop-blur-sm rounded-full text-[9px] uppercase tracking-widest text-white/90">
                                                            Live Video
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="relative overflow-hidden rounded-md">
                                                        <img
                                                            src={item.media_url}
                                                            className="w-full h-auto object-cover max-h-[70vh] transition-transform duration-1000 ease-out group-hover:scale-105"
                                                            alt={`${event.title} photograph ${i + 1}`}
                                                        />
                                                        <div className="absolute inset-0 bg-[#1C1A16]/0 group-hover:bg-[#1C1A16]/5 transition-colors duration-300" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Fine-art print caption style */}
                                            <div className="mt-4 sm:mt-5 flex justify-between items-center px-1">
                                                <div className="space-y-0.5">
                                                    <span className="text-[9px] font-bold tracking-[0.25em] text-[#8B7355] uppercase">
                                                        {event.title} &middot; Plate {String(i + 1).padStart(2, '0')}
                                                    </span>
                                                    <h4 className="font-serif italic text-sm text-[#1C1A16]/70">
                                                        {item.media_type === 'video' ? 'Motion capture' : 'Still photograph'}
                                                    </h4>
                                                </div>
                                                <span className="text-[10px] font-medium tracking-widest uppercase text-[#1C1A16]/40 group-hover:text-[#8B7355] transition-colors">
                                                    Expand details &rarr;
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Call to Action: luxury invitation style ── */}
                    <div className="mt-32 max-w-4xl mx-auto p-10 md:p-16 border border-[#D4C5A9] bg-[#F5F0E8] rounded-[2rem] shadow-sm relative overflow-hidden text-center space-y-8">
                        {/* Decorative thin double border */}
                        <div className="absolute inset-2 border border-[#D4C5A9]/30 rounded-[1.7rem] pointer-events-none" />
                        
                        <div className="space-y-3 relative z-10">
                            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8B7355]">
                                Bespoke Celebrations
                            </span>
                            <h2 className="font-serif italic text-3xl md:text-5xl text-[#1C1A16]">
                                Inspired by this creation?
                            </h2>
                            <div className="w-16 h-px bg-[#C4A55A] mx-auto my-4" />
                            <p className="text-sm text-[#1C1A16]/70 max-w-lg mx-auto font-sans leading-relaxed">
                                Let us collaborate to design your next milestone. Connect with {event.planner.name} to design an unforgettable experience tailored exactly to your vision.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 pt-4">
                            <Link 
                                href={event.planner.username ? `/planner/${event.planner.username}?book=true` : `/planner/profile/${event.id}?book=true`} 
                                className="w-full sm:w-auto"
                            >
                                <button className="om-btn-primary w-full shadow-sm">
                                    Commission Planner
                                </button>
                            </Link>
                            <button 
                                onClick={handleShare} 
                                className="om-btn-outline w-full text-[#1C1A16] border-[#D4C5A9] hover:bg-[#FAF8F3] transition-all"
                            >
                                Share Album
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Elegant Art Lightbox / Popup ── */}
            {selectedMedia && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div 
                        className="absolute inset-0 bg-[#1C1A16]/95 backdrop-blur-md" 
                        onClick={() => setSelectedMedia(null)} 
                    />
                    
                    {/* Close button - rotating brass ring */}
                    <button
                        onClick={() => setSelectedMedia(null)}
                        className="absolute top-6 right-6 sm:top-8 sm:right-8 z-[160] w-12 h-12 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 flex items-center justify-center text-white/80 hover:text-white transition-all duration-300 hover:rotate-90 shadow-lg"
                        title="Close Gallery Viewer"
                    >
                        <X size={20} />
                    </button>

                    <div className="relative z-10 max-w-5xl w-full aspect-auto animate-in zoom-in-95 duration-300 flex flex-col items-center">
                        <div className="bg-[#FAF8F3] p-3 sm:p-5 pb-5 sm:pb-8 border border-[#D4C5A9] shadow-2xl rounded-2xl w-full max-h-[85vh] flex flex-col justify-between">
                            {/* Inner Picture Frame border */}
                            <div className="relative border border-[#D4C5A9]/40 rounded-lg p-1 bg-white overflow-hidden flex-1 flex items-center justify-center">
                                {selectedMedia.media_type === 'video' ? (
                                    <video
                                        src={selectedMedia.media_url}
                                        className="w-auto h-auto max-w-full max-h-[55vh] rounded-md shadow-inner"
                                        controls
                                        autoPlay
                                    />
                                ) : (
                                    <img
                                        src={selectedMedia.media_url}
                                        className="w-auto h-auto max-w-full max-h-[55vh] object-contain rounded-md shadow-inner"
                                        alt="Gallery view"
                                    />
                                )}
                            </div>

                            {/* Caption info below the pop-up */}
                            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-2">
                                <div>
                                    <span className="text-[9px] font-bold tracking-[0.2em] text-[#8B7355] uppercase">
                                        Exhibited Plate
                                    </span>
                                    <h4 className="font-serif italic text-2xl text-[#1C1A16] mt-0.5">
                                        {event.title}
                                    </h4>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button 
                                        onClick={handleShare}
                                        className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-[#D4C5A9] rounded-xl hover:bg-[#F5F0E8] transition-colors w-full sm:w-auto text-center"
                                    >
                                        Share Plate Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
