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
    const [isSavingImages, setIsSavingImages] = useState(false);

    const [profileImages, setProfileImages] = useState({
        avatar_url: "",
        cover_image_url: ""
    });

    // 10-15 Preset Male/Female avatars
    const PRESET_AVATARS = [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&gender=male",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&gender=female",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&gender=male",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&style=circle&gender=female",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&gender=male",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&gender=female",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=James&gender=male",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&gender=female",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=William&gender=male",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&gender=female"
    ];

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
            .select('plan_id, events_completed, years_experience, clients_served, instagram_url, twitter_url, linkedin_url, facebook_url, public_email, avatar_url, cover_image_url')
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

            setProfileImages({
                avatar_url: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
                cover_image_url: profile.cover_image_url || "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80"
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

    const handleSaveImages = async () => {
        setIsSavingImages(true);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    avatar_url: profileImages.avatar_url,
                    cover_image_url: profileImages.cover_image_url
                })
                .eq('id', session.user.id);

            if (error) throw error;
            showToast("Profile images updated successfully!", "success");
        } catch (error: any) {
            showToast("Failed to update images", "error");
        } finally {
            setIsSavingImages(false);
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSavingImages(true);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `cover-${session.user.id}-${Date.now()}.${fileExt}`;
            const filePath = `covers/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('portfolio-media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('portfolio-media')
                .getPublicUrl(filePath);

            setProfileImages(prev => ({ ...prev, cover_image_url: publicUrl }));
            showToast("Cover image uploaded! Click Save to apply.", "success");
        } catch (error: any) {
            console.error("Cover upload error:", error);
            showToast(error.message || "Failed to upload cover", "error");
        } finally {
            setIsSavingImages(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSavingImages(true);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `avatar-${session.user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('portfolio-media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('portfolio-media')
                .getPublicUrl(filePath);

            setProfileImages(prev => ({ ...prev, avatar_url: publicUrl }));
            showToast("Avatar uploaded! Click Save to apply.", "success");
        } catch (error: any) {
            console.error("Avatar upload error:", error);
            showToast(error.message || "Failed to upload avatar", "error");
        } finally {
            setIsSavingImages(false);
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
                <Loader2 className="animate-spin text-charcoal w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-surface/80 border border-border/60 backdrop-blur-md shadow-sm p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl">
                <div className="flex items-center gap-4 w-full lg:w-auto min-w-0">
                    <Link href="/dashboard/planner" className="p-2.5 sm:p-3 bg-surface border border-border/60 rounded-2xl sm:rounded-3xl hover:bg-black/5 transition-colors shrink-0">
                        <ArrowLeft size={18} className="text-muted-foreground" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif italic font-bold tracking-tight text-charcoal truncate">Portfolio & Albums</h1>
                        <p className="text-muted-foreground text-xs sm:text-sm truncate">Manage your event albums shown publicly.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
                    {/* Usage Indicator */}
                    <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Image Usage</span>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="flex-1 sm:w-32 h-2 bg-foreground/5 rounded-full overflow-hidden border border-foreground/5">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${currentImageCount >= imageLimit ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-gold shadow-[0_0_10px_rgba(196,165,90,0.5)]'}`}
                                    style={{ width: `${Math.min(100, (currentImageCount / imageLimit) * 100)}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold font-mono whitespace-nowrap text-foreground">{currentImageCount} / {imageLimit}</span>
                        </div>
                    </div>

                    <Button onClick={() => setShowAddModal(true)} className="bg-charcoal text-cream hover:bg-charcoal/90 w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 rounded-2xl sm:rounded-3xl shadow-lg shadow-charcoal/20 text-xs sm:text-sm font-bold shrink-0">
                        <Plus size={16} className="mr-2" /> New Album
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Events Sidebar/List */}
                <div className="lg:col-span-4 space-y-6 min-w-0 w-full">
                    {/* Portfolio Highlights Editor */}
                    <Card className="p-4 sm:p-5 border-border/60 bg-surface/80 rounded-2xl" hover={false}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Portfolio Highlights</h4>
                                <Button
                                    size="sm"
                                    variant="glass"
                                    className="h-7 px-3 text-[9px] font-black uppercase tracking-widest border-border/60 text-accent hover:bg-black/5"
                                    onClick={handleSaveStats}
                                    disabled={isSavingStats}
                                >
                                    {isSavingStats ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} className="mr-1.5" />}
                                    Update
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Events Completed</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            className="h-9 bg-surface border-border/60 text-xs font-bold pl-3 pr-8"
                                            value={stats.events_completed}
                                            onChange={(e) => setStats({ ...stats, events_completed: parseInt(e.target.value) || 0 })}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">+</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Years of Experience</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            className="h-9 bg-surface border-border/60 text-xs font-bold pl-3 pr-8"
                                            value={stats.years_experience}
                                            onChange={(e) => setStats({ ...stats, years_experience: parseInt(e.target.value) || 0 })}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">+</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Happy Clients</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            className="h-9 bg-surface border-border/60 text-xs font-bold pl-3 pr-8"
                                            value={stats.clients_served}
                                            onChange={(e) => setStats({ ...stats, clients_served: parseInt(e.target.value) || 0 })}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">+</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Social & Contact Links */}
                    <Card className="p-4 sm:p-5 border-border/60 bg-surface/80 rounded-2xl" hover={false}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Social & Contact</h4>
                                <Button
                                    size="sm"
                                    variant="glass"
                                    className="h-7 px-3 text-[9px] font-black uppercase tracking-widest border-border/60 text-accent hover:bg-black/5"
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
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-pink-600 transition-colors">
                                            <Instagram size={14} />
                                        </div>
                                        <Input
                                            placeholder="Instagram URL"
                                            className="h-9 pl-10 bg-surface border-border/60 text-xs"
                                            value={socialLinks.instagram_url}
                                            onChange={(e) => setSocialLinks({ ...socialLinks, instagram_url: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors">
                                            <Twitter size={14} />
                                        </div>
                                        <Input
                                            placeholder="Twitter URL"
                                            className="h-9 pl-10 bg-surface border-border/60 text-xs"
                                            value={socialLinks.twitter_url}
                                            onChange={(e) => setSocialLinks({ ...socialLinks, twitter_url: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-700 transition-colors">
                                            <Linkedin size={14} />
                                        </div>
                                        <Input
                                            placeholder="LinkedIn URL"
                                            className="h-9 pl-10 bg-surface border-border/60 text-xs"
                                            value={socialLinks.linkedin_url}
                                            onChange={(e) => setSocialLinks({ ...socialLinks, linkedin_url: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-charcoal transition-colors">
                                            <Facebook size={14} />
                                        </div>
                                        <Input
                                            placeholder="Facebook URL"
                                            className="h-9 pl-10 bg-surface border-border/60 text-xs"
                                            value={socialLinks.facebook_url}
                                            onChange={(e) => setSocialLinks({ ...socialLinks, facebook_url: e.target.value })}
                                        />
                                    </div>
                                    <div className="pt-2 border-t border-border/40">
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-gold transition-colors">
                                                <Mail size={14} />
                                            </div>
                                            <Input
                                                placeholder="Public Business Email"
                                                className="h-9 pl-10 bg-surface border-border/60 text-xs"
                                                value={socialLinks.public_email}
                                                onChange={(e) => setSocialLinks({ ...socialLinks, public_email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Profile & Cover Images */}
                    <Card className="p-4 sm:p-5 border-border/60 bg-surface/80 rounded-2xl" hover={false}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Profile Defaults</h4>
                                <Button
                                    size="sm"
                                    variant="glass"
                                    className="h-7 px-3 text-[9px] font-black uppercase tracking-widest border-border/60 text-accent hover:bg-black/5"
                                    onClick={handleSaveImages}
                                    disabled={isSavingImages}
                                >
                                    {isSavingImages ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} className="mr-1.5" />}
                                    Save
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {/* Cover Image */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Cover Image</label>
                                        <label className={`relative inline-flex items-center justify-center cursor-pointer rounded-lg border border-border/60 bg-surface px-2.5 py-1 text-[10px] font-semibold text-charcoal shadow-sm hover:bg-black/5 transition-all select-none shrink-0 ${isSavingImages ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <Plus size={11} className="mr-1 shrink-0" />
                                            <span>Upload</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleCoverUpload}
                                                disabled={isSavingImages}
                                                className="sr-only"
                                            />
                                        </label>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors">
                                            <ImageIcon size={14} />
                                        </div>
                                        <Input
                                            placeholder="Or paste an image URL..."
                                            className="h-9 pl-10 bg-surface border-border/60 text-xs text-muted-foreground"
                                            value={profileImages.cover_image_url}
                                            onChange={(e) => setProfileImages({ ...profileImages, cover_image_url: e.target.value })}
                                        />
                                    </div>
                                    <div className="h-24 w-full rounded-2xl overflow-hidden bg-surface border border-border/60 relative group cursor-crosshair">
                                        <img src={profileImages.cover_image_url} className="w-full h-full object-cover" alt="Cover Preview" onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80")} />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-xs font-bold text-white tracking-widest uppercase">Cover Preview</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Avatar Selection */}
                                <div className="space-y-4 pt-4 border-t border-border/40">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full overflow-hidden shrink-0 border border-border/60 bg-black/10">
                                            <img src={profileImages.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} className="w-full h-full object-cover" alt="Current Avatar" onError={(e) => (e.currentTarget.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback")} />
                                        </div>
                                        <div className="space-y-2 flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[9px] font-bold text-muted-foreground uppercase">Profile Avatar</label>
                                                <label className={`relative inline-flex items-center justify-center cursor-pointer rounded-lg border border-border/60 bg-surface px-2.5 py-1 text-[10px] font-semibold text-charcoal shadow-sm hover:bg-black/5 transition-all select-none shrink-0 ${isSavingImages ? 'opacity-50 pointer-events-none' : ''}`}>
                                                    <Plus size={11} className="mr-1 shrink-0" />
                                                    <span>Upload</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleAvatarUpload}
                                                        disabled={isSavingImages}
                                                        className="sr-only"
                                                    />
                                                </label>
                                            </div>

                                            <div className="relative group">
                                                <Input
                                                    placeholder="Or Custom Image URL..."
                                                    className="h-8 bg-surface border-border/60 text-xs text-muted-foreground pl-3"
                                                    value={profileImages.avatar_url}
                                                    onChange={(e) => setProfileImages({ ...profileImages, avatar_url: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <label className="text-[9px] font-bold text-muted-foreground uppercase mb-2 block">Or choose a preset</label>
                                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                                            {PRESET_AVATARS.map((avatar, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setProfileImages({ ...profileImages, avatar_url: avatar })}
                                                    className={`aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 ${profileImages.avatar_url === avatar
                                                        ? "border-gold shadow-md scale-105 z-10"
                                                        : "border-transparent opacity-60 hover:opacity-100"
                                                        }`}
                                                >
                                                    <img src={avatar} className="w-full h-full object-cover" alt={`Avatar ${i + 1}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <h3 className="text-lg font-serif italic font-bold flex items-center gap-2 text-charcoal">
                        <LayoutGrid size={18} className="text-accent shrink-0" /> Your Albums
                    </h3>

                    <div className="grid grid-cols-1 gap-3">
                        {events.length === 0 ? (
                            <Card className="p-8 sm:p-12 text-center border-dashed border-border/80 flex flex-col items-center space-y-4 rounded-2xl bg-surface/60" hover={false}>
                                <div className="w-14 h-14 bg-foreground/5 rounded-full flex items-center justify-center text-muted-foreground">
                                    <Images size={28} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-charcoal font-bold text-sm">No albums yet</p>
                                    <p className="text-muted-foreground text-xs max-w-[220px] mx-auto italic">Showcase your best work to attract more clients.</p>
                                </div>
                                <Button onClick={() => setShowAddModal(true)} size="sm" className="bg-charcoal text-cream hover:bg-charcoal/90 rounded-2xl text-xs font-bold">
                                    <Plus size={14} className="mr-1.5" /> Create First Album
                                </Button>
                            </Card>
                        ) : events.map((event) => (
                            <button
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all group flex items-center justify-between gap-3 ${selectedEvent?.id === event.id
                                    ? "bg-foreground/5 border-gold shadow-sm"
                                    : "bg-surface/80 border-border/60 hover:border-gold/50"
                                    }`}
                            >
                                <div className="space-y-1 min-w-0 flex-1">
                                    <h4 className="font-bold text-sm text-charcoal group-hover:text-accent transition-colors truncate">{event.title}</h4>
                                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground font-medium">
                                        <span className="flex items-center gap-1 shrink-0"><Calendar size={10} /> {new Date(event.date).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1 font-bold text-accent uppercase tracking-tighter bg-foreground/5 px-1.5 py-0.5 rounded-md shrink-0">{event.category}</span>
                                    </div>
                                </div>
                                <ChevronRight size={16} className={`text-muted-foreground shrink-0 transition-transform ${selectedEvent?.id === event.id ? "rotate-90 text-accent" : ""}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Media Management Area */}
                <div className="lg:col-span-8 min-w-0 w-full">
                    {!selectedEvent ? (
                        <div className="h-full min-h-[320px] sm:min-h-[400px] flex flex-col items-center justify-center bg-surface/80 border border-border/60 rounded-2xl sm:rounded-3xl p-6 sm:p-10 space-y-4 border-dashed text-center">
                            <div className="w-14 h-14 bg-foreground/5 rounded-full flex items-center justify-center text-muted-foreground">
                                <Images size={28} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base sm:text-lg font-bold text-charcoal">Select an album to manage</h3>
                                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">Choose an existing album or create a new one to start adding media.</p>
                            </div>
                        </div>
                    ) : (
                        <Card className="space-y-6 sm:space-y-8 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border-border/60 bg-surface/80 shadow-sm" hover={false}>
                            {/* Selected Event Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 border-b border-border/60 pb-6 sm:pb-8">
                                <div className="space-y-3 flex-1 min-w-0 w-full">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h2 className="text-xl sm:text-2xl font-black text-charcoal break-words">{selectedEvent.title}</h2>
                                        <Link href={`/events/${selectedEvent.slug}`} target="_blank" className="p-2 hover:bg-black/5 rounded-lg text-muted-foreground hover:text-gold transition-all shrink-0">
                                            <ExternalLink size={16} />
                                        </Link>
                                    </div>
                                    <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1.5 bg-foreground/5 px-2.5 py-1.5 rounded-lg border border-border/40 shrink-0"><Calendar size={13} className="text-charcoal shrink-0" /> {new Date(selectedEvent.date).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1.5 bg-foreground/5 px-2.5 py-1.5 rounded-lg border border-border/40 shrink-0"><MapPin size={13} className="text-charcoal shrink-0" /> {selectedEvent.location || "Online"}</span>
                                        <span className="flex items-center gap-1.5 bg-foreground/5 px-2.5 py-1.5 rounded-lg border border-border/40 shrink-0"><Tag size={13} className="text-charcoal shrink-0" /> {selectedEvent.category}</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground max-w-xl italic break-words">"{selectedEvent.description || "No description provided."}"</p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto justify-end shrink-0">
                                    <Button variant="outline" size="sm" onClick={() => handleDeleteEvent(selectedEvent.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/30 w-full sm:w-auto text-xs">
                                        <Trash2 size={13} className="mr-1.5 shrink-0" /> Delete Album
                                    </Button>
                                </div>
                            </div>

                            {/* Media Section */}
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                    <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-charcoal">
                                        <ImageIcon size={18} className="text-accent shrink-0" />
                                        <span>Album Media</span>
                                        <span className="text-[10px] font-bold text-muted-foreground bg-foreground/5 px-2 py-0.5 rounded-full shrink-0">{eventMedia.length} Items</span>
                                    </h3>

                                    <div className="flex flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                        <label className={`relative inline-flex items-center justify-center cursor-pointer rounded-xl border border-border/80 bg-surface px-3 sm:px-4 py-2 text-xs font-semibold text-charcoal shadow-sm hover:bg-black/5 transition-all text-center flex-1 sm:flex-initial select-none shrink-0 ${isUploading || currentImageCount >= imageLimit ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <Plus size={14} className="mr-1.5 shrink-0" />
                                            <span>Add Images</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => handleMediaUpload(e, 'image')}
                                                disabled={isUploading || currentImageCount >= imageLimit}
                                                className="sr-only"
                                            />
                                        </label>
                                        <label className={`relative inline-flex items-center justify-center cursor-pointer rounded-xl border border-border/80 bg-surface px-3 sm:px-4 py-2 text-xs font-semibold text-charcoal shadow-sm hover:bg-black/5 transition-all text-center flex-1 sm:flex-initial select-none shrink-0 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <Plus size={14} className="mr-1.5 shrink-0" />
                                            <span>Add Video</span>
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => handleMediaUpload(e, 'video')}
                                                disabled={isUploading}
                                                className="sr-only"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {isUploading && (
                                    <div className="p-3.5 sm:p-4 bg-surface border border-border/60 shadow-sm rounded-2xl flex items-center justify-center gap-3 animate-pulse">
                                        <Loader2 size={16} className="animate-spin text-charcoal" />
                                        <span className="text-xs font-bold text-accent">Uploading media to secure storage...</span>
                                    </div>
                                )}

                                {eventMedia.length === 0 ? (
                                    <div className="p-8 sm:p-16 text-center bg-surface/60 border border-border/80 rounded-2xl sm:rounded-3xl border-dashed">
                                        <p className="text-muted-foreground text-xs sm:text-sm italic">This album is empty. Upload some gorgeous photos or videos of your work!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                        {eventMedia.map((media, i) => (
                                            <div key={media.id} className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-surface border border-border/60 group shadow-sm">
                                                {media.media_type === 'image' ? (
                                                    <img src={media.media_url} alt="Event Media" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Video className="text-charcoal" size={32} />
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

                                                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-md text-[8px] font-bold uppercase tracking-widest border border-border/40 text-charcoal">
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 transition-all animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSaving && setShowAddModal(false)} />
                    <Card className="relative w-full max-w-lg p-5 sm:p-8 space-y-5 sm:space-y-6 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border-border/80 bg-surface shadow-2xl" hover={false}>
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-xl sm:text-2xl font-serif italic font-bold text-charcoal">Create New Album</h3>
                                <p className="text-muted-foreground text-xs sm:text-sm">Group your beautiful event media into a single album.</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors text-muted-foreground">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Event Title</label>
                                <Input
                                    placeholder="e.g. Summer Beach Wedding"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                                    <select
                                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none appearance-none"
                                        value={newEvent.category}
                                        onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                                    >
                                        <option value="Wedding" className="bg-surface">Wedding</option>
                                        <option value="Corporate" className="bg-surface">Corporate</option>
                                        <option value="Birthday" className="bg-surface">Birthday</option>
                                        <option value="Concert" className="bg-surface">Concert</option>
                                        <option value="Other" className="bg-surface">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Event Date</label>
                                    <Input
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Location</label>
                                <Input
                                    placeholder="e.g. Lagos, Nigeria"
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                                <Textarea
                                    placeholder="Briefly describe the theme, highlight or special moments of this event..."
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-border/60">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowAddModal(false)}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-charcoal text-cream hover:bg-charcoal/90"
                                onClick={handleCreateEvent}
                                disabled={isSaving}
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Create Album"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
