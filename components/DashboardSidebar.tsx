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

interface UserDropdownProps {
    name: string;
    avatar: string | null;
    onLogout: () => void;
    profileLink?: string;
}

function UserDropdown({ name, avatar, onLogout, profileLink }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative z-50 flex items-center justify-center px-5 py-2.5 bg-surface border border-om-border/30 shadow-sm rounded-full group active:scale-95 transition-all duration-300 min-w-[100px]"
            >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal leading-none">
                    {name.split(' ')[0]}
                </p>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-full min-w-[120px] bg-cream border border-om-border/40 shadow-xl z-[100] rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col">
                        {profileLink && (
                            <Link
                                href={profileLink}
                                className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-charcoal hover:bg-charcoal/5 transition-colors text-center border-b border-om-border/10"
                                onClick={() => setIsOpen(false)}
                            >
                                My Profile
                            </Link>
                        )}
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onLogout();
                            }}
                            className="w-full px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-red-900/80 hover:bg-red-900/5 transition-colors text-center"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

interface SidebarContentProps {
    role: string | null;
    pathname: string;
    navGroups: any;
    currentNav: NavItem[];
    menuSearch: string;
    setMenuSearch: (val: string) => void;
    toggleSubMenu: (label: string) => void;
    openSubMenus: Record<string, boolean>;
    setIsMobileOpen: (val: boolean) => void;
    unreadCount: number;
    externalLinks: any[];
    handleSignOut: () => void;
    fullName: string | null;
    user: any;
}

function SidebarContent({
    role,
    pathname,
    navGroups,
    currentNav,
    menuSearch,
    setMenuSearch,
    toggleSubMenu,
    openSubMenus,
    setIsMobileOpen,
    unreadCount,
    externalLinks,
    handleSignOut,
    fullName,
    user
}: SidebarContentProps) {
    return (
        <div className="flex flex-col h-full bg-cream border border-om-border/40 py-6 transition-colors duration-700 overflow-hidden rounded-2xl">
            <div className="px-6 mb-8 mt-2 flex items-center justify-center">
                <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Evently</span>
            </div>

            {role === 'admin' && (
                <div className="px-8 mb-8">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30 group-focus-within:text-gold transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search parameters..."
                            className="w-full bg-charcoal/5 border border-om-border/30 rounded-none py-3 pl-10 pr-4 text-[11px] text-charcoal font-sans uppercase tracking-widest focus:ring-1 focus:ring-gold/50 outline-none transition-all placeholder:text-charcoal/30"
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

                {role === 'client' && (
                    <div className="pt-8 mt-8 border-t border-om-border/10 space-y-1">
                        <Link
                            href="#"
                            className="flex items-center gap-4 px-4 py-3 rounded-none text-[11px] font-bold uppercase tracking-widest text-[#6B5E4E]/60 hover:text-charcoal transition-all group"
                        >
                            <History size={14} className="group-hover:text-gold transition-colors" />
                            <span>Archived</span>
                        </Link>
                        <Link
                            href="/dashboard/client/support"
                            className="flex items-center gap-4 px-4 py-3 rounded-none text-[11px] font-bold uppercase tracking-widest text-[#6B5E4E]/60 hover:text-charcoal transition-all group"
                        >
                            <LifeBuoy size={14} className="group-hover:text-gold transition-colors" />
                            <span>Help</span>
                        </Link>

                        {externalLinks.length > 0 && (
                            <div className="pt-6 px-4">
                                <a
                                    href={externalLinks[0].url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-4 border border-om-border/30 bg-surface/50 group hover:border-gold transition-all duration-500"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-2 border border-om-border/20 bg-cream group-hover:border-gold transition-colors">
                                            <ExternalLink size={14} className="text-charcoal/40 group-hover:text-gold" />
                                        </div>
                                        <ChevronRight size={14} className="text-charcoal/20 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-charcoal">{externalLinks[0].label}</p>
                                    <p className="text-[8px] text-[#6B5E4E] opacity-60 font-serif italic mt-1">Direct Estate Access</p>
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            <div className="p-6 mt-auto border-t border-om-border/10">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-none text-[12px] font-bold uppercase tracking-widest text-[#6B5E4E]/80 hover:text-red-800 hover:bg-red-900/5 transition-all group"
                >
                    <LogOut size={16} className="group-hover:text-red-700 transition-colors" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
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
                    // First get conversations this user belongs to
                    const { data: convs } = await supabase
                        .from('conversations')
                        .select('id')
                        .or(`client_id.eq.${user.id},planner_id.eq.${user.id}`);

                    if (!convs || convs.length === 0) {
                        setUnreadCount(0);
                        return;
                    }

                    const convIds = convs.map((c: any) => c.id);

                    const { count } = await supabase
                        .from('messages')
                        .select('*', { count: 'exact', head: true })
                        .eq('is_read', false)
                        .neq('sender_id', user.id)
                        .in('conversation_id', convIds);

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
            { label: "Events", href: "/dashboard/client#bookings", icon: Calendar },
            { label: "Favorites", href: "/dashboard/client#saved", icon: Star },
            { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
            { label: "Settings", href: "/dashboard/client/settings", icon: Settings },
        ]
    };

    const currentNav = role ? navGroups[role as keyof typeof navGroups] : [];

    const commonProps = {
        role,
        pathname,
        navGroups,
        currentNav,
        menuSearch,
        setMenuSearch,
        toggleSubMenu,
        openSubMenus,
        setIsMobileOpen,
        unreadCount,
        externalLinks,
        handleSignOut,
        fullName,
        user
    };

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-20 bg-cream border-b border-om-border/10 px-6 flex items-center justify-between z-50">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 text-charcoal hover:bg-charcoal/5 transition-colors"
                >
                    <Menu size={24} />
                </button>

                <div className="flex items-center gap-4">
                    <UserDropdown
                        name={fullName || "User"}
                        avatar={user?.user_metadata?.avatar_url || null}
                        onLogout={handleSignOut}
                        profileLink={
                            role === 'client' ? '/dashboard/client/settings' :
                                role === 'planner' ? '/dashboard/planner/profile' :
                                    role === 'admin' ? '/dashboard/admin#settings' : undefined
                        }
                    />
                </div>
            </div>

            <aside className="hidden md:block fixed top-3 left-3 bottom-3 w-64 z-40 transform-gpu transition-transform duration-700 ease-out rounded-2xl overflow-hidden shadow-md">
                <SidebarContent {...commonProps} />
            </aside>

            <div className={`md:hidden fixed inset-0 z-[60] transition-opacity duration-500 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-charcoal/40" onClick={() => setIsMobileOpen(false)} />
                <div className={`absolute top-0 left-0 bottom-0 w-80 transform transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <SidebarContent {...commonProps} />
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
