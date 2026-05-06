"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell, Check, Trash2, Calendar, MessageSquare, Sparkles, AlertCircle, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "./ui/Toast";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link_url: string;
    is_read: boolean;
    created_at: string;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();
    const supabase = createClient();

    const fetchNotifications = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error("Error fetching notifications:", error);
        } else {
            setNotifications(data || []);
            setUnreadCount(data?.filter(n => !n.is_read).length || 0);
        }
        setIsLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchNotifications();

        const subscribeToNotifications = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) return;

            const channel = supabase
                .channel('notifications_realtime')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${session.user.id}`
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            const newNotif = payload.new as Notification;
                            setNotifications(prev => [newNotif, ...prev].slice(0, 20));
                            setUnreadCount(prev => prev + 1);
                            showToast(newNotif.title, "info");
                        } else {
                            fetchNotifications();
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        const cleanup = subscribeToNotifications();
        return () => {
            cleanup.then(fn => fn && fn());
        };
    }, [supabase, fetchNotifications, showToast]);

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const markAllRead = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', session.user.id)
            .eq('is_read', false);

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            showToast("All notifications marked as read", "success");
        }
    };

    const deleteNotification = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (!error) {
            setNotifications(prev => prev.filter(n => n.id !== id));
            fetchNotifications(); // Refresh count
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'booking_new':
            case 'booking_update':
                return <Calendar size={16} className="text-blue-400" />;
            case 'message_new':
                return <MessageSquare size={16} className="text-green-400" />;
            case 'subscription_update':
                return <Sparkles size={16} className="text-amber-400" />;
            case 'subscription_expiring':
                return <AlertCircle size={16} className="text-red-400" />;
            case 'platform_update':
                return <Info size={16} className="text-blue-500" />;
            default:
                return <Bell size={16} className="text-gray-400" />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-charcoal/5 transition-all group"
                aria-label="Notifications"
            >
                <Bell size={20} className={`transition-colors ${unreadCount > 0 ? 'text-gold' : 'text-charcoal/70 group-hover:text-charcoal'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-charcoal text-cream text-[9px] font-bold flex items-center justify-center rounded-full shadow-sm border border-gold/50">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Popover */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div
                        className="fixed md:absolute top-20 md:top-full left-4 md:left-auto right-4 md:-right-4 mt-2 md:mt-3 w-auto md:w-80 max-h-[calc(100vh-120px)] md:max-h-[480px] z-[150] bg-cream border border-om-border/50 shadow-2xl rounded-none flex flex-col animate-in zoom-in-95 duration-200 origin-top-right"
                    >
                        <div className="p-5 border-b border-om-border/30 bg-surface flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-charcoal font-serif">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-[9px] font-bold uppercase tracking-widest text-[#8B7355] hover:text-charcoal transition-colors underline underline-offset-4 decoration-[#8B7355]/30"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="p-12 text-center">
                                    <div className="w-6 h-6 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-16 text-center space-y-4">
                                    <Bell size={28} className="mx-auto text-charcoal/10" />
                                    <p className="text-[11px] text-[#6B5E4E] font-serif italic">All remains tranquil in your estate.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-om-border/20">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`p-5 hover:bg-charcoal/[0.02] transition-colors relative group/item ${!n.is_read ? 'bg-gold/[0.03]' : ''}`}
                                        >
                                            <div className="flex gap-4">
                                                <div className={`mt-1 flex-shrink-0 w-9 h-9 rounded-none flex items-center justify-center border border-om-border/30 ${!n.is_read ? 'bg-gold/10' : 'bg-surface'}`}>
                                                    {getIcon(n.type)}
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-[12px] font-serif leading-tight ${!n.is_read ? 'text-charcoal font-bold' : 'text-charcoal/70'}`}>{n.title}</p>
                                                        <span className="text-[8px] text-[#6B5E4E] uppercase tracking-widest whitespace-nowrap">{new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-sans line-clamp-2">{n.message}</p>
                                                    {n.link_url && (
                                                        <a
                                                            href={n.link_url}
                                                            onClick={(e) => {
                                                                if (!n.is_read) markAsRead(n.id);
                                                            }}
                                                            className="text-[9px] font-bold uppercase tracking-widest text-forest hover:text-charcoal block pt-2 transition-colors"
                                                        >
                                                            View Statement
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="absolute right-3 top-10 opacity-0 group-hover/item:opacity-100 transition-opacity flex gap-1.5 focus-within:opacity-100">
                                                {!n.is_read && (
                                                    <button
                                                        onClick={() => markAsRead(n.id)}
                                                        className="p-1.5 bg-cream border border-om-border/50 rounded-none text-forest hover:bg-forest hover:text-cream transition-all shadow-sm"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={11} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(n.id)}
                                                    className="p-1.5 bg-cream border border-om-border/50 rounded-none text-red-900 hover:bg-red-900 hover:text-cream transition-all shadow-sm"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-om-border/30 bg-surface/50 text-center">
                            <span className="text-[8px] text-[#6B5E4E] font-bold uppercase tracking-[0.25em]">
                                Estate Activity Journal
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
