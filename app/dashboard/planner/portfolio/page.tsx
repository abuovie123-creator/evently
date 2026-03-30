"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import {
    Plus,
    ImageIcon,
    Video,
    Trash2,
    ExternalLink,
    ArrowLeft,
    Loader2,
    Calendar,
    MapPin,
    Tag,
    X,
    LayoutGrid,
    ChevronRight,
    Images,
    ArrowRight,
    Save,
    Instagram,
    Twitter,
    Linkedin,
    Facebook,
    Mail,
    Globe
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Event {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    location: string;
    slug: string;
    created_at: string;
}

interface AlbumMedia {
    id: string;
    event_id: string;
    media_url: string;
    media_type: 'image' | 'video';
    display_order: number;
}

export default function PlannerPortfolio() {
    const { showToast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [eventMedia, setEventMedia] = useState<AlbumMedia[]>([]);
    const [imageLimit, setImageLimit] = useState(5);
    const [currentImageCount, setCurrentImageCount] = useState(0);
    const [stats, setStats] = useState({
        events_completed: 0,
        years_experience: 0,
        clients_served: 0
    });
    const [socialLinks, setSocialLinks] = useState({
        instagram_url: "",
        twitter_url: "",
        linkedin_url: "",
        facebook_url: "",
        public_email: ""
    });
    const [isSavingStats, setIsSavingStats] = useState(false);
    const [isSavingSocial, setIsSavingSocial] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        category: "Wedding",
        date: "",
        location: ""
    });

    const generateSlug = (title: string) => {
        return title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 6);
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            router.push("/auth/login");
            return;
        }

        const userId = session.user.id;

        // Fetch user's events
        const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .eq('planner_id', userId)
            .order('created_at', { ascending: false });

        if (eventsError) {
            showToast("Failed to load events", "error");
        } else {
            setEvents(eventsData || []);
        }

        // Fetch profile and plan info
        const { data: profile } = await supabase
            .from('profiles')
            .select('plan_id, events_completed, years_experience, clients_served, instagram_url, twitter_url, linkedin_url, facebook_url, public_email')
            .eq('id', userId)
            .single();

        const { data: settings } = await supabase
            .from('platform_settings')
            .select('subscription_plans')
            .eq('id', 'default')
            .single();

        if (profile) {
            setStats({
                events_completed: profile.events_completed || 0,
                years_experience: profile.years_experience || 0,
                clients_served: profile.clients_served || 0
            });

            setSocialLinks({
                instagram_url: profile.instagram_url || "",
                twitter_url: profile.twitter_url || "",
                linkedin_url: profile.linkedin_url || "",
                facebook_url: profile.facebook_url || "",
                public_email: profile.public_email || ""
            });

            if (settings) {
                const plans = settings.subscription_plans || [];
                const userPlan = plans.find((p: any) => p.id === (profile.plan_id || 'starter')) || plans[0];
                const limit = userPlan?.imageLimit === -1 ? 9999 : (userPlan?.imageLimit || (userPlan?.id === 'pro' ? 25 : 5));
                setImageLimit(limit);
            }
        }

        // Fetch total image count for the user
        const { count } = await supabase
            .from('album_media')
            .select('id', { count: 'exact', head: true })
            .filter('event_id', 'in',
                supabase
                    .from('events')
                    .select('id')
                    .eq('planner_id', userId)
            );

        setCurrentImageCount(count || 0);
        setIsLoading(false);
    }, [router, showToast]);

    const fetchMedia = useCallback(async (eventId: string) => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('album_media')
            .select('*')
            .eq('event_id', eventId)
            .order('display_order', { ascending: true });

        if (error) {
            showToast("Failed to load media", "error");
        } else {
            setEventMedia(data || []);
        }
    }, [showToast]);

    const handleSaveStats = async () => {
        setIsSavingStats(true);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    events_completed: stats.events_completed,
                    years_experience: stats.years_experience,
                    clients_served: stats.clients_served
                })
                .eq('id', session.user.id);

            if (error) throw error;
            showToast("Portfolio highlights updated!", "success");
        } catch (error: any) {
            showToast("Failed to update highlights", "error");
        } finally {
            setIsSavingStats(false);
        }
    };

    const handleSaveSocial = async () => {
        setIsSavingSocial(true);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    instagram_url: socialLinks.instagram_url,
                    twitter_url: socialLinks.twitter_url,
                    linkedin_url: socialLinks.linkedin_url,
                    facebook_url: socialLinks.facebook_url,
                    public_email: socialLinks.public_email
                })
                .eq('id', session.user.id);

            if (error) throw error;
            showToast("Social links updated!", "success");
        } catch (error: any) {
            showToast("Failed to update social links", "error");
        } finally {
            setIsSavingSocial(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (selectedEvent) {
            fetchMedia(selectedEvent.id);
        }
    }, [selectedEvent, fetchMedia]);

    const handleCreateEvent = async () => {
        if (!newEvent.title || !newEvent.date) {
            showToast("Please fill in title and date", "error");
            return;
        }

        setIsSaving(true);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        try {
            const slug = generateSlug(newEvent.title);
            const { data, error } = await supabase
                .from('events')
                .insert({
                    planner_id: session?.user.id,
                    title: newEvent.title,
                    description: newEvent.description,
                    category: newEvent.category,
                    date: newEvent.date,
                    location: newEvent.location,
                    slug: slug
                })
                .select()
                .single();

            if (error) throw error;

            showToast("Event created successfully!", "success");
            setEvents([data, ...events]);
            setShowAddModal(false);
            setNewEvent({ title: "", description: "", category: "Wedding", date: "", location: "" });
            setSelectedEvent(data);
        } catch (error: any) {
            showToast(error.message || "Failed to create event", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const files = e.target.files;
        if (!files || !selectedEvent) return;

        if (type === 'image' && currentImageCount >= imageLimit) {
            showToast(`You have reached your limit of ${imageLimit} images. Upgrade your plan to add more.`, "error");
            return;
        }

        setIsUploading(true);
        const supabase = createClient();

        try {
            const uploadPromises = Array.from(files).map(async (file, index) => {
                if (type === 'image' && currentImageCount + index >= imageLimit) {
                    return null;
                }

                const fileExt = file.name.split('.').pop();
                const fileName = `${selectedEvent.id}-${Date.now()}-${index}.${fileExt}`;
                const filePath = `events/${selectedEvent.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('portfolio-media')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('portfolio-media')
                    .getPublicUrl(filePath);

                const { data: mediaRecord, error: dbError } = await supabase
                    .from('album_media')
                    .insert({
                        event_id: selectedEvent.id,
                        media_url: publicUrl,
                        media_type: type,
                        display_order: eventMedia.length + index
                    })
                    .select()
                    .single();

                if (dbError) throw dbError;
                return mediaRecord;
            });

            const results = await Promise.all(uploadPromises);
            const successfulUploads = results.filter(r => r !== null) as AlbumMedia[];

            if (successfulUploads.length < files.length) {
                showToast(`Uploaded ${successfulUploads.length} items. Limit reached.`, "warning");
            } else {
                showToast("Media uploaded successfully!", "success");
            }

            setEventMedia([...eventMedia, ...successfulUploads]);
            setCurrentImageCount(prev => prev + successfulUploads.length);
        } catch (error: any) {
            console.error("Upload error:", error);
            showToast(error.message || "Failed to upload media", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleMoveMedia = async (index: number, direction: 'up' | 'down') => {
        const newMedia = [...eventMedia];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newMedia.length) return;

        // Swap
        const [movedItem] = newMedia.splice(index, 1);
        newMedia.splice(targetIndex, 0, movedItem);

        // Update state immediately for responsiveness
        setEventMedia(newMedia);

        // Persist to DB
        const supabase = createClient();
        const updates = newMedia.map((item, idx) => ({
            id: item.id,
            display_order: idx,
            event_id: item.event_id,
            media_url: item.media_url,
            media_type: item.media_type
        }));

        const { error } = await supabase
            .from('album_media')
            .upsert(updates);

        if (error) {
            showToast("Failed to save new order", "error");
            // Revert on error? Or just fetch again
            if (selectedEvent) fetchMedia(selectedEvent.id);
        }
    };

    const handleDeleteMedia = async (mediaId: string, mediaUrl: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        const supabase = createClient();
        try {
            // Extract file path from URL (Supabase URL structure)
            // https://[id].supabase.co/storage/v1/object/public/portfolio-media/events/[event_id]/[file_name]
            const pathParts = mediaUrl.split('/portfolio-media/');
            if (pathParts.length > 1) {
                const filePath = pathParts[1];
                await supabase.storage.from('portfolio-media').remove([filePath]);
            }

            const { error } = await supabase
                .from('album_media')
                .delete()
                .eq('id', mediaId);

            if (error) throw error;

            setEventMedia(eventMedia.filter(m => m.id !== mediaId));
            if (eventMedia.find(m => m.id === mediaId)?.media_type === 'image') {
                setCurrentImageCount(prev => prev - 1);
            }
            showToast("Item deleted", "success");
        } catch (error: any) {
            showToast("Failed to delete item", "error");
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (!confirm("Are you sure? This will delete the event and all its media.")) return;

        const supabase = createClient();
        try {
            // Media will be deleted automatically due to ON DELETE CASCADE on DB level, 
            // but we might want to cleanup storage too.
            // For now let's just delete the event.
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', eventId);

            if (error) throw error;

            setEvents(events.filter(e => e.id !== eventId));
            if (selectedEvent?.id === eventId) {
                setSelectedEvent(null);
                setEventMedia([]);
            }
            showToast("Event deleted", "success");
            // Refresh counts
            fetchData();
        } catch (error: any) {
            showToast("Failed to delete event", "error");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
            </div>
        );
    }

    return (
        <main className="min-h-screen p-6 md:p-8 pt-24 md:pt-32 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 glass-panel p-6 md:p-8 rounded-[2rem] border-foreground/5 bg-foreground/[0.02]">
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <Link href="/dashboard/planner" className="p-3 glass-panel rounded-2xl hover:bg-white/10 transition-colors shrink-0">
                        <ArrowLeft size={20} className="text-gray-400" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight truncate">Portfolio & Albums</h1>
                        <p className="text-gray-400 text-xs md:text-sm truncate">Manage your event albums shown publicly.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
                    {/* Usage Indicator */}
                    <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Image Usage</span>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="flex-1 sm:w-32 h-2 bg-foreground/5 rounded-full overflow-hidden border border-foreground/5">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${currentImageCount >= imageLimit ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
                                    style={{ width: `${Math.min(100, (currentImageCount / imageLimit) * 100)}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold font-mono whitespace-nowrap text-foreground">{currentImageCount} / {imageLimit}</span>
                        </div>
                    </div>

                    <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto h-12 px-8 rounded-2xl shadow-lg shadow-blue-600/20 text-sm font-bold shrink-0">
                        <Plus size={18} className="mr-2" /> New Album
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Events Sidebar/List */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Portfolio Highlights Editor */}
                    <Card className="p-5 border-blue-500/10 bg-blue-500/[0.02]" hover={false}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Portfolio Highlights</h4>
                                <Button
                                    size="sm"
                                    variant="glass"
                                    className="h-7 px-3 text-[9px] font-black uppercase tracking-widest border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                                    onClick={handleSaveStats}
                                    disabled={isSavingStats}
                                >
                                    {isSavingStats ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} className="mr-1.5" />}
                                    Update
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase">Events Completed</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            className="h-9 bg-foreground/[0.03] border-foreground/5 text-xs font-bold pl-3 pr-8"
                                            value={stats.events_completed}
                                            onChange={(e) => setStats({ ...stats, events_completed: parseInt(e.target.value) || 0 })}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">+</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase">Years of Experience</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            className="h-9 bg-white/[0.03] border-white/5 text-xs font-bold pl-3 pr-8"
                                            value={stats.years_experience}
                                            onChange={(e) => setStats({ ...stats, years_experience: parseInt(e.target.value) || 0 })}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-600">+</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase">Happy Clients</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            className="h-9 bg-white/[0.03] border-white/5 text-xs font-bold pl-3 pr-8"
                                            value={stats.clients_served}
                                            onChange={(e) => setStats({ ...stats, clients_served: parseInt(e.target.value) || 0 })}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-600">+</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Social & Contact Links */}
                    <Card className="p-5 border-blue-500/10 bg-blue-500/[0.01]" hover={false}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Social & Contact</h4>
                                <Button
                                    size="sm"
                                    variant="glass"
                                    className="h-7 px-3 text-[9px] font-black uppercase tracking-widest border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                                    onClick={handleSaveSocial}
                                    disabled={isSavingSocial}
                                >
                                    {isSavingSocial ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} className="mr-1.5" />}
                                    Save Links
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-500 transition-colors">
                                            <Instagram size={14} />
                                        </div>
                                        <Input
                                            placeholder="Instagram URL"
                                            className="h-9 pl-10 bg-foreground/[0.03] border-foreground/5 text-xs"
                                            value={socialLinks.instagram_url}
                                            onChange={(e) => setSocialLinks({ ...socialLinks, instagram_url: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                            <Twitter size={14} />
                                        </div>
                                        <Input
                                            placeholder="Twitter URL"
                                            className="h-9 pl-10 bg-foreground/[0.03] border-foreground/5 text-xs"
                                            value={socialLinks.twitter_url}
                                            onChange={(e) => setSocialLinks({ ...socialLinks, twitter_url: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-700 transition-colors">
                                            <Linkedin size={14} />
                                        </div>
                                        <Input
                                            placeholder="LinkedIn URL"
                                            className="h-9 pl-10 bg-foreground/[0.03] border-foreground/5 text-xs"
                                            value={socialLinks.linkedin_url}
                                            onChange={(e) => setSocialLinks({ ...socialLinks, linkedin_url: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-600 transition-colors">
                                            <Facebook size={14} />
                                        </div>
                                        <Input
                                            placeholder="Facebook URL"
                                            className="h-9 pl-10 bg-foreground/[0.03] border-foreground/5 text-xs"
                                            value={socialLinks.facebook_url}
                                            onChange={(e) => setSocialLinks({ ...socialLinks, facebook_url: e.target.value })}
                                        />
                                    </div>
                                    <div className="pt-2 border-t border-foreground/5">
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                                                <Mail size={14} />
                                            </div>
                                            <Input
                                                placeholder="Public Business Email"
                                                className="h-9 pl-10 bg-foreground/[0.03] border-foreground/5 text-xs"
                                                value={socialLinks.public_email}
                                                onChange={(e) => setSocialLinks({ ...socialLinks, public_email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <LayoutGrid size={18} className="text-blue-400" /> Your Albums
                    </h3>

                    <div className="grid grid-cols-1 gap-3">
                        {events.length === 0 ? (
                            <Card className="p-16 text-center border-dashed border-white/10 flex flex-col items-center space-y-6" hover={false}>
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500">
                                    <Images size={32} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-gray-400 font-bold">No albums yet</p>
                                    <p className="text-gray-600 text-xs max-w-[200px] mx-auto italic">Showcase your best work to attract more clients.</p>
                                </div>
                                <Button onClick={() => setShowAddModal(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                                    <Plus size={16} className="mr-2" /> Create First Album
                                </Button>
                            </Card>
                        ) : events.map((event) => (
                            <button
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all group flex items-center justify-between ${selectedEvent?.id === event.id
                                    ? "bg-foreground/10 border-blue-500/50 shadow-lg shadow-blue-500/5"
                                    : "glass-panel border-foreground/5 hover:border-foreground/20"
                                    }`}
                            >
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm group-hover:text-blue-400 transition-colors">{event.title}</h4>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium">
                                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(event.date).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1 font-bold text-blue-400 uppercase tracking-tighter bg-blue-500/10 px-1.5 py-0.5 rounded-md">{event.category}</span>
                                    </div>
                                </div>
                                <ChevronRight size={16} className={`text-gray-600 transition-transform ${selectedEvent?.id === event.id ? "rotate-90 text-blue-400" : ""}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Media Management Area */}
                <div className="lg:col-span-8">
                    {!selectedEvent ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center glass-panel rounded-[2rem] border-white/5 space-y-4 border-dashed">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
                                <Images size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-gray-400">Select an album to manage</h3>
                                <p className="text-sm text-gray-600">Choose an existing album or create a new one to start adding media.</p>
                            </div>
                        </div>
                    ) : (
                        <Card className="space-y-8 p-8" hover={false}>
                            {/* Selected Event Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/5 pb-8">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-black">{selectedEvent.title}</h2>
                                        <Link href={`/events/${selectedEvent.slug}`} target="_blank" className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-blue-400 transition-all">
                                            <ExternalLink size={16} />
                                        </Link>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1.5 bg-foreground/5 px-2.5 py-1.5 rounded-lg border border-foreground/5"><Calendar size={14} className="text-blue-500" /> {new Date(selectedEvent.date).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1.5 bg-foreground/5 px-2.5 py-1.5 rounded-lg border border-foreground/5"><MapPin size={14} className="text-blue-500" /> {selectedEvent.location || "Online"}</span>
                                        <span className="flex items-center gap-1.5 bg-foreground/5 px-2.5 py-1.5 rounded-lg border border-foreground/5"><Tag size={14} className="text-blue-500" /> {selectedEvent.category}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 max-w-xl italic">"{selectedEvent.description || "No description provided."}"</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleDeleteEvent(selectedEvent.id)} className="text-red-400 hover:text-red-500 hover:bg-red-500/10 border-red-500/20">
                                        <Trash2 size={14} className="mr-2" /> Delete Album
                                    </Button>
                                </div>
                            </div>

                            {/* Media Section */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <ImageIcon size={18} className="text-blue-400" /> Album Media
                                        <span className="text-[10px] font-bold text-muted-foreground ml-2 bg-foreground/5 px-2 py-0.5 rounded-full">{eventMedia.length} Items</span>
                                    </h3>

                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <Button size="sm" variant="outline" className="text-xs h-9 px-4" disabled={isUploading || currentImageCount >= imageLimit}>
                                                <Plus size={14} className="mr-2" /> Add Images
                                            </Button>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => handleMediaUpload(e, 'image')}
                                                disabled={isUploading || currentImageCount >= imageLimit}
                                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-wait"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Button size="sm" variant="outline" className="text-xs h-9 px-4" disabled={isUploading}>
                                                <Plus size={14} className="mr-2" /> Add Video
                                            </Button>
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => handleMediaUpload(e, 'video')}
                                                disabled={isUploading}
                                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-wait"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {isUploading && (
                                    <div className="p-4 glass-panel border-blue-500/20 rounded-xl flex items-center justify-center gap-3 animate-pulse">
                                        <Loader2 size={16} className="animate-spin text-blue-500" />
                                        <span className="text-xs font-bold text-blue-400">Uploading media to secure storage...</span>
                                    </div>
                                )}

                                {eventMedia.length === 0 ? (
                                    <div className="p-16 text-center glass-panel rounded-2xl border-white/5 border-dashed">
                                        <p className="text-gray-500 text-sm italic">This album is empty. Upload some gorgeous photos or videos of your work!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {eventMedia.map((media, i) => (
                                            <div key={media.id} className="relative aspect-square rounded-xl overflow-hidden glass-panel border-foreground/10 group bg-background/40 backdrop-blur-md">
                                                {media.media_type === 'image' ? (
                                                    <img src={media.media_url} alt="Event Media" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Video className="text-blue-500" size={32} />
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="glass"
                                                            size="sm"
                                                            className="p-2 rounded-full h-8 w-8 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white disabled:opacity-30"
                                                            onClick={(e) => { e.stopPropagation(); handleMoveMedia(i, 'up'); }}
                                                            disabled={i === 0}
                                                        >
                                                            <ArrowLeft size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="glass"
                                                            size="sm"
                                                            className="p-2 rounded-full h-8 w-8 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white disabled:opacity-30"
                                                            onClick={(e) => { e.stopPropagation(); handleMoveMedia(i, 'down'); }}
                                                            disabled={i === eventMedia.length - 1}
                                                        >
                                                            <ArrowRight size={14} />
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        variant="glass"
                                                        size="sm"
                                                        className="p-2 rounded-full h-8 w-8 flex items-center justify-center bg-red-500/20 hover:bg-red-500/40 text-red-400"
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteMedia(media.id, media.media_url); }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>

                                                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-background/50 backdrop-blur-md text-[8px] font-bold uppercase tracking-widest border border-foreground/10">
                                                    {media.media_type}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Add Event Modal Overlay */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSaving && setShowAddModal(false)} />
                    <Card className="relative w-full max-w-lg p-8 space-y-8 animate-in zoom-in-95 duration-300" hover={false}>
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black">Create New Album</h3>
                                <p className="text-gray-400 text-sm">Group your beautiful event media into a single album.</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Event Title</label>
                                <Input
                                    placeholder="e.g. Summer Beach Wedding"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Category</label>
                                    <select
                                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none appearance-none"
                                        value={newEvent.category}
                                        onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                                    >
                                        <option value="Wedding" className="bg-background">Wedding</option>
                                        <option value="Corporate" className="bg-background">Corporate</option>
                                        <option value="Birthday" className="bg-background">Birthday</option>
                                        <option value="Concert" className="bg-background">Concert</option>
                                        <option value="Other" className="bg-background">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Event Date</label>
                                    <Input
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Location</label>
                                <Input
                                    placeholder="e.g. Lagos, Nigeria"
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Description</label>
                                <Textarea
                                    placeholder="Briefly describe the theme, highlight or special moments of this event..."
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-white/5">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowAddModal(false)}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={handleCreateEvent}
                                disabled={isSaving}
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Create Album"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </main>
    );
}
