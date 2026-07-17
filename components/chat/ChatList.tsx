"use client";

import React, { useEffect, useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Conversation } from "@/lib/hooks/useChat";

interface ChatListProps {
    currentUserId: string;
    onSelectConversation: (conversation: Conversation) => void;
    activeId?: string;
}

function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'long' }).toUpperCase();
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase();
}

export function ChatList({ currentUserId, onSelectConversation, activeId }: ChatListProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();

    useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    *,
                    client:profiles!conversations_client_id_fkey (id, full_name, username, avatar_url, role, last_seen_at),
                    planner:profiles!conversations_planner_id_fkey (id, full_name, username, avatar_url, role, last_seen_at)
                `)
                .or(`client_id.eq.${currentUserId},planner_id.eq.${currentUserId}`)
                .order('last_message_at', { ascending: false });

            if (!error && data) {
                const formatted = data.map((conv: any) => {
                    const isClient = conv.client_id === currentUserId;
                    const otherParty = isClient ? conv.planner : conv.client;
                    return {
                        ...conv,
                        other_party_name: otherParty?.full_name || otherParty?.username || 'Unknown',
                        other_party_avatar: otherParty?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParty?.username}`,
                        other_party_role: otherParty?.role,
                        other_party_last_seen: otherParty?.last_seen_at
                    };
                });
                setConversations(formatted);
            }
            setLoading(false);
        };

        fetchConversations();

        const subscription = supabase
            .channel('conversation_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, (payload) => {
                if (payload.eventType === 'UPDATE') {
                    setConversations(prev => {
                        const updated = prev.map(conv =>
                            conv.id === payload.new.id
                                ? { ...conv, last_message: payload.new.last_message, last_message_at: payload.new.last_message_at }
                                : conv
                        );
                        return [...updated].sort((a, b) =>
                            new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
                        );
                    });
                } else if (payload.eventType === 'INSERT') {
                    fetchConversations();
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(subscription); };
    }, [currentUserId, supabase]);

    const filtered = conversations.filter(c =>
        c.other_party_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full w-full md:w-80 shrink-0"
            style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>

            {/* Search */}
            <div className="p-5" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <div className="relative">
                    <Search
                        size={13}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--muted-foreground)' }}
                    />
                    <input
                        type="text"
                        placeholder="SEARCH"
                        className="w-full pl-9 pr-4 py-2.5 text-[10px] font-medium tracking-[0.18em] focus:outline-none transition-all"
                        style={{
                            background: 'var(--background)',
                            border: '1px solid var(--border)',
                            color: 'var(--foreground)',
                            letterSpacing: '0.18em',
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-5 space-y-5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3 animate-pulse">
                                <div className="w-11 h-11 rounded-full shrink-0" style={{ background: 'var(--muted)' }} />
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-3 rounded w-3/4" style={{ background: 'var(--muted)' }} />
                                    <div className="h-2 rounded w-1/2" style={{ background: 'var(--muted)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                        <MessageSquare size={28} style={{ color: 'var(--border)', margin: '0 auto' }} />
                        <p className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--muted-foreground)' }}>
                            No conversations yet
                        </p>
                    </div>
                ) : (
                    filtered.map((conv) => {
                        const isActive = activeId === conv.id;
                        const isOnline = conv.other_party_last_seen &&
                            (new Date().getTime() - new Date(conv.other_party_last_seen).getTime() < 60000);

                        return (
                            <button
                                key={conv.id}
                                onClick={() => onSelectConversation(conv)}
                                className="w-full flex items-center gap-3 px-5 py-4 text-left transition-all duration-150 relative"
                                style={{
                                    background: isActive ? 'var(--background)' : 'transparent',
                                    borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                                    borderBottom: '1px solid var(--border-light)',
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--background)';
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                }}
                            >
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <img
                                        src={conv.other_party_avatar}
                                        className="w-11 h-11 rounded-full object-cover"
                                        style={{ border: '1px solid var(--border)' }}
                                        alt=""
                                    />
                                    {isOnline && (
                                        <div
                                            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
                                            style={{ background: '#5C7A5C', border: '2px solid var(--surface)' }}
                                        />
                                    )}
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h4
                                            className="text-sm font-semibold truncate font-serif italic"
                                            style={{ color: 'var(--charcoal)' }}
                                        >
                                            {conv.other_party_name}
                                        </h4>
                                        {conv.last_message_at && (
                                            <span className="text-[9px] shrink-0 ml-2 mt-0.5 tracking-wider font-medium"
                                                style={{ color: 'var(--muted-foreground)' }}>
                                                {formatTime(conv.last_message_at)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] truncate" style={{ color: 'var(--muted-foreground)' }}>
                                        {conv.last_message || 'Begin your correspondence...'}
                                    </p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
