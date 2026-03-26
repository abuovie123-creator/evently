"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
    LayoutDashboard,
    Palette,
    Users,
    Settings,
    Search,
    MoreVertical,
    Shield,
    ShieldAlert,
    Trash2,
    Upload,
    Check,
    CreditCard,
    Plus,
    X,
    Edit3,
    Save,
    Building2,
    Wallet,
    TrendingUp,
    DollarSign
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
    id: string;
    full_name: string;
    role: string;
    email?: string;
    created_at: string;
    status?: string;
}

interface SubscriptionPlan {
    id: string;
    name: string;
    price: string;
    period: string;
    features: string[];
    imageLimit: number;
    isEditing: boolean;
}

interface StatItem {
    label: string;
    value: string;
    change: string;
}

interface TabItem {
    id: string;
    label: string;
    icon: any;
}

interface PendingPlanner {
    id: string;
    name: string;
    cat: string;
    loc: string;
    status: string;
}

export default function AdminDashboard() {
    const { showToast } = useToast();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"overview" | "branding" | "users" | "settings" | "payments">("overview");
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");

    // Payment Gateway State
    const [selectedGateway, setSelectedGateway] = useState<"paystack" | "flutterwave" | "manual">("paystack");
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [gatewayKeys, setGatewayKeys] = useState({
        paystack: { publicKey: "", secretKey: "", webhookSecret: "" },
        flutterwave: { publicKey: "", secretKey: "", webhookSecret: "" },
        manual: { bankName: "", accountNumber: "", accountName: "", additionalInfo: "" },
    });

    // Subscription Plans State
    const [plans, setPlans] = useState<SubscriptionPlan[]>([
        {
            id: "starter",
            name: "Starter",
            price: "0",
            period: "month",
            features: ["Basic public profile", "5 portfolio images", "Standard directory listing", "Booking request notifications", "Community support"],
            imageLimit: 5,
            isEditing: false,
        },
        {
            id: "pro",
            name: "Pro",
            price: "5000",
            period: "month",
            features: ["Verified badge", "25 portfolio images", "Featured directory listing", "Advanced analytics dashboard", "Priority in search results", "Client review showcase", "Direct messaging"],
            imageLimit: 25,
            isEditing: false,
        },
        {
            id: "elite",
            name: "Elite",
            price: "15000",
            period: "month",
            features: ["Everything in Pro", "Unlimited portfolio images", "Top placement guaranteed", "Custom profile branding", "Priority support (24/7)", "Event album sharing", "Social media integration", "Dedicated account manager"],
            imageLimit: -1,
            isEditing: false,
        },
    ]);
    const [newFeatureInputs, setNewFeatureInputs] = useState<Record<string, string>>({});

    const [features, setFeatures] = useState({
        bookingRequests: true,
        chatSystem: false,
        plannerReviews: true,
        subscriptionMonetization: false,
        featuredListings: true,
        vendorMarketplace: false,
    });

    const [branding, setBranding] = useState({
        primaryColor: "#3b82f6",
        secondaryColor: "#10b981",
        logoUrl: ""
    });

    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [stats, setStats] = useState({
        activePlanners: 0,
        totalBookings: 0,
        platformRevenue: "₦0",
        growth: "+0%"
    });

    const [isSaving, setIsSaving] = useState(false);
    const [systemStatus, setSystemStatus] = useState<"checking" | "online" | "offline">("checking");
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [pendingPlanners, setPendingPlanners] = useState<any[]>([]);
    const [bankTransfers, setBankTransfers] = useState<any[]>([]);

    const logError = useCallback((context: string, error: any) => {
        console.error(`${context}:`, error);
        if (error?.message) {
            showToast(`${context}: ${error.message}`, "error");
        }
    }, [showToast]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const supabase = createClient();

            // 1. Check Authentication & Permissions
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                showToast("Please login as administrator", "error");
                router.push("/dashboard/admin/login");
                return;
            }

            // 2. Double check admin role in profiles
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (profileError || profile?.role !== 'admin') {
                showToast("Access Denied: Admin privileges required", "error");
                router.push("/dashboard/admin/login");
                return;
            }

            // 3. Check System Status
            const { error: statusError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
            if (statusError) {
                logError("System status check failed", statusError);
                setSystemStatus("offline");
            } else {
                setSystemStatus("online");
            }

            // Fetch Profiles
            const { data: profiles, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) {
                logError("Error fetching profiles", fetchError);
                showToast(`Failed to fetch live users: ${fetchError.message || fetchError.name || "Unknown Error"}`, "error");
            } else if (profiles) {
                setUsers(profiles.map((p: any) => ({
                    ...p,
                    email: p.email || "N/A",
                    date: new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                    status: "Active"
                })));

                setStats((prev: any) => ({
                    ...prev,
                    activePlanners: profiles.filter((p: any) => p.role === 'planner').length
                }));
            }

            // Fetch Platform Settings
            const { data: psData, error: psError } = await supabase
                .from('platform_settings')
                .select('*')
                .eq('id', 'default')
                .single();

            if (psError && psError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                logError("Error fetching platform settings", psError);
            }

            if (psData) {
                if (psData.branding) setBranding(psData.branding);
                if (psData.features) setFeatures(psData.features);
                if (psData.gateway_keys) setGatewayKeys(psData.gateway_keys);
                if (psData.admin_username) setAdminUserUpdate(psData.admin_username);
                if (psData.subscription_plans) setPlans(psData.subscription_plans.map((p: any) => ({
                    ...p,
                    isEditing: false,
                    imageLimit: p.imageLimit !== undefined ? p.imageLimit : (p.id === 'pro' ? 25 : p.id === 'starter' ? 5 : -1)
                })));
            }

            // Fetch Real Analytics (Revenue)
            const { data: txData, error: txError } = await supabase
                .from('transactions')
                .select('*, profiles(full_name)')
                .order('created_at', { ascending: false });

            if (txError) {
                logError("Error fetching transactions", txError);
            }

            if (txData) {
                const total = txData.filter((tx: any) => tx.status === 'completed').reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
                setStats((prev: any) => ({
                    ...prev,
                    platformRevenue: `₦${total.toLocaleString()}`
                }));

                setRecentTransactions(txData.slice(0, 5).map((tx: any) => ({
                    name: tx.profiles?.full_name || "Unknown",
                    plan: tx.plan_name,
                    amount: `₦${Number(tx.amount).toLocaleString()}`,
                    status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1),
                    method: tx.method,
                    date: new Date(tx.created_at).toLocaleDateString()
                })));
            }

            // Fetch Pending Planners
            const { data: pendingData, error: pendingError } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'planner')
                .eq('verification_status', 'pending');

            if (pendingError) {
                logError("Error fetching pending planners", pendingError);
            }

            if (pendingData) {
                setPendingPlanners(pendingData.map((p: any) => ({
                    id: p.id,
                    name: p.full_name,
                    cat: "Event Planner", // Default or fetch category
                    loc: "Nigeria", // Default or fetch location
                    status: "Pending"
                })));
            }

            // Fetch Bank Transfers
            const { data: btData, error: btError } = await supabase
                .from('bank_transfers')
                .select('*, profiles(full_name, email)')
                .order('created_at', { ascending: false });

            if (btError) {
                logError("Error fetching bank transfers", btError);
            }

            if (btData) {
                setBankTransfers(btData);
            }

            setIsLoadingUsers(false);
        };

        fetchDashboardData();

        // Handle URL hash for tab switching
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (['overview', 'branding', 'users', 'payments', 'settings'].includes(hash)) {
                setActiveTab(hash as any);
                // Also scroll to top if it's a tab switch
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [router, showToast, logError]);

    const saveSettings = async (type: 'branding' | 'features' | 'gateways' | 'plans') => {
        setIsSaving(true);
        const supabase = createClient();

        const payload: any = {};
        if (type === 'branding') payload.branding = branding;
        if (type === 'features') payload.features = features;
        if (type === 'gateways') payload.gateway_keys = gatewayKeys;
        if (type === 'plans') payload.subscription_plans = plans.map((p: SubscriptionPlan) => ({ ...p, isEditing: false }));

        const { error } = await supabase
            .from('platform_settings')
            .upsert({ id: 'default', ...payload });

        if (error) {
            showToast(`Failed to save ${type}`, "error");
            logError(`Failed to save ${type}`, error);
        } else {
            showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} changes persisted!`, "success");
        }
        setIsSaving(false);
    };

    const handleFeatureToggle = async (key: keyof typeof features) => {
        const newState = !features[key];
        const updatedFeatures = { ...features, [key]: newState };
        setFeatures(updatedFeatures);

        const supabase = createClient();
        const { error } = await supabase
            .from('platform_settings')
            .upsert({ id: 'default', features: updatedFeatures });

        if (error) {
            showToast(`Failed to update feature`, "error");
        } else {
            showToast(`${String(key).replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())} ${newState ? 'Enabled' : 'Disabled'}`, newState ? "success" : "info");
        }
    };

    const toggleFeature = (key: keyof typeof features) => {
        handleFeatureToggle(key);
    };

    // Plan editing helpers
    const togglePlanEdit = (planId: string) => {
        setPlans((prev: SubscriptionPlan[]) => prev.map((p: SubscriptionPlan) => p.id === planId ? { ...p, isEditing: !p.isEditing } : p));
    };

    const updatePlanField = (planId: string, field: "name" | "price" | "period" | "imageLimit", value: string | number) => {
        setPlans((prev: SubscriptionPlan[]) => prev.map((p: SubscriptionPlan) => p.id === planId ? { ...p, [field]: value } : p));
    };

    const addFeature = (planId: string) => {
        const featureText = newFeatureInputs[planId]?.trim();
        if (!featureText) return;
        setPlans((prev: SubscriptionPlan[]) => prev.map((p: SubscriptionPlan) => p.id === planId ? { ...p, features: [...p.features, featureText] } : p));
        setNewFeatureInputs((prev: Record<string, string>) => ({ ...prev, [planId]: "" }));
        showToast("Feature added", "success");
    };

    const removeFeature = (planId: string, featureIndex: number) => {
        setPlans((prev: SubscriptionPlan[]) => prev.map((p: SubscriptionPlan) => p.id === planId ? { ...p, features: p.features.filter((_, i: number) => i !== featureIndex) } : p));
    };

    const savePlan = async (planId: string) => {
        await saveSettings('plans');
        togglePlanEdit(planId);
    };

    const exportUsersCSV = () => {
        const headers = ["ID", "Name", "Role", "Email", "Join Date"];
        const rows = users.map((u: UserProfile) => [u.id, u.full_name, u.role, u.email, u.created_at]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e: any[]) => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "evently_users.csv");
        document.body.appendChild(link);
        link.click();
        showToast("User list exported to CSV", "success");
    };

    const approvePlanner = async (plannerId: string) => {
        const supabase = createClient();
        const { error } = await supabase
            .from('profiles')
            .update({ verification_status: 'verified' })
            .eq('id', plannerId);

        if (error) {
            logError("Failed to approve planner", error);
            showToast("Failed to approve planner", "error");
        } else {
            setPendingPlanners((prev: PendingPlanner[]) => prev.filter((p: PendingPlanner) => p.id !== plannerId));
            showToast("Planner approved successfully", "success");
        }
    };

    const inviteUser = async () => {
        const email = prompt("Enter user email to invite:");
        if (email) {
            showToast(`Invitation sent to ${email}`, "success");
        }
    };

    const approveTransfer = async (transferId: string, profileId: string, tier: string) => {
        setIsSaving(true);
        const supabase = createClient();

        try {
            // 1. Update transfer status
            const { error: btError } = await supabase
                .from('bank_transfers')
                .update({ status: 'approved', updated_at: new Date().toISOString() })
                .eq('id', transferId);

            if (btError) throw btError;

            // 2. Update user profile plan
            const { error: pError } = await supabase
                .from('profiles')
                .update({
                    plan_id: tier,
                    subscription_status: 'active',
                    subscription_end_date: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString() // 31 days
                })
                .eq('id', profileId);
            if (pError) throw pError;

            setBankTransfers((prev: any[]) => prev.map((bt: any) => bt.id === transferId ? { ...bt, status: 'approved' } : bt));
            showToast("Payment approved and user upgraded!", "success");
        } catch (error: any) {
            logError("Approval failed", error);
            showToast(error.message || "Approval failed", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const declineTransfer = async (transferId: string) => {
        const reason = prompt("Reason for declining:");
        if (reason === null) return;

        setIsSaving(true);
        const supabase = createClient();

        const { error } = await supabase
            .from('bank_transfers')
            .update({ status: 'declined', notes: reason, updated_at: new Date().toISOString() })
            .eq('id', transferId);

        if (error) {
            logError("Failed to decline transfer", error);
            showToast("Failed to decline transfer", "error");
        } else {
            setBankTransfers((prev: any[]) => prev.map((bt: any) => bt.id === transferId ? { ...bt, status: 'declined' } : bt));
            showToast("Transfer declined", "error");
        }
        setIsSaving(false);
    };

    const deleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        const supabase = createClient();
        const { error } = await supabase.from('profiles').delete().eq('id', userId);

        if (error) {
            logError("Failed to delete user", error);
            showToast("Failed to delete user", "error");
        } else {
            setUsers((prev: UserProfile[]) => prev.filter((u: UserProfile) => u.id !== userId));
            showToast("User deleted successfully", "success");
        }
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "branding", label: "Branding", icon: Palette },
        { id: "users", label: "User Management", icon: Users },
        { id: "payments", label: "Payments", icon: CreditCard },
        { id: "settings", label: "Platform Settings", icon: Settings },
    ];

    return (
        <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">Admin Control Center</h1>
                    <p className="text-gray-400">Manage your platform's heart and soul from one central hub.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <Button
                        variant="outline"
                        className="flex-1 md:flex-initial"
                        onClick={() => setActiveTab("payments")}
                    >
                        Analytics
                    </Button>
                    <Button
                        className={`flex-1 md:flex-initial ${systemStatus === 'online' ? 'bg-green-500 hover:bg-green-600' : systemStatus === 'offline' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                        onClick={() => {
                            showToast(systemStatus === 'online' ? "Database connection is healthy" : "Database connection lost", systemStatus === 'online' ? "success" : "error");
                        }}
                    >
                        {systemStatus === 'online' ? "System Online" : systemStatus === 'offline' ? "System Offline" : "Checking Status..."}
                    </Button>
                </div>
            </div>

            {/* Sidebar/Tabs Navigation */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 w-full overflow-x-auto scrollbar-hide">
                {tabs.map((tab: TabItem) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                                ? "bg-white text-black shadow-lg shadow-white/10"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Overview Tab Content */}
            {activeTab === "overview" && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Stats Grid */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: "Active Planners", value: stats.activePlanners.toString(), change: stats.growth },
                                { label: "Total Bookings", value: stats.totalBookings.toString(), change: "+0%" },
                                { label: "Platform Revenue", value: stats.platformRevenue, change: "+0%" },
                            ].map((stat: StatItem, i: number) => (
                                <Card key={i} className="space-y-4 group relative overflow-hidden" hover={true}>
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
                                    <div className="flex items-end justify-between">
                                        <span className="text-4xl font-extrabold group-hover:text-blue-400 transition-colors">{stat.value}</span>
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${stat.change.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                            <TrendingUp size={10} />
                                            {stat.change}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Feature Control Panel */}
                        <Card className="lg:col-span-1 space-y-6" hover={false}>
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldAlert className="text-blue-400" size={20} />
                                <h3 className="text-lg font-bold">Quick Feature Toggle</h3>
                            </div>
                            <div className="space-y-3">
                                {Object.entries(features).map(([key, enabled]) => (
                                    <div key={key} className="flex items-center justify-between p-3 glass-panel rounded-xl border-white/5">
                                        <span className="text-xs font-medium text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                        <button
                                            onClick={() => toggleFeature(key as keyof typeof features)}
                                            className={`w-10 h-5 rounded-full transition-all relative ${enabled ? 'bg-blue-500' : 'bg-white/10'}`}
                                        >
                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'right-0.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Recent Activity Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <h2 className="text-2xl font-bold">Recent Planner Approvals</h2>
                            <Button variant="outline" size="sm">View All</Button>
                        </div>
                        <Card className="p-0 overflow-hidden" hover={false}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm min-w-[600px]">
                                    <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                                        <tr>
                                            <th className="p-5">Planner</th>
                                            <th className="p-5">Category</th>
                                            <th className="p-5">Location</th>
                                            <th className="p-5">Status</th>
                                            <th className="p-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {pendingPlanners.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-10 text-center text-gray-500">
                                                    No pending planner approvals.
                                                </td>
                                            </tr>
                                        ) : pendingPlanners.map((planner: PendingPlanner, i: number) => (
                                            <tr key={planner.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="p-5 font-bold">{planner.name}</td>
                                                <td className="p-5 text-gray-400">{planner.cat}</td>
                                                <td className="p-5 text-gray-400">{planner.loc}</td>
                                                <td className="p-5">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${planner.status === 'Verified' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                                        {planner.status}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-right space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-[10px] h-8 px-3"
                                                        onClick={() => showToast(`Reviewing ${planner.name}`, "info")}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="text-[10px] h-8 px-3 bg-green-500 hover:bg-green-600"
                                                        onClick={() => approvePlanner(planner.id)}
                                                    >
                                                        Approve
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Branding Tab Content */}
            {activeTab === "branding" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="space-y-8" hover={false}>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Brand Identity</h3>
                            <p className="text-gray-400 text-sm">Upload your logo and configure the visual tone of your platform.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-sm font-bold uppercase tracking-widest text-gray-500 font-mono">Platform Logo</label>
                                <div className="aspect-video glass-panel rounded-2xl flex flex-col items-center justify-center p-8 border-dashed border-white/20 hover:border-white/40 cursor-pointer transition-all group">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload size={24} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm font-bold text-white">Upload New Logo</p>
                                    <p className="text-xs text-gray-500 mt-1">Recommended size: 512x512 PNG</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-sm font-bold uppercase tracking-widest text-gray-500 font-mono">Primary Color</label>
                                    <div className="flex items-center gap-4 p-3 glass-panel rounded-xl border-white/5">
                                        <input
                                            type="color"
                                            value={branding.primaryColor}
                                            onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                            className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-none"
                                        />
                                        <span className="text-sm font-mono text-gray-300 uppercase">{branding.primaryColor}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-sm font-bold uppercase tracking-widest text-gray-500 font-mono">Secondary Color</label>
                                    <div className="flex items-center gap-4 p-3 glass-panel rounded-xl border-white/5">
                                        <input
                                            type="color"
                                            value={branding.secondaryColor}
                                            onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                                            className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-none"
                                        />
                                        <span className="text-sm font-mono text-gray-300 uppercase">{branding.secondaryColor}</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full py-6"
                                onClick={() => saveSettings('branding')}
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : "Save Branding Changes"}
                            </Button>
                        </div>
                    </Card>

                    <div className="space-y-8">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Preview</h3>
                            <p className="text-gray-400 text-sm">How your changes will look across the platform.</p>
                        </div>
                        <div className="hidden lg:block space-y-8 p-12 glass-panel rounded-[3rem] border-white/5 bg-black/40 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[120px] rounded-full" />
                            <div className="space-y-6 relative">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white" />
                                    <span className="text-xl font-bold">Evently</span>
                                </div>
                                <h1 className="text-4xl font-bold leading-tight">Your Dream Event, <br /><span style={{ color: branding.primaryColor }}>Simplified.</span></h1>
                                <div className="flex gap-3">
                                    <div className="px-6 py-2 rounded-full text-xs font-bold" style={{ backgroundColor: branding.primaryColor, color: 'white' }}>Get Started</div>
                                    <div className="px-6 py-2 rounded-full text-xs font-bold border border-white/10">Browse Planners</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab Content */}
            {activeTab === "users" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="flex flex-col md:flex-row justify-between items-center gap-6" hover={false}>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <Input
                                className="pl-12"
                                placeholder="Search users by name, email or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap gap-4 w-full md:w-auto">
                            <select
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admins</option>
                                <option value="planner">Planners</option>
                                <option value="client">Clients</option>
                            </select>
                            <Button variant="outline" onClick={exportUsersCSV}>Export CSV</Button>
                            <Button onClick={inviteUser}>Invite User</Button>
                        </div>
                    </Card>

                    <Card className="p-0 overflow-hidden w-full" hover={false}>
                        <div className="overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left text-sm min-w-[800px]">
                                <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                                    <tr>
                                        <th className="p-5">User</th>
                                        <th className="p-5">Role</th>
                                        <th className="p-5">Join Date</th>
                                        <th className="p-5">Status</th>
                                        <th className="p-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoadingUsers ? (
                                        <tr>
                                            <td colSpan={5} className="p-10 text-center text-gray-500 animate-pulse">
                                                Loading real user data...
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-10 text-center text-gray-500">
                                                No users found in the database.
                                            </td>
                                        </tr>
                                    ) : users
                                        .filter(user => {
                                            const matchesSearch = (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                user.email?.toLowerCase().includes(searchQuery.toLowerCase()));
                                            const matchesRole = roleFilter === "all" || user.role === roleFilter;
                                            return matchesSearch && matchesRole;
                                        })
                                        .map((user, i) => (
                                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-gray-400 group-hover:text-blue-400 transition-colors">
                                                            {(user.full_name || "U").charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold">{user.full_name || "New User"}</p>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${user.role === 'planner' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/10 text-gray-400'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-gray-400">{(user as any).date}</td>
                                                <td className="p-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        <span className="text-xs">{user.status}</span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-right space-x-2">
                                                    <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all"><MoreVertical size={16} /></button>
                                                    <button className="p-2 hover:bg-yellow-500/10 rounded-lg text-gray-500 hover:text-yellow-500 transition-all"><ShieldAlert size={16} /></button>
                                                    <button className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* Payments Tab Content */}
            {activeTab === "payments" && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Transaction Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: "Total Revenue", value: "₦2.4M", change: "+18%", icon: DollarSign, color: "text-green-400" },
                            { label: "Active Subscriptions", value: "186", change: "+24", icon: Wallet, color: "text-blue-400" },
                            { label: "Pending Payouts", value: "₦340k", change: "3 pending", icon: Building2, color: "text-amber-400" },
                            { label: "Growth Rate", value: "12.4%", change: "+2.1%", icon: TrendingUp, color: "text-cyan-400" },
                        ].map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <Card key={i} className="space-y-3 group">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
                                        <Icon size={18} className={`${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <span className={`text-2xl font-bold group-hover:${stat.color} transition-colors`}>{stat.value}</span>
                                        <span className="text-xs font-bold text-green-400">{stat.change}</span>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Payment Gateway Configuration */}
                        <Card className="space-y-8" hover={false}>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Payment Gateway</h3>
                                <p className="text-sm text-gray-400">Configure your preferred payment processor and API credentials.</p>
                            </div>

                            {/* Gateway Selector */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Select Gateway</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {([
                                        { id: "paystack" as const, name: "Paystack", color: "from-blue-500 to-blue-600" },
                                        { id: "flutterwave" as const, name: "Flutterwave", color: "from-orange-500 to-amber-500" },
                                        { id: "manual" as const, name: "Bank Transfer", color: "from-green-500 to-emerald-500" },
                                    ]).map((gw) => (
                                        <button
                                            key={gw.id}
                                            onClick={() => setSelectedGateway(gw.id)}
                                            className={`p-4 rounded-2xl border-2 transition-all text-center space-y-2 ${selectedGateway === gw.id
                                                ? "border-white/30 bg-white/5 shadow-lg"
                                                : "border-white/5 hover:border-white/15 hover:bg-white/[0.02]"
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gw.color} flex items-center justify-center mx-auto shadow-lg`}>
                                                {gw.id === "manual" ? <Building2 size={18} className="text-white" /> : <CreditCard size={18} className="text-white" />}
                                            </div>
                                            <span className="text-xs font-bold block">{gw.name}</span>
                                            {selectedGateway === gw.id && (
                                                <div className="w-2 h-2 bg-green-400 rounded-full mx-auto animate-pulse" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Live/Test Mode Toggle */}
                            {selectedGateway !== "manual" && (
                                <div className="flex items-center justify-between p-4 glass-panel rounded-xl border-white/5">
                                    <div>
                                        <p className="text-sm font-bold">{isLiveMode ? "Live Mode" : "Test Mode"}</p>
                                        <p className="text-[10px] text-gray-500">{isLiveMode ? "Processing real payments" : "Using sandbox environment"}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsLiveMode(!isLiveMode);
                                            showToast(`Switched to ${!isLiveMode ? "Live" : "Test"} mode`, !isLiveMode ? "success" : "info");
                                        }}
                                        className={`w-12 h-6 rounded-full transition-all relative ${isLiveMode ? "bg-green-500" : "bg-white/10"}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isLiveMode ? "right-1" : "left-1"}`} />
                                    </button>
                                </div>
                            )}

                            {/* API Key Fields for Paystack/Flutterwave */}
                            {selectedGateway !== "manual" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            {isLiveMode ? "Live" : "Test"} Public Key
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder={`pk_${isLiveMode ? "live" : "test"}_xxxxxxxxxxxx`}
                                            value={gatewayKeys[selectedGateway].publicKey}
                                            onChange={(e) => setGatewayKeys(prev => ({
                                                ...prev,
                                                [selectedGateway]: { ...prev[selectedGateway], publicKey: e.target.value }
                                            }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            {isLiveMode ? "Live" : "Test"} Secret Key
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder={`sk_${isLiveMode ? "live" : "test"}_xxxxxxxxxxxx`}
                                            value={gatewayKeys[selectedGateway].secretKey}
                                            onChange={(e) => setGatewayKeys(prev => ({
                                                ...prev,
                                                [selectedGateway]: { ...prev[selectedGateway], secretKey: e.target.value }
                                            }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Webhook Secret</label>
                                        <Input
                                            type="password"
                                            placeholder="whsec_xxxxxxxxxxxx"
                                            value={gatewayKeys[selectedGateway].webhookSecret}
                                            onChange={(e) => setGatewayKeys(prev => ({
                                                ...prev,
                                                [selectedGateway]: { ...prev[selectedGateway], webhookSecret: e.target.value }
                                            }))}
                                        />
                                    </div>
                                    <Button className="w-full" onClick={() => saveSettings('gateways')} disabled={isSaving}>
                                        {isSaving ? "Saving..." : `Save ${selectedGateway.charAt(0).toUpperCase() + selectedGateway.slice(1)} Keys`}
                                    </Button>
                                </div>
                            )}

                            {/* Manual Bank Details Fields */}
                            {selectedGateway === "manual" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Bank Name</label>
                                            <Input
                                                placeholder="e.g. Zenith Bank"
                                                value={gatewayKeys.manual.bankName}
                                                onChange={(e) => setGatewayKeys(prev => ({
                                                    ...prev,
                                                    manual: { ...prev.manual, bankName: e.target.value }
                                                }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Account Number</label>
                                            <Input
                                                placeholder="0123456789"
                                                value={gatewayKeys.manual.accountNumber}
                                                onChange={(e) => setGatewayKeys(prev => ({
                                                    ...prev,
                                                    manual: { ...prev.manual, accountNumber: e.target.value }
                                                }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Account Name</label>
                                        <Input
                                            placeholder="EVENTLY AD PJ"
                                            value={gatewayKeys.manual.accountName}
                                            onChange={(e) => setGatewayKeys(prev => ({
                                                ...prev,
                                                manual: { ...prev.manual, accountName: e.target.value }
                                            }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Instructions for Users</label>
                                        <Input
                                            placeholder="e.g. Please include your username in the transfer narration..."
                                            value={gatewayKeys.manual.additionalInfo}
                                            onChange={(e: any) => setGatewayKeys((prev: any) => ({
                                                ...prev,
                                                manual: { ...prev.manual, additionalInfo: e.target.value }
                                            }))}
                                        />
                                    </div>
                                    <Button className="w-full" onClick={() => saveSettings('gateways')} disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Save Bank Details"}
                                    </Button>
                                </div>
                            )}
                        </Card>

                        {/* Recent Transactions & Approvals */}
                        <div className="space-y-8">
                            {/* Recent Transactions */}
                            <Card className="space-y-6" hover={false}>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold">Recent Transactions</h3>
                                        <p className="text-sm text-gray-400">Latest subscription payments from planners.</p>
                                    </div>
                                    <Button variant="outline" size="sm">View All</Button>
                                </div>
                                <div className="space-y-3">
                                    {recentTransactions.length === 0 ? (
                                        <div className="p-10 text-center text-gray-500 text-xs">No recent transactions.</div>
                                    ) : recentTransactions.map((tx: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-4 glass-panel rounded-xl border-white/5 group hover:bg-white/[0.03] transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-sm text-gray-400 group-hover:text-blue-400 transition-colors">
                                                    {tx.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{tx.name}</p>
                                                    <p className="text-[10px] text-gray-500">{tx.plan} Plan • {tx.method}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm">{tx.amount}</p>
                                                <span className={`text-[10px] font-bold ${tx.status === "Completed" ? "text-green-400" :
                                                    tx.status === "Pending" ? "text-yellow-400" : "text-red-400"
                                                    }`}>{tx.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Bank Transfer Approval Queue */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Building2 className="text-blue-400" size={20} />
                                        Manual Bank Approvals
                                    </h2>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        {bankTransfers.filter((bt: any) => bt.status === 'pending').length} Pending
                                    </span>
                                </div>

                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {bankTransfers.length === 0 ? (
                                        <Card className="p-8 text-center text-gray-500 italic">
                                            No bank transfer requests yet.
                                        </Card>
                                    ) : bankTransfers.map((bt: any) => (
                                        <Card key={bt.id} className="p-4 space-y-4 border-white/5 hover:border-white/20 transition-all">
                                            {/* Transfer Item content... */}
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-400">
                                                        {(bt.profiles?.full_name || "U").charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{bt.profiles?.full_name || "Unknown"}</p>
                                                        <p className="text-[10px] text-gray-500 font-mono">{(bt.target_tier || 'N/A').toUpperCase()} PLAN - ₦{Number(bt.amount).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest 
                                                    ${bt.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                                                        bt.status === 'declined' ? 'bg-red-500/10 text-red-400' :
                                                            'bg-amber-500/10 text-amber-400'}`}>
                                                    {bt.status}
                                                </span>
                                            </div>

                                            {bt.screenshot_url && (
                                                <div className="relative aspect-video rounded-xl overflow-hidden glass-panel group">
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment-proofs/${bt.screenshot_url}`}
                                                        alt="Payment Proof"
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Button variant="glass" size="sm" onClick={() => window.open(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment-proofs/${bt.screenshot_url}`, '_blank')}>
                                                            View Full Proof
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {bt.status === 'pending' && (
                                                <div className="grid grid-cols-2 gap-3 pt-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                                        disabled={isSaving}
                                                        onClick={() => declineTransfer(bt.id)}
                                                    >
                                                        Decline
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        disabled={isSaving}
                                                        onClick={() => approveTransfer(bt.id, bt.profile_id, bt.target_tier)}
                                                    >
                                                        Approve
                                                    </Button>
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Editable Subscription Plans */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold">Subscription Plans</h3>
                                    <p className="text-sm text-gray-400">Configure pricing and features for each planner tier.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {plans.map((plan: SubscriptionPlan) => (
                                    <Card key={plan.id} className="space-y-5 relative" hover={false}>
                                        {/* Edit/Save Toggle */}
                                        <button
                                            onClick={() => plan.isEditing ? savePlan(plan.id) : togglePlanEdit(plan.id)}
                                            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-all text-gray-400 hover:text-white"
                                        >
                                            {plan.isEditing ? <Save size={16} /> : <Edit3 size={16} />}
                                        </button>

                                        {/* Plan Name */}
                                        {plan.isEditing ? (
                                            <Input
                                                value={plan.name}
                                                onChange={(e: any) => updatePlanField(plan.id, "name", e.target.value)}
                                                className="text-lg font-bold bg-white/5"
                                            />
                                        ) : (
                                            <h4 className="text-lg font-bold">{plan.name}</h4>
                                        )}

                                        {/* Price */}
                                        {plan.isEditing ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 font-bold">₦</span>
                                                <Input
                                                    type="number"
                                                    value={plan.price}
                                                    onChange={(e: any) => updatePlanField(plan.id, "price", e.target.value)}
                                                    className="flex-1 text-2xl font-bold"
                                                />
                                                <select
                                                    value={plan.period}
                                                    onChange={(e: any) => updatePlanField(plan.id, "period", e.target.value)}
                                                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none"
                                                >
                                                    <option value="month">/ month</option>
                                                    <option value="year">/ year</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-extrabold">
                                                    {plan.price === "0" ? "Free" : `₦${parseInt(plan.price).toLocaleString()}`}
                                                </span>
                                                {plan.price !== "0" && (
                                                    <span className="text-sm text-gray-500">/{plan.period}</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Image Limit */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Portfolio Image Limit</label>
                                            {plan.isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        value={plan.imageLimit === -1 ? "" : plan.imageLimit}
                                                        placeholder="Unlimited"
                                                        onChange={(e: any) => updatePlanField(plan.id, "imageLimit", e.target.value === "" ? -1 : parseInt(e.target.value))}
                                                        className="w-24 text-sm"
                                                    />
                                                    <span className="text-xs text-gray-400">images (-1 or empty for unlimited)</span>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-300 font-bold">
                                                    {plan.imageLimit === -1 ? "Unlimited Images" : `${plan.imageLimit} Images`}
                                                </div>
                                            )}
                                        </div>

                                        {/* Features List */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Features</label>
                                            <div className="space-y-2">
                                                {plan.features.map((feature: string, fi: number) => (
                                                    <div key={fi} className="flex items-center gap-2 group/feature">
                                                        <Check size={14} className="text-green-400 flex-shrink-0" />
                                                        <span className="text-sm text-gray-300 flex-1">{feature}</span>
                                                        {plan.isEditing && (
                                                            <button
                                                                onClick={() => removeFeature(plan.id, fi)}
                                                                className="opacity-0 group-hover/feature:opacity-100 p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add Feature Input */}
                                            {plan.isEditing && (
                                                <div className="flex items-center gap-2 mt-3">
                                                    <Input
                                                        placeholder="Add a feature..."
                                                        value={newFeatureInputs[plan.id] || ""}
                                                        onChange={(e: any) => setNewFeatureInputs((prev: Record<string, string>) => ({ ...prev, [plan.id]: e.target.value }))}
                                                        onKeyDown={(e: any) => { if (e.key === "Enter") { e.preventDefault(); addFeature(plan.id); } }}
                                                        className="flex-1 py-2 text-xs"
                                                    />
                                                    <button
                                                        onClick={() => addFeature(plan.id)}
                                                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Save Button */}
                                        {plan.isEditing && (
                                            <Button
                                                className="w-full"
                                                onClick={() => savePlan(plan.id)}
                                                size="sm"
                                            >
                                                Save Changes
                                            </Button>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Tab Content */}
            {
                activeTab === "settings" && (
                    <div className="max-w-3xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Admin Credentials</h3>
                                <div className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full uppercase tracking-widest border border-blue-500/20">
                                    Secure Access
                                </div>
                            </div>
                            <Card className="p-8 space-y-8" hover={false}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Admin Username</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors">
                                                <Users size={16} />
                                            </div>
                                            <Input
                                                placeholder="admin"
                                                className="pl-12 bg-white/5 border-white/10 focus:border-blue-500/50 transition-all h-12 rounded-xl"
                                                value={adminUserUpdate}
                                                onChange={(e) => setAdminUserUpdate(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-500 ml-1 italic">This is the username used at the admin login portal.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">New Password</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-400 transition-colors">
                                                <Shield size={16} />
                                            </div>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                className="pl-12 bg-white/5 border-white/10 focus:border-red-500/50 transition-all h-12 rounded-xl"
                                                value={adminPassUpdate}
                                                onChange={(e) => setAdminPassUpdate(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-500 ml-1 italic">Leave blank to keep current password.</p>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-white/5">
                                    <Button
                                        onClick={async () => {
                                            setIsSaving(true);
                                            const supabase = createClient();

                                            // 1. Update Username in platform_settings
                                            const { error: nameError } = await supabase
                                                .from('platform_settings')
                                                .upsert({ id: 'default', admin_username: adminUserUpdate });

                                            if (nameError) {
                                                showToast("Failed to update admin username", "error");
                                                setIsSaving(false);
                                                return;
                                            }

                                            // 2. Update Password via Supabase Auth if provided
                                            if (adminPassUpdate) {
                                                const { error: passError } = await supabase.auth.updateUser({
                                                    password: adminPassUpdate
                                                });
                                                if (passError) {
                                                    showToast(`Password update failed: ${passError.message}`, "error");
                                                    setIsSaving(false);
                                                    return;
                                                }
                                                setAdminPassUpdate(""); // Clear password field
                                            }

                                            showToast("Admin credentials updated successfully", "success");
                                            setIsSaving(false);
                                        }}
                                        disabled={isSaving}
                                        className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
                                    >
                                        {isSaving ? "Updating..." : "Update Credentials"}
                                    </Button>
                                </div>
                            </Card>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-xl font-bold">Security & Access</h3>
                            <Card className="divide-y divide-white/5 p-0" hover={false}>
                                {[
                                    { title: "Two-Factor Authentication", desc: "Require a secondary code for all admin logins.", enabled: true },
                                    { title: "Admin Login Notifications", desc: "Receive email alerts when someone logs into this panel.", enabled: true },
                                    { title: "IP Whitelisting", desc: "Restrict admin access to specific IP addresses.", enabled: false },
                                ].map((setting: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-6">
                                        <div>
                                            <p className="font-bold">{setting.title}</p>
                                            <p className="text-xs text-gray-500">{setting.desc}</p>
                                        </div>
                                        <button
                                            className={`w-10 h-5 rounded-full transition-all relative ${setting.enabled ? 'bg-blue-500' : 'bg-white/10'}`}
                                        >
                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${setting.enabled ? 'right-0.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                ))}
                            </Card>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-red-500">Danger Zone</h3>
                            <Card className="border-red-500/20 bg-red-500/[0.02] p-8 flex flex-col md:flex-row justify-between items-center gap-6" hover={false}>
                                <div>
                                    <p className="font-bold">Reset Platform Data</p>
                                    <p className="text-xs text-gray-500">Wipe all users, planners, and event albums. This action is irreversible.</p>
                                </div>
                                <Button className="bg-red-500 hover:bg-red-600 text-white border-none w-full md:w-auto">Confirm Reset</Button>
                            </Card>
                        </section>
                    </div>
                )
            }
        </div>
    );
}
