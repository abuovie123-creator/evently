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
    Bell
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
            { label: "My Dashboard", href: "/dashboard/client", icon: LayoutDashboard },
            {
                label: "Explore",
                icon: Search,
                subItems: [
                    { label: "Find Planners", href: "/planners" },
                    { label: "Featured Events", href: "/events" }
                ]
            },
            {
                label: "My Journey",
                icon: Briefcase,
                subItems: [
                    { label: "Upcoming Events", href: "/dashboard/client#bookings" },
                    { label: "Booking History", href: "/dashboard/client#history" }
                ]
            },
            { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
            { label: "Settings", href: "/dashboard/settings", icon: Settings },
        ]
    };

    const currentNav = role ? navGroups[role as keyof typeof navGroups] : [];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-background dark:bg-[#0A0A0A] border-r border-foreground/5 py-8 transition-colors duration-500 overflow-hidden">
            <div className="px-6 mb-8 flex items-center justify-between">
                <Link href="/" className="text-2xl font-black tracking-tighter text-foreground">
                    EVENTLY<span className="text-blue-500">.</span>
                </Link>
                <NotificationBell />
            </div>

            {role === 'admin' && (
                <div className="px-6 mb-6">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search for a menu"
                            className="w-full bg-foreground/5 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                            value={menuSearch}
                            onChange={(e) => setMenuSearch(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <nav className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-6">
                {role === 'admin' ? (
                    navGroups.admin.map((group: any, groupIdx: number) => {
                        const filteredItems = group.items.filter((item: any) =>
                            item.label.toLowerCase().includes(menuSearch.toLowerCase())
                        );

                        if (filteredItems.length === 0) return null;

                        return (
                            <div key={group.category} className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${groupIdx * 50}ms` }}>
                                <h3 className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 opacity-50">
                                    {group.category}
                                </h3>
                                <div className="space-y-1">
                                    {filteredItems.map((item: any) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 group ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'}`}
                                            >
                                                <item.icon size={18} className={isActive ? 'text-white' : 'group-hover:text-blue-500 transition-colors'} />
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="space-y-1">
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
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 group ${isOpen ? 'bg-foreground/5 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon size={18} className={isOpen ? 'text-blue-400' : 'group-hover:text-blue-400 transition-colors'} />
                                                <span>{item.label}</span>
                                            </div>
                                            {isOpen ? <ChevronDown size={14} className="text-muted-foreground/60" /> : <ChevronRight size={14} className="text-muted-foreground/60" />}
                                        </button>
                                    ) : (
                                        <Link
                                            href={item.href || "#"}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 group ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'}`}
                                        >
                                            <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-white/20' : 'bg-foreground/5 group-hover:bg-foreground/10'}`}>
                                                <item.icon size={18} className={isActive ? 'text-white' : 'group-hover:text-blue-400 transition-colors'} />
                                            </div>
                                            <div className="flex-1 flex items-center justify-between text-[13px]">
                                                <span>{item.label}</span>
                                                {item.label === "Messages" && unreadCount > 0 && (
                                                    <span className="bg-blue-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    )}

                                    {hasSubItems && isOpen && (
                                        <div className="ml-14 space-y-1 animate-in slide-in-from-top-2 duration-300">
                                            {item.subItems?.map((sub: SubItem) => (
                                                <Link
                                                    key={sub.label}
                                                    href={sub.href}
                                                    onClick={() => setIsMobileOpen(false)}
                                                    className={`block py-2 text-[13px] transition-colors relative before:absolute before:left-[-16px] before:top-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:-translate-y-1/2 before:transition-all ${pathname === sub.href ? 'text-blue-500 font-bold before:bg-blue-500' : 'text-muted-foreground hover:text-foreground before:bg-foreground/10 hover:before:bg-blue-500/40'}`}
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

                {externalLinks.length > 0 && role !== 'admin' && (
                    <div className="pt-4 mt-4 border-t border-foreground/5 space-y-1">
                        <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Platform Links</p>
                        {externalLinks.map((link, idx) => (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-300 group"
                                style={{ animationDelay: `${(currentNav.length + idx) * 50}ms` }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-foreground/5 group-hover:bg-foreground/10 transition-colors">
                                        <ExternalLink size={18} className="group-hover:text-blue-400 transition-colors" />
                                    </div>
                                    <span>{link.label}</span>
                                </div>
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                            </a>
                        ))}
                    </div>
                )}
            </nav>

            <div className="mt-auto pt-6 border-t border-foreground/5 px-4 space-y-3">
                <div className="mb-2 pl-1">
                    <ThemeToggle />
                </div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm border border-foreground/10">
                        {user?.email?.[0].toUpperCase() || "U"}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate text-foreground">{fullName || user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all"
                >
                    <LogOut size={14} />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-2xl active:scale-90 transition-transform hover:scale-110"
            >
                <Menu size={24} />
            </button>

            <aside className="hidden md:block fixed top-0 left-0 bottom-0 w-72 z-40 transform-gpu transition-transform duration-500 ease-out">
                <SidebarContent />
            </aside>

            <div className={`md:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-foreground/10 dark:bg-black/80 backdrop-blur-md" onClick={() => setIsMobileOpen(false)} />
                <div className={`absolute top-0 left-0 bottom-0 w-80 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <SidebarContent />
                </div>
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="absolute top-8 right-8 z-[70] p-3 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-all"
                >
                    <X size={24} />
                </button>
            </div>

            {isLoggingOut && (
                <LoadingScreen message="Logging you out..." subMessage="See you soon!!" />
            )}
        </>
    );
}
