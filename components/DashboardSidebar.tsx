"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    User,
    Image as ImageIcon,
    Calendar,
    Settings,
    LogOut,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
    LucideIcon,
    Shield,
    TrendingUp,
    Users,
    CreditCard,
    Briefcase,
    History,
    Search,
    MessageSquare,
    ExternalLink,
    LifeBuoy,
    ShieldAlert,
    Wallet,
    Bell,
    Star
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "./ui/Toast";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { LoadingScreen } from "./ui/LoadingScreen";

interface SubItem {
    label: string;
    href: string;
}

interface NavItem {
    label: string;
    href?: string;
    icon: LucideIcon;
    subItems?: SubItem[];
}

export function DashboardSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { showToast } = useToast();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});
    const [role, setRole] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [dbUsername, setDbUsername] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [externalLinks, setExternalLinks] = useState<any[]>([]);
    const [menuSearch, setMenuSearch] = useState("");

    const supabase = createClient();

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            setUser(user);

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, username, full_name')
                    .eq('id', user.id)
                    .single();
                setRole(profile?.role || 'client');
                setDbUsername(profile?.username);
                setFullName(profile?.full_name);

                const fetchUnread = async () => {
                    const { count } = await supabase
                        .from('messages')
                        .select('*', { count: 'exact', head: true })
                        .eq('is_read', false)
                        .neq('sender_id', user.id);
                    setUnreadCount(count || 0);
                };
                fetchUnread();

                const { data: links } = await supabase
                    .from('external_links')
                    .select('*')
                    .order('order_index', { ascending: true });
                setExternalLinks(links || []);

                const subscription = supabase
                    .channel('unread_messages')
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchUnread())
                    .subscribe();

                return () => {
                    supabase.removeChannel(subscription);
                };
            }
        };

        let cleanup: (() => void) | undefined;
        init().then(cleanupFn => {
            if (cleanupFn) cleanup = cleanupFn;
        });

        return () => {
            if (cleanup) cleanup();
        };
    }, [supabase]);

    const toggleSubMenu = (label: string) => {
        setOpenSubMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const handleSignOut = async () => {
        setIsLoggingOut(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Logout error:", error);
            showToast("Logout failed", "error");
            setIsLoggingOut(false);
            return;
        }

        showToast("Logged out successfully", "success");
        window.location.href = "/";
    };

    const navGroups: Record<string, any> = {
        planner: [
            { label: "Overview", href: "/dashboard/planner", icon: LayoutDashboard },
            {
                label: "Portfolio",
                icon: ImageIcon,
                subItems: [
                    { label: "View Portfolio", href: `/planner/${dbUsername || ''}` },
                    { label: "Manage Media", href: "/dashboard/planner/portfolio" }
                ]
            },
            { label: "Profile Settings", href: "/dashboard/planner/profile", icon: User },
            { label: "Bookings", href: "/dashboard/planner#bookings", icon: Calendar },
            { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
            { label: "Settings", href: "/dashboard/settings", icon: Settings },
        ],
        admin: [
            {
                category: "PLATFORM OVERVIEW",
                items: [
                    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
                    { label: "Analytics", href: "/dashboard/admin#stats", icon: TrendingUp },
                ]
            },
            {
                category: "USER MANAGEMENT",
                items: [
                    { label: "User Accounts", href: "/dashboard/admin#users", icon: Users },
                    { label: "Role Requests", href: "/dashboard/admin#roles", icon: ShieldAlert },
                ]
            },
            {
                category: "FINANCIAL MANAGEMENT",
                items: [
                    { label: "Payout Requests", href: "/dashboard/admin#payments", icon: Wallet },
                    { label: "Transactions", href: "/dashboard/admin#transactions", icon: History },
                    { label: "Commission Settings", href: "/dashboard/admin#commissions", icon: CreditCard },
                ]
            },
            {
                category: "CONTENT MANAGEMENT",
                items: [
                    { label: "Announcements", href: "/dashboard/admin/content#announcements", icon: Bell },
                    { label: "External Links", href: "/dashboard/admin/content#links", icon: ExternalLink },
                ]
            },
            {
                category: "SUPPORT & TICKETS",
                items: [
                    { label: "Support Center", href: "/dashboard/admin/support", icon: LifeBuoy },
                ]
            },
            {
                category: "SYSTEM SETTINGS",
                items: [
                    { label: "Platform Settings", href: "/dashboard/admin#settings", icon: Settings },
                ]
            }
        ],
        client: [
            { label: "Overview", href: "/dashboard/client", icon: LayoutDashboard },
            {
                label: "Events",
                icon: Calendar,
                subItems: [
                    { label: "Upcoming Events", href: "/dashboard/client#bookings" },
                    { label: "Booking History", href: "/dashboard/client#history" },
                    { label: "Find Planners", href: "/planners" },
                    { label: "Featured Events", href: "/events" }
                ]
            },
            { label: "Favorites", href: "/dashboard/client#saved", icon: Star },
            { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
            { label: "Settings", href: "/dashboard/client/settings", icon: Settings },
            { label: "Pricing", href: "/pricing", icon: CreditCard },
        ]
    };

    const currentNav = role ? navGroups[role as keyof typeof navGroups] : [];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-cream border-r border-om-border/40 py-10 transition-colors duration-700 overflow-hidden">
            <div className="px-8 mb-10 flex items-center justify-between">
                <Link href="/" className="text-2xl font-serif text-charcoal tracking-widest uppercase">
                    EVENTLY<span className="text-gold">.</span>
                </Link>
                <NotificationBell />
            </div>

            {role === 'admin' && (
                <div className="px-8 mb-8">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30 group-focus-within:text-gold transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search parameters..."
                            className="w-full bg-charcoal/5 border border-om-border/30 rounded-none py-3 pl-10 pr-4 text-[11px] font-sans uppercase tracking-widest focus:ring-1 focus:ring-gold/50 outline-none transition-all placeholder:text-charcoal/30"
                            value={menuSearch}
                            onChange={(e) => setMenuSearch(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <nav className="flex-1 overflow-y-auto scrollbar-hide px-6 space-y-8">
                {role === 'admin' ? (
                    navGroups.admin.map((group: any, groupIdx: number) => {
                        const filteredItems = group.items.filter((item: any) =>
                            item.label.toLowerCase().includes(menuSearch.toLowerCase())
                        );

                        if (filteredItems.length === 0) return null;

                        return (
                            <div key={group.category} className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${groupIdx * 50}ms` }}>
                                <h3 className="px-4 text-[9px] font-bold text-[#8B7355]/60 uppercase tracking-[0.3em] mb-4">
                                    {group.category}
                                </h3>
                                <div className="space-y-1">
                                    {filteredItems.map((item: any) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                className={`flex items-center gap-4 px-4 py-3 rounded-none text-[12px] font-bold uppercase tracking-widest transition-all duration-300 group ${isActive ? 'bg-charcoal text-cream shadow-xl' : 'text-[#6B5E4E] hover:text-charcoal hover:bg-charcoal/5'}`}
                                            >
                                                <item.icon size={16} className={isActive ? 'text-gold' : 'group-hover:text-gold transition-colors'} />
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="space-y-2">
                        {currentNav.map((item: NavItem, index: number) => {
                            const hasSubItems = item.subItems && item.subItems.length > 0;
                            const isActive = pathname === item.href;
                            const isSubActive = item.subItems?.some((sub: SubItem) => pathname === sub.href);
                            const isOpen = openSubMenus[item.label] || isSubActive;

                            return (
                                <div
                                    key={item.label}
                                    className="space-y-1 animate-in fade-in slide-in-from-left-4 duration-500"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {hasSubItems ? (
                                        <button
                                            onClick={() => toggleSubMenu(item.label)}
                                            className={`w-full flex items-center justify-between px-4 py-4 rounded-none text-[12px] font-bold uppercase tracking-widest transition-all duration-300 group ${isOpen ? 'bg-charcoal/5 text-charcoal' : 'text-[#6B5E4E] hover:text-charcoal hover:bg-charcoal/5'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <item.icon size={16} className={isOpen ? 'text-gold' : 'group-hover:text-gold transition-colors'} />
                                                <span>{item.label}</span>
                                            </div>
                                            {isOpen ? <ChevronDown size={14} className="text-charcoal/40" /> : <ChevronRight size={14} className="text-charcoal/40" />}
                                        </button>
                                    ) : (
                                        <Link
                                            href={item.href || "#"}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={`flex items-center gap-4 px-4 py-4 rounded-none text-[12px] font-bold uppercase tracking-widest transition-all duration-300 group ${isActive ? 'bg-charcoal text-cream font-black' : 'text-[#6B5E4E] hover:text-charcoal hover:bg-charcoal/5'}`}
                                        >
                                            <div className={`p-2 rounded-none transition-colors ${isActive ? 'bg-transparent' : 'bg-charcoal/5 group-hover:bg-charcoal/10'}`}>
                                                <item.icon size={16} className={isActive ? 'text-gold' : 'group-hover:text-gold transition-colors'} />
                                            </div>
                                            <div className="flex-1 flex items-center justify-between">
                                                <span>{item.label}</span>
                                                {item.label === "Messages" && unreadCount > 0 && (
                                                    <span className="bg-charcoal text-cream text-[9px] font-black px-2 py-0.5 rounded-full border border-gold/30">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    )}

                                    {hasSubItems && isOpen && (
                                        <div className="ml-16 space-y-1 animate-in slide-in-from-top-2 duration-300">
                                            {item.subItems?.map((sub: SubItem) => (
                                                <Link
                                                    key={sub.label}
                                                    href={sub.href}
                                                    onClick={() => setIsMobileOpen(false)}
                                                    className={`block py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors relative before:absolute before:left-[-20px] before:top-1/2 before:w-1 before:h-1 before:rounded-full before:-translate-y-1/2 before:transition-all ${pathname === sub.href ? 'text-forest font-black before:bg-forest' : 'text-[#6B5E4E] hover:text-charcoal before:bg-charcoal/10 hover:before:bg-gold/60'}`}
                                                >
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {role !== 'admin' && (
                    <div className="pt-8 mt-8 border-t border-om-border/30 space-y-2">
                        <p className="px-4 text-[9px] font-bold text-[#8B7355]/40 uppercase tracking-[0.3em] mb-4 italic">Estate Resources</p>
                        {externalLinks.map((link, idx) => (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between px-4 py-4 rounded-none text-[12px] font-bold uppercase tracking-widest text-[#6B5E4E] hover:text-charcoal hover:bg-charcoal/5 transition-all duration-300 group"
                                style={{ animationDelay: `${(currentNav.length + idx) * 50}ms` }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-none bg-charcoal/5 group-hover:bg-charcoal/10 transition-colors">
                                        <ExternalLink size={16} className="group-hover:text-gold transition-colors" />
                                    </div>
                                    <span>{link.label}</span>
                                </div>
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                            </a>
                        ))}
                        {role === 'client' && (
                            <Link
                                href="/dashboard/client/support"
                                onClick={() => setIsMobileOpen(false)}
                                className={`flex items-center justify-between px-4 py-4 rounded-none text-[12px] font-bold uppercase tracking-widest transition-all duration-300 group ${pathname === '/dashboard/client/support' ? 'bg-charcoal text-cream font-black' : 'text-[#6B5E4E] hover:text-charcoal hover:bg-charcoal/5'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-none transition-colors ${pathname === '/dashboard/client/support' ? 'bg-transparent' : 'bg-charcoal/5 group-hover:bg-charcoal/10'}`}>
                                        <LifeBuoy size={16} className={pathname === '/dashboard/client/support' ? 'text-gold' : 'group-hover:text-gold transition-colors'} />
                                    </div>
                                    <span>Concierge Help</span>
                                </div>
                            </Link>
                        )}
                    </div>
                )}
            </nav>

            <div className="mt-auto pt-8 border-t border-om-border/30 px-6 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <ThemeToggle />
                </div>
                <div className="flex items-center gap-4 p-3 bg-surface border border-om-border/20 shadow-sm">
                    <div className="w-12 h-12 rounded-none bg-charcoal flex items-center justify-center text-gold font-serif text-lg border border-gold/30">
                        {user?.email?.[0].toUpperCase() || "U"}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[11px] font-black uppercase tracking-widest truncate text-charcoal">{fullName || "ESTATE AGENT"}</p>
                        <p className="text-[10px] text-[#6B5E4E] truncate font-sans italic opacity-70">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-3 px-4 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-red-900/60 hover:text-red-900 hover:bg-red-900/5 border border-transparent hover:border-red-900/10 transition-all font-serif italic"
                >
                    <LogOut size={14} />
                    Depart Estate
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-cream border-b border-om-border/30 px-6 flex items-center justify-between z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 text-charcoal hover:bg-charcoal/5 transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <Link href="/" className="text-xl font-serif text-charcoal tracking-widest uppercase">
                        EVENTLY<span className="text-gold">.</span>
                    </Link>
                </div>
                <NotificationBell />
            </div>

            <aside className="hidden md:block fixed top-0 left-0 bottom-0 w-72 z-40 transform-gpu transition-transform duration-700 ease-out">
                <SidebarContent />
            </aside>

            <div className={`md:hidden fixed inset-0 z-[60] transition-opacity duration-500 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-charcoal/40" onClick={() => setIsMobileOpen(false)} />
                <div className={`absolute top-0 left-0 bottom-0 w-80 transform transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <SidebarContent />
                </div>
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="absolute top-10 right-10 z-[70] h-12 w-12 flex items-center justify-center text-charcoal hover:bg-charcoal/10 rounded-full transition-all border border-charcoal/20 bg-cream"
                >
                    <X size={24} />
                </button>
            </div>

            {isLoggingOut && (
                <LoadingScreen message="Departing the Estate" subMessage="Preparing your safe travels..." />
            )}
        </>
    );
}
