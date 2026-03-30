"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { Upload, Save, User, MapPin, Briefcase, FileText, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PlannerProfileEdit() {
    const { showToast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [profile, setProfile] = useState({
        full_name: "",
        username: "",
        bio: "",
        location: "",
        category: "",
        avatar_url: "",
        events_completed: 0,
        years_experience: 0,
        clients_served: 0,
        instagram_url: "",
        twitter_url: "",
        linkedin_url: "",
        facebook_url: "",
        public_email: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/auth/login");
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, username, bio, location, category, avatar_url, instagram_url, twitter_url, linkedin_url, facebook_url, public_email')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error("Error fetching profile:", error);
                showToast("Failed to load profile", "error");
            } else if (data) {
                setProfile({
                    full_name: data.full_name || "",
                    username: data.username || "",
                    bio: data.bio || "",
                    location: data.location || "",
                    category: data.category || "",
                    avatar_url: data.avatar_url || "",
                    events_completed: data.events_completed || 0,
                    years_experience: data.years_experience || 0,
                    clients_served: data.clients_served || 0,
                    instagram_url: data.instagram_url || "",
                    twitter_url: data.twitter_url || "",
                    linkedin_url: data.linkedin_url || "",
                    facebook_url: data.facebook_url || "",
                    public_email: data.public_email || ""
                });
            }
            setIsLoading(false);
        };

        fetchProfile();
    }, [router, showToast]);

    const handleInputChange = (field: keyof typeof profile, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            showToast("Please select an image file", "error");
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showToast("Image must be less than 5MB", "error");
            return;
        }

        setIsUploading(true);
        const supabase = createClient();

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            const fileExt = file.name.split('.').pop();
            const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload to portfolio-media bucket
            const { error: uploadError } = await supabase.storage
                .from('portfolio-media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('portfolio-media')
                .getPublicUrl(filePath);

            setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
            showToast("Avatar uploaded successfully", "success");
        } catch (error: any) {
            console.error("Upload error:", error);
            showToast(error.message || "Failed to upload image", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const supabase = createClient();

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    username: profile.username.toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]/g, ''),
                    bio: profile.bio,
                    location: profile.location,
                    category: profile.category,
                    avatar_url: profile.avatar_url,
                    events_completed: Number(profile.events_completed),
                    years_experience: Number(profile.years_experience),
                    clients_served: Number(profile.clients_served),
                    instagram_url: profile.instagram_url,
                    twitter_url: profile.twitter_url,
                    linkedin_url: profile.linkedin_url,
                    facebook_url: profile.facebook_url,
                    public_email: profile.public_email,
                    updated_at: new Date().toISOString()
                })
                .eq('id', session.user.id);

            if (error) throw error;

            showToast("Profile saved successfully!", "success");
            router.push("/dashboard/planner");
        } catch (error: any) {
            console.error("Save error:", error);
            showToast(error.message || "Failed to save profile", "error");
        } finally {
            setIsSaving(false);
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
        <main className="min-h-screen p-6 md:p-8 pt-24 md:pt-32 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Compact Header */}
            <div className="flex items-center justify-between glass-panel p-4 md:p-6 rounded-3xl border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/planner" className="p-2 glass-panel rounded-xl hover:bg-white/10 transition-colors shrink-0">
                        <ArrowLeft size={18} className="text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight">Profile Settings</h1>
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Public Identity</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="glass"
                        onClick={() => router.push("/dashboard/planner")}
                        disabled={isSaving}
                        className="hidden sm:flex h-10 px-6 font-bold text-gray-400 hover:text-white border-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || isUploading}
                        className="bg-blue-600 hover:bg-blue-700 h-10 px-8 font-black shadow-lg shadow-blue-600/20 uppercase tracking-widest text-[10px]"
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} className="mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Avatar & Basic Info */}
                <div className="space-y-6">
                    <Card className="p-6 space-y-6" hover={false}>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="relative w-28 h-28 rounded-full overflow-hidden glass-panel border-2 border-blue-500/20 bg-black/50 group">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-600"><User size={32} /></div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <Upload size={20} className="text-white" />
                                </div>
                                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-white">Profile Photo</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Click image to change</p>
                            </div>
                            {isUploading && <p className="text-[10px] text-blue-400 animate-pulse font-bold">Uploading...</p>}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Display Name</label>
                                <Input
                                    className="h-11 bg-white/[0.03] border-white/10"
                                    placeholder="Your Name"
                                    value={profile.full_name}
                                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Handle (@username)</label>
                                <Input
                                    className="h-11 bg-white/[0.03] border-white/10"
                                    placeholder="handle"
                                    value={profile.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right/Middle Column: Bio & Pro Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6" hover={false}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Business Category</label>
                                <select
                                    className="w-full h-11 bg-white/[0.03] border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all appearance-none"
                                    value={profile.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                >
                                    <option value="Wedding Planner" className="bg-gray-900">Wedding Planner</option>
                                    <option value="Corporate Events" className="bg-gray-900">Corporate Events</option>
                                    <option value="Party Planner" className="bg-gray-900">Party Planner</option>
                                    <option value="Event Designer" className="bg-gray-900">Event Designer</option>
                                    <option value="Other" className="bg-gray-900">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Primary Location</label>
                                <Input
                                    className="h-11 bg-white/[0.03] border-white/10"
                                    placeholder="e.g. Lagos, Nigeria"
                                    value={profile.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                />
                            </div>

                            {/* Pro Stats Grid */}
                            <div className="md:col-span-2 grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Events Done</label>
                                    <Input
                                        type="number"
                                        className="h-11 bg-white/[0.03] border-white/10"
                                        value={profile.events_completed}
                                        onChange={(e) => setProfile(p => ({ ...p, events_completed: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Years Active</label>
                                    <Input
                                        type="number"
                                        className="h-11 bg-white/[0.03] border-white/10"
                                        value={profile.years_experience}
                                        onChange={(e) => setProfile(p => ({ ...p, years_experience: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Happy Clients</label>
                                    <Input
                                        type="number"
                                        className="h-11 bg-white/[0.03] border-white/10"
                                        value={profile.clients_served}
                                        onChange={(e) => setProfile(p => ({ ...p, clients_served: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2 pt-4">
                                <Textarea
                                    rows={4}
                                    className="bg-white/[0.03] border-white/10 min-h-[140px] resize-none"
                                    placeholder="Your experience and vision..."
                                    value={profile.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                />
                            </div>

                            {/* Social Media Integration */}
                            <div className="md:col-span-2 pt-6 border-t border-white/5 space-y-6">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="text-blue-500" size={18} />
                                    <h3 className="text-sm font-black uppercase tracking-widest">Connect Socials</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Instagram URL</label>
                                        <Input
                                            className="h-11 bg-white/[0.03] border-white/10"
                                            placeholder="https://instagram.com/..."
                                            value={profile.instagram_url}
                                            onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Twitter URL</label>
                                        <Input
                                            className="h-11 bg-white/[0.03] border-white/10"
                                            placeholder="https://twitter.com/..."
                                            value={profile.twitter_url}
                                            onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">LinkedIn URL</label>
                                        <Input
                                            className="h-11 bg-white/[0.03] border-white/10"
                                            placeholder="https://linkedin.com/in/..."
                                            value={profile.linkedin_url}
                                            onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Facebook URL</label>
                                        <Input
                                            className="h-11 bg-white/[0.03] border-white/10"
                                            placeholder="https://facebook.com/..."
                                            value={profile.facebook_url}
                                            onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Public Portfolio Email</label>
                                        <Input
                                            className="h-11 bg-white/[0.03] border-white/10"
                                            placeholder="contact@example.com"
                                            value={profile.public_email}
                                            onChange={(e) => handleInputChange('public_email', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Mobile Actions */}
            <div className="sm:hidden flex flex-col gap-3">
                <Button
                    onClick={handleSave}
                    className="bg-blue-600 w-full h-12 font-black uppercase tracking-widest text-xs"
                >
                    Save Profile
                </Button>
                <Button
                    variant="glass"
                    onClick={() => router.push("/dashboard/planner")}
                    className="w-full h-12 font-bold text-gray-400 border-white/5"
                >
                    Cancel
                </Button>
            </div>
        </main>
    );
}
