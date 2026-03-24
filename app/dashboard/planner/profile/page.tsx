"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { Upload, Save, User, MapPin, Briefcase, FileText, ArrowLeft, Loader2 } from "lucide-react";
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
        bio: "",
        location: "",
        category: "",
        avatar_url: ""
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
                .select('full_name, bio, location, category, avatar_url')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error("Error fetching profile:", error);
                showToast("Failed to load profile", "error");
            } else if (data) {
                setProfile({
                    full_name: data.full_name || "",
                    bio: data.bio || "",
                    location: data.location || "",
                    category: data.category || "",
                    avatar_url: data.avatar_url || ""
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
                    bio: profile.bio,
                    location: profile.location,
                    category: profile.category,
                    avatar_url: profile.avatar_url,
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
        <main className="min-h-screen p-6 md:p-8 pt-24 md:pt-32 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/planner" className="p-2 glass-panel rounded-xl hover:bg-white/10 transition-colors">
                    <ArrowLeft size={20} className="text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Edit Profile</h1>
                    <p className="text-gray-400 text-sm">Update your public profile details and avatar.</p>
                </div>
            </div>

            <Card className="p-8 space-y-8" hover={false}>
                {/* Avatar Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold">Profile Picture</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden glass-panel border border-white/10 bg-black/50 group flex-shrink-0">
                            {profile.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                    <User size={40} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload size={24} className="text-white" />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={isUploading}
                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-wait"
                            />
                        </div>
                        <div className="space-y-2 text-center sm:text-left">
                            <p className="text-sm font-bold">Upload a new avatar</p>
                            <p className="text-xs text-gray-500 max-w-xs">
                                Recommended size: 400x400px. JPG, PNG or WebP under 5MB.
                                Click the image to upload.
                            </p>
                            {isUploading && (
                                <p className="text-xs text-blue-400 font-bold flex items-center gap-1 justify-center sm:justify-start">
                                    <Loader2 size={12} className="animate-spin" /> Uploading...
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="h-px bg-white/5 w-full" />

                {/* Details Section */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold">Public Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                <User size={14} /> Full Name
                            </label>
                            <Input
                                placeholder="Your Name or Business Name"
                                value={profile.full_name}
                                onChange={(e) => handleInputChange('full_name', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                <Briefcase size={14} /> Category
                            </label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all appearance-none"
                                value={profile.category}
                                onChange={(e) => handleInputChange('category', e.target.value)}
                            >
                                <option value="" disabled className="bg-gray-900">Select a category</option>
                                <option value="Wedding Planner" className="bg-gray-900">Wedding Planner</option>
                                <option value="Corporate Events" className="bg-gray-900">Corporate Events</option>
                                <option value="Party Planner" className="bg-gray-900">Party Planner</option>
                                <option value="Event Designer" className="bg-gray-900">Event Designer</option>
                                <option value="Other" className="bg-gray-900">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                <MapPin size={14} /> Location
                            </label>
                            <Input
                                placeholder="e.g. Lagos, Nigeria"
                                value={profile.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                <FileText size={14} /> Bio
                            </label>
                            <Textarea
                                placeholder="Tell clients about your experience, style, and what makes your events special..."
                                value={profile.bio}
                                onChange={(e) => handleInputChange('bio', e.target.value)}
                                className="min-h-[120px]"
                            />
                            <p className="text-[10px] text-gray-500 text-right">
                                {profile.bio.length} characters
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/planner")}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || isUploading}
                        className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
                    >
                        {isSaving ? (
                            <><Loader2 size={16} className="animate-spin mr-2" /> Saving...</>
                        ) : (
                            <><Save size={16} className="mr-2" /> Save Profile</>
                        )}
                    </Button>
                </div>
            </Card>
        </main>
    );
}
