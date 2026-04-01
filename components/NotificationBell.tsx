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
                className="relative p-2 rounded-full hover:bg-foreground/5 transition-all group"
                aria-label="Notifications"
            >
                <Bell size={20} className={`transition-colors ${unreadCount > 0 ? 'text-blue-500' : 'text-foreground/70 group-hover:text-foreground'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-lg shadow-blue-600/20 animate-pulse border-2 border-background">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Popover */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div
                        className="fixed md:absolute top-20 md:top-full left-4 md:left-auto right-4 md:right-0 mt-2 md:mt-3 w-auto md:w-80 max-h-[calc(100vh-120px)] md:max-h-[480px] z-50 glass-panel !bg-background dark:!bg-slate-900 border-foreground/10 shadow-2xl rounded-[2rem] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 origin-top-right"
                    >
                        <div className="p-4 border-b border-foreground/5 bg-foreground/[0.02] flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="p-8 text-center">
                                    <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-12 text-center space-y-3">
                                    <Bell size={32} className="mx-auto text-foreground/10" />
                                    <p className="text-xs text-muted-foreground font-medium">All caught up!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-foreground/5">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`p-4 hover:bg-foreground/[0.02] transition-colors relative group/item ${!n.is_read ? 'bg-blue-500/[0.02]' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border border-foreground/5 ${!n.is_read ? 'bg-blue-500/10' : 'bg-foreground/5'}`}>
                                                    {getIcon(n.type)}
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-xs font-bold truncate ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                                                        <span className="text-[9px] text-muted-foreground whitespace-nowrap">{new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{n.message}</p>
                                                    {n.link_url && (
                                                        <a
                                                            href={n.link_url}
                                                            onClick={(e) => {
                                                                if (!n.is_read) markAsRead(n.id);
                                                            }}
                                                            className="text-[10px] font-bold text-blue-500 hover:underline block pt-1"
                                                        >
                                                            View Details
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="absolute right-2 top-10 opacity-0 group-hover/item:opacity-100 transition-opacity flex gap-1">
                                                {!n.is_read && (
                                                    <button
                                                        onClick={() => markAsRead(n.id)}
                                                        className="p-1.5 bg-background border border-foreground/10 rounded-lg text-green-500 hover:bg-green-500/10 transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={12} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(n.id)}
                                                    className="p-1.5 bg-background border border-foreground/10 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-t border-foreground/5 bg-foreground/[0.01] text-center">
                            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                                Showing recent activity
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
