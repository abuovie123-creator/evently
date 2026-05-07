"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { Save, User, MapPin, Lock, ArrowLeft, Loader2, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ClientSettings() {
    const { showToast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [profile, setProfile] = useState({
        full_name: "",
        location: ""
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: "",
        confirmPassword: ""
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
                .select('full_name, location')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error("Error fetching profile:", error);
                showToast("Failed to load profile", "error");
            } else if (data) {
                setProfile({
                    full_name: data.full_name || "",
                    location: data.location || ""
                });
            }
            setIsLoading(false);
        };

        fetchProfile();
    }, [router, showToast]);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const supabase = createClient();

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    location: profile.location,
                    updated_at: new Date().toISOString()
                })
                .eq('id', session.user.id);

            if (error) throw error;
            showToast("Profile details updated successfully!", "success");
        } catch (error: any) {
            console.error("Save error:", error);
            showToast(error.message || "Failed to save profile", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showToast("Password must be at least 6 characters long", "error");
            return;
        }

        setIsChangingPassword(true);
        const supabase = createClient();

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) throw error;

            showToast("Password updated successfully!", "success");
            setPasswordData({ newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            showToast(error.message || "Error updating password", "error");
        } finally {
            setIsChangingPassword(false);
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
        <main className="space-y-12 animate-in fade-in duration-700 max-w-5xl mx-auto p-4 md:p-8 lg:p-12 pt-20 md:pt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-om-border/20 pb-16">
                <div className="flex items-center gap-10">
                    <Link href="/dashboard/client">
                        <button className="h-16 w-16 rounded-none p-0 flex items-center justify-center border border-om-border/30 text-charcoal hover:bg-charcoal hover:text-cream transition-all duration-700 bg-surface">
                            <ArrowLeft size={20} />
                        </button>
                    </Link>
                    <div className="space-y-3">
                        <h1 className="text-5xl md:text-7xl font-serif italic text-charcoal leading-none">Security & Profile</h1>
                        <p className="text-[10px] md:text-[11px] font-sans uppercase tracking-[0.4em] text-[#6B5E4E] opacity-60">Authentication protocols and estate credentials.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Profile Information Set */}
                <Card className="p-8 md:p-14 space-y-10 bg-surface border border-om-border/30 rounded-none shadow-none" hover={false}>
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-cream flex items-center justify-center text-charcoal border border-om-border/40 mb-6">
                            <User size={28} />
                        </div>
                        <h2 className="text-3xl font-serif italic text-charcoal">Public Profile</h2>
                        <p className="text-[11px] text-[#6B5E4E] font-sans uppercase tracking-[0.2em] leading-relaxed opacity-60">Identity credentials curated for your consultation with heritage specialists.</p>
                    </div>

                    <form onSubmit={handleProfileSave} className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8B7355] ml-1">Legal Name</label>
                            <div className="relative">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-charcoal/30" size={16} />
                                <Input
                                    className="pl-14 h-16 rounded-none bg-transparent border-om-border/40 focus:border-charcoal focus:ring-0 text-charcoal font-serif text-[18px]"
                                    placeholder="Your Full Name"
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8B7355] ml-1">Current Residency</label>
                            <div className="relative">
                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-charcoal/30" size={16} />
                                <Input
                                    className="pl-14 h-16 rounded-none bg-transparent border-om-border/40 focus:border-charcoal focus:ring-0 text-charcoal font-serif text-[18px]"
                                    placeholder="Lagos, Nigeria"
                                    value={profile.location}
                                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={isSaving} className="w-full h-16 rounded-none font-bold uppercase tracking-[0.3em] text-[10px] bg-charcoal text-cream hover:bg-black transition-all border border-charcoal shadow-none mt-6">
                            {isSaving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Authorize and Commit Changes"}
                        </Button>
                    </form>
                </Card>

                {/* Security Settings Set */}
                <Card className="p-8 md:p-14 space-y-10 bg-surface border border-om-border/30 rounded-none shadow-none" hover={false}>
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-cream flex items-center justify-center text-charcoal border border-om-border/40 mb-6">
                            <Lock size={28} />
                        </div>
                        <h2 className="text-3xl font-serif italic text-charcoal">Access Credentials</h2>
                        <p className="text-[11px] text-[#6B5E4E] font-sans uppercase tracking-[0.2em] leading-relaxed opacity-60">Rotate security parameters to enhance your private estate account safety.</p>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8B7355] ml-1">New Passcode</label>
                            <Input
                                type="password"
                                className="h-16 rounded-none bg-transparent border-om-border/40 focus:border-charcoal focus:ring-0 text-charcoal font-serif text-[18px]"
                                placeholder="••••••••"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8B7355] ml-1">Confirm Passcode</label>
                            <Input
                                type="password"
                                className="h-16 rounded-none bg-transparent border-om-border/40 focus:border-charcoal focus:ring-0 text-charcoal font-serif text-[18px]"
                                placeholder="••••••••"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />
                        </div>

                        <Button type="submit" disabled={isChangingPassword || !passwordData.newPassword} variant="outline" className="w-full h-16 rounded-none font-bold uppercase tracking-[0.3em] text-[10px] border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-all duration-500 mt-6">
                            {isChangingPassword ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Rotate Access Credentials"}
                        </Button>
                    </form>
                </Card>
            </div>
        </main>
    );
}
