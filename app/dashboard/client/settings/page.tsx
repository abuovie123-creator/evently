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
        <main className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto p-4 md:p-6 lg:p-8 pt-8">
            <div className="flex items-center gap-4 border-b border-foreground/10 pb-6">
                <Link href="/dashboard/client">
                    <Button variant="glass" className="h-12 w-12 rounded-2xl p-0 flex items-center justify-center border-foreground/10">
                        <ArrowLeft size={20} className="text-muted-foreground" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Account Settings</h1>
                    <p className="text-muted-foreground text-sm">Manage your profile and security parameters</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Information Set */}
                <Card className="p-6 md:p-8 space-y-6 bg-background border-foreground/5 shadow-xl rounded-[2rem]" hover={false}>
                    <div className="space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                            <User size={24} />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Public Information</h2>
                        <p className="text-xs text-muted-foreground">This info will be visible to planners when you request a booking.</p>
                    </div>

                    <form onSubmit={handleProfileSave} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" size={16} />
                                <Input
                                    className="pl-10 h-12 rounded-xl bg-foreground/[0.02]"
                                    placeholder="Your Full Name"
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Location / City</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" size={16} />
                                <Input
                                    className="pl-10 h-12 rounded-xl bg-foreground/[0.02]"
                                    placeholder="Lagos, Nigeria"
                                    value={profile.location}
                                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={isSaving} className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/10 transition-all mt-4">
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save Profile Details"}
                        </Button>
                    </form>
                </Card>

                {/* Security Settings Set */}
                <Card className="p-6 md:p-8 space-y-6 bg-background border-foreground/5 shadow-xl rounded-[2rem]" hover={false}>
                    <div className="space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground/50 mb-4 border border-foreground/10">
                            <Lock size={24} />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Security Credentials</h2>
                        <p className="text-xs text-muted-foreground">Keep your account secure by updating your password periodically.</p>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">New Password</label>
                            <Input
                                type="password"
                                className="h-12 rounded-xl bg-foreground/[0.02]"
                                placeholder="••••••••"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Confirm New Password</label>
                            <Input
                                type="password"
                                className="h-12 rounded-xl bg-foreground/[0.02]"
                                placeholder="••••••••"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />
                        </div>

                        <Button type="submit" disabled={isChangingPassword || !passwordData.newPassword} variant="outline" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs border-foreground/10 shadow-lg mt-4">
                            {isChangingPassword ? <Loader2 size={16} className="animate-spin" /> : "Update Password"}
                        </Button>
                    </form>
                </Card>
            </div>
        </main>
    );
}
