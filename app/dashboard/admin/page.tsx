"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
    CreditCard,
    Building2,
    Users,
    Settings,
    LayoutDashboard,
    Search,
    LifeBuoy,
    ShieldAlert,
    TrendingUp,
    MoreVertical,
    FileText,
    Save,
    Edit3,
    Upload,
    CheckCircle2,
    ArrowRight,
    Palette,
    ExternalLink,
    AlertCircle,
    Copy,
    Check,
    LogOut,
    Trash2,
    X,
    Plus,
    Shield,
    Bell,
    Info
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

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
    nin?: string;
    id_url?: string;
    passport_url?: string;
}

function DebouncedSearchInput({ onSearchChange, placeholder }: { onSearchChange: (val: string) => void, placeholder: string }) {
    const [val, setVal] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => onSearchChange(val), 300);
        return () => clearTimeout(timer);
    }, [val, onSearchChange]);

    return (
        <Input
            className="pl-12"
            placeholder={placeholder}
            value={val}
            onChange={(e) => setVal(e.target.value)}
        />
    );
}

export default function AdminDashboard() {
    const { showToast } = useToast();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"overview" | "branding" | "users" | "settings" | "payments" | "platform" | "homepage">("overview");
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

    const [kycRequirements, setKycRequirements] = useState<any[]>([]);

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

    // Platform Management State
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", image_url: "", link_url: "" });
    const [externalLinks, setExternalLinks] = useState<any[]>([]);
    const [newLink, setNewLink] = useState({ label: "", url: "" });

    // Homepage Settings State (Old Money Redesign)
    const [homepageSettings, setHomepageSettings] = useState<Record<string, string>>({
        site_logo_text: "Evently",
        hero_headline_part1: "Curate Your",
        hero_headline_part2: "Legacy.",
        hero_bg_url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3",
        hero_search_loc_placeholder: "Where is your event?",
        hero_search_type_placeholder: "Event Type",
        grow_section_label: "Philosophy",
        grow_section_title: "The Digital Estate",
        grow_section_subtitle: "We transcend the standard directory; Evently is a curated sanctuary where excellence and talent intersect.",
        why_us_label: "The Standard",
        why_us_title: "Why the Best Choose Evently",
        why_us_subtitle: "We’ve re-imagined the architectural foundation of the event planning industry.",
        planners_label: "Planners",
        planners_title: "The Master Planners",
        portfolio_label: "Portfolio",
        portfolio_title: "Notable Heritage Moments",
        visionaries_title: "For the Visionaries",
        visionaries_subtitle: "Are you an architect of memories? Showcase your portfolio to the world's most discerning guests.",
        footer_tagline: "Curating excellence in the world's most prestigious event planning circles.",
        footer_newsletter_description: "Join our legacy network for exclusive insights.",
    });

    const [adminUserUpdate, setAdminUserUpdate] = useState("");
    const [adminPassUpdate, setAdminPassUpdate] = useState("");

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
                .neq('role', 'admin') // Filter out the master admin
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
                if (psData.kyc_requirements) setKycRequirements(psData.kyc_requirements);
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
                .select(`
                    *,
                    planners(nin, id_url, passport_url)
                `)
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
                    status: "Pending",
                    nin: p.planners?.[0]?.nin || p.planners?.nin,
                    id_url: p.planners?.[0]?.id_url || p.planners?.id_url,
                    passport_url: p.planners?.[0]?.passport_url || p.planners?.passport_url,
                    kyc_data: p.planners?.[0]?.kyc_data || p.planners?.kyc_data || {}
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

            // Fetch Platform Assets
            const { data: announceData } = await supabase.from('platform_announcements').select('*').order('created_at', { ascending: false });
            if (announceData) setAnnouncements(announceData);

            const { data: linkData } = await supabase.from('external_links').select('*').order('order_index', { ascending: true });
            if (linkData) setExternalLinks(linkData);

            // Fetch Homepage Settings
            const { data: homeSettingsData } = await supabase
                .from('site_settings')
                .select('key, value');

            if (homeSettingsData) {
                const s: Record<string, string> = { ...homepageSettings };
                homeSettingsData.forEach(item => s[item.key] = item.value);
                setHomepageSettings(s);
            }

            setIsLoadingUsers(false);
        };

        fetchDashboardData();

        // Handle URL hash for tab switching
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (['overview', 'branding', 'users', 'payments', 'settings', 'platform'].includes(hash)) {
                setActiveTab(hash as any);
                // Also scroll to top if it's a tab switch
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [router, showToast, logError]);

    const saveSettings = async (type: 'branding' | 'features' | 'gateways' | 'plans' | 'kyc') => {
        setIsSaving(true);
        const supabase = createClient();

        const payload: any = {};
        if (type === 'branding') payload.branding = branding;
        if (type === 'features') payload.features = features;
        if (type === 'gateways') payload.gateway_keys = gatewayKeys;
        if (type === 'plans') payload.subscription_plans = plans.map((p: SubscriptionPlan) => ({ ...p, isEditing: false }));
        if (type === 'kyc') payload.kyc_requirements = kycRequirements;

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

    const declinePlanner = async (plannerId: string) => {
        const supabase = createClient();
        const { error } = await supabase
            .from('profiles')
            .update({ verification_status: 'requires_verification' })
            .eq('id', plannerId);

        if (error) {
            logError("Failed to decline planner", error);
            showToast("Failed to decline planner", "error");
        } else {
            setPendingPlanners((prev: PendingPlanner[]) => prev.filter((p: PendingPlanner) => p.id !== plannerId));
            showToast("Planner request declined (Set to require verification)", "info");
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

    const addAnnouncement = async () => {
        if (!newAnnouncement.title || !newAnnouncement.content) {
            showToast("Title and Content are required", "error");
            return;
        }
        setIsSaving(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from('platform_announcements')
            .insert([newAnnouncement])
            .select()
            .single();

        if (error) {
            showToast("Failed to create announcement", "error");
        } else {
            setAnnouncements([data, ...announcements]);
            setNewAnnouncement({ title: "", content: "", image_url: "", link_url: "" });
            showToast("Announcement published!", "success");
        }
        setIsSaving(false);
    };

    const deleteAnnouncement = async (id: string) => {
        const supabase = createClient();
        const { error } = await supabase.from('platform_announcements').delete().eq('id', id);
        if (error) showToast("Failed to delete", "error");
        else setAnnouncements(announcements.filter(a => a.id !== id));
    };

    const toggleAnnouncement = async (id: string, currentStatus: boolean) => {
        const supabase = createClient();
        const { error } = await supabase.from('platform_announcements').update({ is_active: !currentStatus }).eq('id', id);
        if (error) showToast("Failed to update status", "error");
        else setAnnouncements(announcements.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a));
    };

    const addExternalLink = async () => {
        if (!newLink.label || !newLink.url) return;
        setIsSaving(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from('external_links')
            .insert([{ ...newLink, order_index: externalLinks.length }])
            .select()
            .single();

        if (error) showToast("Failed to add link", "error");
        else {
            setExternalLinks([...externalLinks, data]);
            setNewLink({ label: "", url: "" });
            showToast("External link added", "success");
        }
        setIsSaving(false);
    };

    const deleteExternalLink = async (id: string) => {
        const supabase = createClient();
        await supabase.from('external_links').delete().eq('id', id);
        setExternalLinks(externalLinks.filter(l => l.id !== id));
    };

    const saveHomepageSettings = async () => {
        setIsSaving(true);
        const supabase = createClient();

        try {
            const updates = Object.entries(homepageSettings).map(([key, value]) => ({
                key,
                value,
                updated_at: new Date().toISOString()
            }));

            const { error } = await supabase
                .from('site_settings')
                .upsert(updates, { onConflict: 'key' });

            if (error) throw error;
            showToast("Homepage settings updated successfully!", "success");
        } catch (error: any) {
            logError("Failed to save homepage settings", error);
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "branding", label: "Branding", icon: Palette },
        { id: "users", label: "User Management", icon: Users },
        { id: "payments", label: "Payments", icon: CreditCard },
        { id: "settings", label: "Platform Settings", icon: Settings },
        { id: "platform", label: "Platform", icon: LayoutDashboard },
        { id: "homepage", label: "Hero & Homepage", icon: LayoutDashboard },
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#050505] -m-4 md:-m-8 p-4 md:p-8 animate-in fade-in duration-500">
            {/* Admin Header */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white dark:bg-[#0A0A0A] p-4 rounded-2xl border border-foreground/5 shadow-sm">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search for a menu"
                        className="w-full bg-foreground/5 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-end">
                    <Link
                        href="/"
                        target="_blank"
                        className="p-2.5 rounded-xl bg-foreground/5 hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500 transition-all"
                        title="View Website"
                    >
                        <ExternalLink size={20} />
                    </Link>
                    <button
                        className="p-2.5 rounded-xl bg-foreground/5 hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500 transition-all"
                        title="Quick Actions"
                    >
                        <LayoutDashboard size={20} />
                    </button>
                    <div className="h-8 w-[1px] bg-foreground/10 mx-2 hidden md:block" />
                    <div className="flex items-center gap-3 pl-2">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-foreground">Administrator</p>
                            <p className="text-[10px] text-muted-foreground">Super Admin</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/20">
                            A
                        </div>
                    </div>
                </div>
            </header>

            {/* Overview Content */}
            {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Top Full-Width Chart Card */}
                    <Card className="p-6 overflow-hidden border-none shadow-sm bg-white dark:bg-[#0A0A0A]" hover={false}>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Recent Transaction</h3>
                                <p className="text-[10px] text-muted-foreground mt-1">DEPOSIT: 0 NGN</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 rounded-lg bg-foreground/5 text-[10px] font-bold text-foreground">This Month</button>
                                <button className="px-3 py-1 rounded-lg text-[10px] font-bold text-muted-foreground hover:bg-foreground/5 transition-colors">Last Month</button>
                            </div>
                        </div>
                        <div className="h-[200px] w-full bg-foreground/[0.02] rounded-xl flex items-end px-4 pb-8 relative overflow-hidden">
                            {/* Simple CSS-based Chart Decoration */}
                            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-blue-500/20 w-full" />
                            <div className="absolute left-0 bottom-0 w-full h-24 bg-gradient-to-t from-blue-500/5 to-transparent" />
                            <svg className="w-full h-full text-blue-500 opacity-50" viewBox="0 0 1000 100" preserveAspectRatio="none">
                                <path d="M0,80 L100,75 L200,85 L300,70 L400,75 L500,60 L600,65 L700,50 L800,55 L900,40 L1000,45" fill="none" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <div className="absolute bottom-2 left-0 w-full flex justify-between px-4 text-[8px] text-muted-foreground font-mono">
                                <span>Day 01</span><span>Day 05</span><span>Day 10</span><span>Day 15</span><span>Day 20</span><span>Day 25</span><span>Day 30</span>
                            </div>
                        </div>
                    </Card>

                    {/* Stats Grid - 4 Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: "TOTAL USERS", value: stats.activePlanners.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
                            { label: "PENDING TICKETS", value: "0", icon: LifeBuoy, color: "text-purple-500", bg: "bg-purple-500/10" },
                            { label: "PENDING KYC", value: pendingPlanners.length.toString(), icon: ShieldAlert, color: "text-orange-500", bg: "bg-orange-500/10" },
                            { label: "THIS MONTH TRANSACTIONS", value: "0", icon: CreditCard, color: "text-green-500", bg: "bg-green-500/10" },
                        ].map((stat, i) => (
                            <Card key={i} className="p-6 border-none shadow-sm bg-white dark:bg-[#0A0A0A]" hover={true}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/5 px-2 py-0.5 rounded-full">
                                        <TrendingUp size={10} />
                                        0%
                                    </div>
                                </div>
                                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</h3>
                                <div className="flex items-end justify-between">
                                    <span className="text-2xl font-black text-foreground">{stat.value}</span>
                                    <span className="text-[10px] text-muted-foreground">from 0</span>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Orders History & Summary Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 p-6 border-none shadow-sm bg-white dark:bg-[#0A0A0A]" hover={false}>
                            <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-6">Orders History</h3>
                            <div className="h-[300px] w-full flex items-end gap-2 px-2 pb-8 bg-foreground/[0.01] rounded-xl relative">
                                {[40, 70, 45, 90, 65, 80, 50, 30, 85, 60, 75, 55].map((h, i) => (
                                    <div key={i} className="flex-1 bg-blue-500/20 hover:bg-blue-500 transition-all rounded-t-sm relative group" style={{ height: `${h}%` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            Value: {h}
                                        </div>
                                    </div>
                                ))}
                                <div className="absolute bottom-2 left-0 w-full flex justify-around px-2 text-[8px] text-muted-foreground font-mono">
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <span key={m}>{m}</span>)}
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 border-none shadow-sm bg-white dark:bg-[#0A0A0A] flex flex-col justify-center items-center text-center space-y-4" hover={false}>
                            <div className="w-32 h-32 rounded-full border-8 border-foreground/5 border-t-blue-500 flex items-center justify-center relative">
                                <span className="text-xl font-black">{stats.platformRevenue}</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Total Revenue</h3>
                                <p className="text-xs text-muted-foreground mt-1">Platform wide earnings</p>
                            </div>
                            <div className="w-full pt-4 border-t border-foreground/5 text-left">
                                <div className="flex justify-between items-center text-xs mb-2">
                                    <span className="text-muted-foreground">This Week</span>
                                    <span className="font-bold">₦0</span>
                                </div>
                                <div className="w-full bg-foreground/5 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full w-[10%]" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Latest Users Table Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Latest Users</h3>
                            <Link href="#users" className="text-[10px] font-bold text-blue-500 hover:underline">View All</Link>
                        </div>
                        <Card className="p-0 overflow-hidden border-none shadow-sm bg-white dark:bg-[#0A0A0A]" hover={false}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs min-w-[800px]">
                                    <thead className="bg-[#F8F9FA] dark:bg-foreground/[0.02] text-muted-foreground font-bold border-b border-foreground/5">
                                        <tr>
                                            <th className="p-4">USER</th>
                                            <th className="p-4">EMAIL</th>
                                            <th className="p-4">ROLE</th>
                                            <th className="p-4">JOINED</th>
                                            <th className="p-4">STATUS</th>
                                            <th className="p-4 text-right">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-foreground/5 transition-colors">
                                        {users.slice(0, 5).map((user) => (
                                            <tr key={user.id} className="hover:bg-foreground/[0.01]">
                                                <td className="p-4 font-bold flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-[10px]">
                                                        {user.full_name?.[0] || 'U'}
                                                    </div>
                                                    {user.full_name}
                                                </td>
                                                <td className="p-4 text-muted-foreground">{user.email}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-red-500/10 text-red-500' : user.role === 'planner' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-muted-foreground">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5 text-green-500 font-bold">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                        Active
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right relative group">
                                                    <button className="p-1.5 rounded-lg hover:bg-foreground/10 transition-colors">
                                                        <MoreVertical size={14} className="text-muted-foreground" />
                                                    </button>
                                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-background border border-foreground/10 rounded-lg shadow-xl overflow-hidden z-10 pointer-events-none group-hover:pointer-events-auto">
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); deleteUser(user.id); }}
                                                            className="px-3 py-1.5 text-[10px] uppercase font-black tracking-widest text-red-500 hover:bg-red-500/10 flex items-center gap-1"
                                                        >
                                                            <Trash2 size={12} /> Delete
                                                        </button>
                                                    </div>
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
                                    <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload size={24} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm font-bold text-white">Upload New Logo</p>
                                    <p className="text-xs text-gray-500 mt-1">Recommended size: 512x512 PNG</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                                <div className="space-y-4">
                                    <label className="text-sm font-bold uppercase tracking-widest text-gray-500 font-mono">Primary Color</label>
                                    <div className="flex items-center gap-4 p-4 glass-panel rounded-2xl border-white/5 bg-white/[0.02]">
                                        <input
                                            type="color"
                                            value={branding.primaryColor}
                                            onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                            className="w-12 h-12 rounded-xl bg-transparent cursor-pointer border-none"
                                        />
                                        <span className="text-sm font-mono text-gray-300 uppercase font-bold tracking-wider">{branding.primaryColor}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-sm font-bold uppercase tracking-widest text-gray-500 font-mono">Secondary Color</label>
                                    <div className="flex items-center gap-4 p-4 glass-panel rounded-2xl border-white/5 bg-white/[0.02]">
                                        <input
                                            type="color"
                                            value={branding.secondaryColor}
                                            onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                                            className="w-12 h-12 rounded-xl bg-transparent cursor-pointer border-none"
                                        />
                                        <span className="text-sm font-mono text-gray-300 uppercase font-bold tracking-wider">{branding.secondaryColor}</span>
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
                        <div className="hidden lg:block space-y-8 p-12 glass-panel rounded-[3rem] border-foreground/5 bg-background/40 backdrop-blur-md relative overflow-hidden">
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
                            <DebouncedSearchInput
                                placeholder="Search users by name, email or ID..."
                                onSearchChange={setSearchQuery}
                            />
                        </div>
                        <div className="flex flex-wrap gap-4 w-full md:w-auto">
                            <select
                                className="bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Pending KYC Approvals */}
                    {pendingPlanners.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <ShieldAlert className="text-orange-500" size={20} />
                                    Action Required: Pending KYC Approvals
                                </h3>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-foreground/5 px-3 py-1 rounded-full">
                                    {pendingPlanners.length} Pending
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {pendingPlanners.map((planner: PendingPlanner) => (
                                    <Card key={planner.id} className="p-5 border-orange-500/20 bg-orange-500/[0.02]" hover={false}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center font-bold text-orange-400">
                                                    {(planner.name || "U").charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{planner.name}</p>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{planner.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                                                    onClick={() => declinePlanner(planner.id)}
                                                >
                                                    Decline
                                                </Button>
                                                <Button
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => approvePlanner(planner.id)}
                                                >
                                                    Verify & Approve
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-foreground/5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">NIN:</span>
                                                <span className="font-mono text-sm">{planner.nin || "Not Provided"}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                {planner.passport_url && (
                                                    <a href={planner.passport_url} target="_blank" className="block w-full p-2 rounded-xl bg-foreground/5 border border-foreground/10 hover:border-blue-500/50 transition-colors">
                                                        <div className="aspect-square bg-foreground/5 rounded-lg mb-2 overflow-hidden">
                                                            <img src={planner.passport_url} alt="Passport" className="w-full h-full object-cover" />
                                                        </div>
                                                        <p className="text-[10px] font-bold text-center uppercase tracking-wider text-muted-foreground">View Passport</p>
                                                    </a>
                                                )}
                                                {planner.id_url && (
                                                    <a href={planner.id_url} target="_blank" className="block w-full p-2 rounded-xl bg-foreground/5 border border-foreground/10 hover:border-blue-500/50 transition-colors">
                                                        <div className="aspect-square bg-foreground/5 rounded-lg mb-2 overflow-hidden flex items-center justify-center text-blue-500">
                                                            <ExternalLink size={24} />
                                                        </div>
                                                        <p className="text-[10px] font-bold text-center uppercase tracking-wider text-muted-foreground">View Document</p>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Users List */}
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
                                            const query = searchQuery.toLowerCase();
                                            const matchesSearch = ((user.full_name || "").toLowerCase().includes(query) ||
                                                (user.email || "").toLowerCase().includes(query));
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
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${user.role === 'planner' ? 'bg-blue-500/10 text-blue-500' : 'bg-foreground/10 text-muted-foreground'}`}>
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
                                                <td className="p-5 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button className="p-3 hover:bg-foreground/5 rounded-xl text-muted-foreground hover:text-foreground transition-all"><MoreVertical size={18} /></button>
                                                        <button className="p-3 hover:bg-yellow-500/10 rounded-xl text-muted-foreground hover:text-yellow-500 transition-all"><ShieldAlert size={18} /></button>
                                                        <button className="p-3 hover:bg-red-500/10 rounded-xl text-muted-foreground hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                                                    </div>
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
                                        <div key={i} className="flex items-center justify-between p-4 glass-panel rounded-xl border-foreground/5 group hover:bg-foreground/[0.03] transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center font-bold text-sm text-muted-foreground group-hover:text-blue-500 transition-colors">
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
                                            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-foreground/10 transition-all text-muted-foreground hover:text-foreground"
                                        >
                                            {plan.isEditing ? <Save size={16} /> : <Edit3 size={16} />}
                                        </button>

                                        {/* Plan Name */}
                                        {plan.isEditing ? (
                                            <Input
                                                value={plan.name}
                                                onChange={(e: any) => updatePlanField(plan.id, "name", e.target.value)}
                                                className="text-lg font-bold bg-foreground/5"
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
                                                    className="bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-3 text-sm text-foreground focus:outline-none"
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
                                                className="pl-12 bg-foreground/5 border-foreground/10 focus:border-blue-500/50 transition-all h-12 rounded-xl"
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
                                            className={`w-10 h-5 rounded-full transition-all relative ${setting.enabled ? 'bg-blue-500' : 'bg-foreground/10'}`}
                                        >
                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${setting.enabled ? 'right-0.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                ))}
                            </Card>
                        </section>
                        <section className="space-y-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Shield className="text-blue-500" size={20} />
                                KYC & Verification Requirements
                            </h3>
                            <Card className="p-6 space-y-6" hover={false}>
                                <p className="text-sm text-gray-400">Configure what planners need to provide to get verified.</p>
                                <div className="space-y-4">
                                    {kycRequirements.map((req, i) => (
                                        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 glass-panel rounded-xl border border-white/5 relative group">
                                            <div className="flex-1 space-y-1">
                                                <Input
                                                    value={req.label}
                                                    onChange={e => setKycRequirements(prev => prev.map((r, idx) => idx === i ? { ...r, label: e.target.value } : r))}
                                                    className="font-bold border-transparent px-0 focus:border-blue-500"
                                                    placeholder="Requirement Label"
                                                />
                                                <div className="flex gap-4">
                                                    <select
                                                        className="bg-transparent border border-white/10 rounded-md text-xs px-2 py-1 text-gray-400 focus:outline-none focus:border-blue-500"
                                                        value={req.type}
                                                        onChange={e => setKycRequirements(prev => prev.map((r, idx) => idx === i ? { ...r, type: e.target.value } : r))}
                                                    >
                                                        <option value="text">Text Input</option>
                                                        <option value="file">File Upload (Document/Image)</option>
                                                    </select>
                                                    <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={req.required}
                                                            onChange={e => setKycRequirements(prev => prev.map((r, idx) => idx === i ? { ...r, required: e.target.checked } : r))}
                                                        /> Required
                                                    </label>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setKycRequirements(prev => prev.filter((_, idx) => idx !== i))}
                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        className="w-full border-dashed"
                                        onClick={() => setKycRequirements(prev => [...prev, { id: `req_${Date.now()}`, label: "New Requirement", type: "text", required: true }])}
                                    >
                                        <Plus size={16} className="mr-2" /> Add Requirement
                                    </Button>
                                    <Button
                                        onClick={() => saveSettings('kyc')}
                                        disabled={isSaving}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isSaving ? "Saving..." : "Save KYC Requirements"}
                                    </Button>
                                </div>
                            </Card>
                        </section>
                    </div>
                )
            }

            {activeTab === "platform" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-8">
                        <section className="space-y-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Bell className="text-blue-500" size={20} />
                                Announcement Popups
                            </h3>
                            <Card className="p-6 space-y-4" hover={false}>
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Heading/Title"
                                        value={newAnnouncement.title}
                                        onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                    />
                                    <textarea
                                        placeholder="Description/Content"
                                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50 min-h-[100px]"
                                        value={newAnnouncement.content}
                                        onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            placeholder="Photo URL (Optional)"
                                            value={newAnnouncement.image_url}
                                            onChange={e => setNewAnnouncement({ ...newAnnouncement, image_url: e.target.value })}
                                        />
                                        <Input
                                            placeholder="Action Link (Optional)"
                                            value={newAnnouncement.link_url}
                                            onChange={e => setNewAnnouncement({ ...newAnnouncement, link_url: e.target.value })}
                                        />
                                    </div>
                                    <Button className="w-full" onClick={addAnnouncement} disabled={isSaving}>
                                        {isSaving ? "Publishing..." : "Publish Announcement"}
                                    </Button>
                                </div>
                            </Card>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Live Announcements</h4>
                                {announcements.map(a => (
                                    <Card key={a.id} className="p-4 flex items-center justify-between border-foreground/5" hover={false}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${a.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                                            <div>
                                                <p className="text-sm font-bold">{a.title}</p>
                                                <p className="text-[10px] text-gray-500 truncate max-w-[200px]">{a.content}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleAnnouncement(a.id, a.is_active)}
                                                className={`p-2 rounded-lg transition-all ${a.is_active ? 'bg-green-500/10 text-green-500' : 'bg-foreground/5 text-muted-foreground'}`}
                                            >
                                                <Info size={14} />
                                            </button>
                                            <button
                                                onClick={() => deleteAnnouncement(a.id)}
                                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        <section className="space-y-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <ExternalLink className="text-blue-500" size={20} />
                                External Navigation Links
                            </h3>
                            <Card className="p-6 space-y-4" hover={false}>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            placeholder="Link Label (e.g. Documentation)"
                                            value={newLink.label}
                                            onChange={e => setNewLink({ ...newLink, label: e.target.value })}
                                        />
                                        <Input
                                            placeholder="URL (https://...)"
                                            value={newLink.url}
                                            onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                                        />
                                    </div>
                                    <Button className="w-full" variant="outline" onClick={addExternalLink} disabled={isSaving}>
                                        <Plus size={16} className="mr-2" /> Add External Link
                                    </Button>
                                </div>
                            </Card>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Active Links</h4>
                                {externalLinks.map(l => (
                                    <Card key={l.id} className="p-4 flex items-center justify-between border-foreground/10 group" hover={false}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-muted-foreground">
                                                <ExternalLink size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{l.label}</p>
                                                <p className="text-[10px] text-gray-500 font-mono">{l.url}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteExternalLink(l.id)}
                                            className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all ml-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            )}

            {activeTab === "homepage" && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-foreground">Homepage Content Control</h2>
                            <p className="text-sm text-muted-foreground">Manage every text, image and link on your landing page.</p>
                        </div>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 px-8 h-12 rounded-xl flex items-center gap-2"
                            onClick={saveHomepageSettings}
                            disabled={isSaving}
                        >
                            <Save size={18} />
                            {isSaving ? "Saving changes..." : "Save All Changes"}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Hero Section Management */}
                        <Card className="p-8 space-y-8 bg-white dark:bg-[#0A0A0A] border-none shadow-sm" hover={false}>
                            <div className="flex items-center gap-3 border-b border-foreground/5 pb-4">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Palette size={20} /></div>
                                <h3 className="font-bold uppercase tracking-widest text-sm">Hero & Global</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Site Logo Text</label>
                                    <Input
                                        value={homepageSettings.site_logo_text}
                                        onChange={e => setHomepageSettings({ ...homepageSettings, site_logo_text: e.target.value })}
                                        className="h-12 bg-foreground/5 border-foreground/10 focus:border-blue-500/50 rounded-xl"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Headline Part 1</label>
                                        <Input
                                            value={homepageSettings.hero_headline_part1}
                                            onChange={e => setHomepageSettings({ ...homepageSettings, hero_headline_part1: e.target.value })}
                                            className="h-12 bg-foreground/5 border-foreground/10 focus:border-blue-500/50 rounded-xl font-serif text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Headline Part 2 (Italic)</label>
                                        <Input
                                            value={homepageSettings.hero_headline_part2}
                                            onChange={e => setHomepageSettings({ ...homepageSettings, hero_headline_part2: e.target.value })}
                                            className="h-12 bg-foreground/5 border-foreground/10 focus:border-blue-500/50 rounded-xl font-serif italic text-lg"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Hero Background Image URL</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={homepageSettings.hero_bg_url}
                                            onChange={e => setHomepageSettings({ ...homepageSettings, hero_bg_url: e.target.value })}
                                            className="flex-1 h-12 bg-foreground/5 border-foreground/10 focus:border-blue-500/50 rounded-xl"
                                        />
                                        <div className="w-12 h-12 rounded-xl border border-foreground/10 overflow-hidden shrink-0">
                                            <img src={homepageSettings.hero_bg_url} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Location Placeholder</label>
                                        <Input
                                            value={homepageSettings.hero_search_loc_placeholder}
                                            onChange={e => setHomepageSettings({ ...homepageSettings, hero_search_loc_placeholder: e.target.value })}
                                            className="h-12 bg-foreground/5 border-foreground/10 focus:border-blue-500/50 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Event Type Placeholder</label>
                                        <Input
                                            value={homepageSettings.hero_search_type_placeholder}
                                            onChange={e => setHomepageSettings({ ...homepageSettings, hero_search_type_placeholder: e.target.value })}
                                            className="h-12 bg-foreground/5 border-foreground/10 focus:border-blue-500/50 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Digital Estate & Why Us */}
                        <div className="space-y-8">
                            <Card className="p-8 space-y-6 bg-white dark:bg-[#0A0A0A] border-none shadow-sm" hover={false}>
                                <div className="flex items-center gap-3 border-b border-foreground/5 pb-4">
                                    <div className="p-2 rounded-lg bg-green-500/10 text-green-500"><LayoutDashboard size={20} /></div>
                                    <h3 className="font-bold uppercase tracking-widest text-sm">The Digital Estate (Grow)</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Label</label>
                                            <Input
                                                value={homepageSettings.grow_section_label}
                                                onChange={e => setHomepageSettings({ ...homepageSettings, grow_section_label: e.target.value })}
                                                className="bg-foreground/5 border-foreground/10 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Section Title</label>
                                            <Input
                                                value={homepageSettings.grow_section_title}
                                                onChange={e => setHomepageSettings({ ...homepageSettings, grow_section_title: e.target.value })}
                                                className="bg-foreground/5 border-foreground/10 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description/Subtitle</label>
                                        <textarea
                                            value={homepageSettings.grow_section_subtitle}
                                            onChange={e => setHomepageSettings({ ...homepageSettings, grow_section_subtitle: e.target.value })}
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50 min-h-[80px]"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic flex items-center gap-2">
                                        <Info size={12} /> Individual features are managed in the "Home Features" table.
                                    </p>
                                </div>
                            </Card>

                            <Card className="p-8 space-y-6 bg-white dark:bg-[#0A0A0A] border-none shadow-sm" hover={false}>
                                <div className="flex items-center gap-3 border-b border-foreground/5 pb-4">
                                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500"><Star size={20} /></div>
                                    <h3 className="font-bold uppercase tracking-widest text-sm">The Standard (Why Us)</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Label</label>
                                            <Input
                                                value={homepageSettings.why_us_label}
                                                onChange={e => setHomepageSettings({ ...homepageSettings, why_us_label: e.target.value })}
                                                className="bg-foreground/5 border-foreground/10 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Section Title</label>
                                            <Input
                                                value={homepageSettings.why_us_title}
                                                onChange={e => setHomepageSettings({ ...homepageSettings, why_us_title: e.target.value })}
                                                className="bg-foreground/5 border-foreground/10 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description/Subtitle</label>
                                        <textarea
                                            value={homepageSettings.why_us_subtitle}
                                            onChange={e => setHomepageSettings({ ...homepageSettings, why_us_subtitle: e.target.value })}
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50 min-h-[80px]"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic flex items-center gap-2">
                                        <Info size={12} /> Individual reasons are managed in the "Home Reasons" table.
                                    </p>
                                </div>
                            </Card>

                            <Card className="p-8 space-y-6 bg-white dark:bg-[#0A0A0A] border-none shadow-sm" hover={false}>
                                <div className="flex items-center gap-3 border-b border-foreground/5 pb-4">
                                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500"><Users size={20} /></div>
                                    <h3 className="font-bold uppercase tracking-widest text-sm">Planners & Portfolio</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Planners Label</label>
                                            <Input
                                                value={homepageSettings.planners_label}
                                                onChange={e => setHomepageSettings({ ...homepageSettings, planners_label: e.target.value })}
                                                className="bg-foreground/5 border-foreground/10 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Planners Title</label>
                                            <Input
                                                value={homepageSettings.planners_title}
                                                onChange={e => setHomepageSettings({ ...homepageSettings, planners_title: e.target.value })}
                                                className="bg-foreground/5 border-foreground/10 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Portfolio Label</label>
                                            <Input
                                                value={homepageSettings.portfolio_label}
                                                onChange={e => setHomepageSettings({ ...homepageSettings, portfolio_label: e.target.value })}
                                                className="bg-foreground/5 border-foreground/10 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Portfolio Title</label>
                                            <Input
                                                value={homepageSettings.portfolio_title}
                                                onChange={e => setHomepageSettings({ ...homepageSettings, portfolio_title: e.target.value })}
                                                className="bg-foreground/5 border-foreground/10 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Visionaries & Footer */}
                        <Card className="p-8 space-y-8 bg-white dark:bg-[#0A0A0A] border-none shadow-sm" hover={false}>
                            <div className="flex items-center gap-3 border-b border-foreground/5 pb-4">
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><Users size={20} /></div>
                                <h3 className="font-bold uppercase tracking-widest text-sm">Visionaries & Footer</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Visionaries Title</label>
                                    <Input
                                        value={homepageSettings.visionaries_title}
                                        onChange={e => setHomepageSettings({ ...homepageSettings, visionaries_title: e.target.value })}
                                        className="h-12 bg-foreground/5 border-foreground/10 focus:border-blue-500/50 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Visionaries Subtitle</label>
                                    <textarea
                                        value={homepageSettings.visionaries_subtitle}
                                        onChange={e => setHomepageSettings({ ...homepageSettings, visionaries_subtitle: e.target.value })}
                                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50 min-h-[80px]"
                                    />
                                </div>

                                <div className="h-[1px] bg-foreground/5 w-full my-4" />

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Footer Tagline</label>
                                    <textarea
                                        value={homepageSettings.footer_tagline}
                                        onChange={e => setHomepageSettings({ ...homepageSettings, footer_tagline: e.target.value })}
                                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50 min-h-[60px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Newsletter Description</label>
                                    <textarea
                                        value={homepageSettings.footer_newsletter_description}
                                        onChange={e => setHomepageSettings({ ...homepageSettings, footer_newsletter_description: e.target.value })}
                                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50 min-h-[60px]"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div >
    );
}
