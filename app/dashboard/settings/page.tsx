"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
    User,
    Bell,
    Shield,
    CreditCard,
    Mail,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    Save,
    Trash2,
    ExternalLink,
    History,
    FileText,
    LifeBuoy
} from "lucide-react";
import { SupportTicketForm } from "@/components/SupportTicketForm";

interface Invoice {
    id: string;
    date: string;
    amount: string;
    status: string;
}

interface NotificationItem {
    title: string;
    desc: string;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("account");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [email, setEmail] = useState("");

    const supabase = createClient();

    React.useEffect(() => {
        const fetchProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            setEmail(session.user.email || "");

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (!error && data) {
                setProfile(data);
                setFullName(data.full_name || "");
                setBio(data.bio || "");
            }
            setIsLoading(false);
        };
        fetchProfile();
    }, [supabase]);

    const handleSaveAccount = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                bio: bio
            })
            .eq('id', session.user.id);

        if (error) {
            showToast("Failed to update profile", "error");
        } else {
            showToast("Profile updated successfully", "success");
        }
    };

    const tabs = [
        { id: "account", label: "Account", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: Shield },
        { id: "billing", label: "Billing", icon: CreditCard },
        { id: "support", label: "Support", icon: LifeBuoy },
    ];

    const renderAccount = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="email"
                            disabled
                            value={email}
                            placeholder="user@example.com"
                            className="w-full bg-foreground/5 border border-foreground/5 rounded-2xl pl-12 pr-4 py-3 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Bio / Headline</label>
                    <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell the world about yourself..."
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                    />
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <Button onClick={handleSaveAccount} className="bg-blue-600 hover:bg-blue-700 gap-2 h-12 rounded-2xl px-8 font-bold">
                    <Save size={18} /> Save Changes
                </Button>
            </div>
        </div>
    );

    const renderNotifications = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
                {[
                    { title: "Booking Requests", desc: "Get notified when someone requests a booking." },
                    { title: "Platform Updates", desc: "News about features and system maintenance." },
                    { title: "Security Alerts", desc: "Important notices about your account security." },
                    { title: "Marketing Emails", desc: "Promotions and event planning tips." },
                ].map((item: NotificationItem, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 glass-panel rounded-2xl border-white/5">
                        <div>
                            <p className="font-bold">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={i < 3} />
                            <div className="w-11 h-6 bg-foreground/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-foreground after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSecurity = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center gap-4 text-yellow-500">
                    <Shield size={24} />
                    <p className="text-sm">We recommend enabling Two-Factor Authentication for better security.</p>
                </div>

                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl pl-12 pr-12 py-3 text-foreground focus:outline-none focus:border-blue-500/50 transition-colors"
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-foreground"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full md:w-auto">Update Password</Button>
                </div>
            </div>

            <div className="pt-8 border-t border-white/5">
                <h4 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                    <Trash2 size={18} /> Danger Zone
                </h4>
                <Card className="border-red-500/20 bg-red-500/5">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                        <div>
                            <p className="font-bold text-foreground">Delete Account</p>
                            <p className="text-xs text-gray-400">Permanently remove all your data from the platform.</p>
                        </div>
                        <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                            Delete Permanentely
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );

    const renderBilling = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-foreground/10 p-8 text-center md:text-left">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <span className="px-3 py-1 bg-blue-500 text-foreground text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 inline-block">
                            Current Plan: Professional
                        </span>
                        <h3 className="text-3xl font-extrabold mb-2 text-foreground">$49<span className="text-lg font-normal text-gray-400">/month</span></h3>
                        <p className="text-sm text-gray-400">Next billing date: April 24, 2026</p>
                    </div>
                    <Button className="bg-foreground text-background hover:bg-gray-200">Upgrade Plan</Button>
                </div>
            </Card>

            <div className="space-y-4">
                <h4 className="font-bold flex items-center gap-2">
                    <History size={18} /> Recent Invoices
                </h4>
                {[
                    { id: "INV-001", date: "Mar 24, 2026", amount: "$49.00", status: "Paid" },
                    { id: "INV-002", date: "Feb 24, 2026", amount: "$49.00", status: "Paid" },
                ].map((inv: Invoice, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 glass-panel rounded-2xl border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">{inv.id}</p>
                                <p className="text-xs text-gray-500">{inv.date}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-sm">{inv.amount}</p>
                            <button className="text-[10px] font-bold text-blue-400 hover:underline">Download PDF</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSupport = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <SupportTicketForm />
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-muted-foreground font-medium animate-pulse">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Settings</h1>
                <p className="text-gray-400">Control your account, security, and notification preferences.</p>
            </div>

            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 w-full overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 min-w-fit flex-shrink-0 ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <main className="pt-4">
                {activeTab === "account" && renderAccount()}
                {activeTab === "notifications" && renderNotifications()}
                {activeTab === "security" && renderSecurity()}
                {activeTab === "billing" && renderBilling()}
                {activeTab === "support" && renderSupport()}
            </main>
        </div>
    );
}
