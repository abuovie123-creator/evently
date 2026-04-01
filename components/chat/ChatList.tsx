"use client";

import React, { useEffect, useState } from "react";
import { Search, MessageSquare, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Conversation } from "@/lib/hooks/useChat";

interface ChatListProps {
    currentUserId: string;
    onSelectConversation: (conversation: Conversation) => void;
    activeId?: string;
}

export function ChatList({ currentUserId, onSelectConversation, activeId }: ChatListProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();

    useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            // Fetch conversations where user is client or planner
            // and join with the OTHER party's profile
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
                        other_party_name: otherParty.full_name || otherParty.username,
                        other_party_avatar: otherParty.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParty.username}`,
                        other_party_role: otherParty.role,
                        other_party_last_seen: otherParty.last_seen_at
                    };
                });
                setConversations(formatted);
            }
            setLoading(false);
        };

        fetchConversations();

        // Subscribe to conversation updates (for last message preview)
        const subscription = supabase
            .channel('conversation_updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'conversations' },
                (payload) => {
                    if (payload.eventType === 'UPDATE') {
                        setConversations(prev => {
                            const updated = prev.map(conv => {
                                if (conv.id === payload.new.id) {
                                    return {
                                        ...conv,
                                        last_message: payload.new.last_message,
                                        last_message_at: payload.new.last_message_at
                                    };
                                }
                                return conv;
                            });
                            // Re-sort by last_message_at
                            return [...updated].sort((a, b) =>
                                new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
                            );
                        });
                    } else if (payload.eventType === 'INSERT') {
                        // For INSERT, we might need to fetch the full row to get the profile join
                        // but a quick re-fetch is acceptable for new chats as they are rare
                        fetchConversations();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [currentUserId, supabase]);

    const filtered = conversations.filter(c =>
        c.other_party_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-background/50 dark:bg-black/40 backdrop-blur-xl border-r border-foreground/5 w-full md:w-80">
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black tracking-tight text-foreground">Messages</h2>
                    <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {conversations.length}
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl pl-9 pr-4 py-2 text-xs text-foreground focus:outline-none focus:border-blue-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {loading ? (
                    <div className="p-6 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3 animate-pulse">
                                <div className="w-12 h-12 bg-foreground/5 rounded-full" />
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-3 bg-foreground/5 rounded w-3/4" />
                                    <div className="h-2 bg-foreground/5 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                        <MessageSquare className="mx-auto text-muted-foreground/30" size={32} />
                        <p className="text-xs text-muted-foreground font-medium">No messages yet</p>
                    </div>
                ) : (
                    <div className="px-2 space-y-1">
                        {filtered.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => onSelectConversation(conv)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group ${activeId === conv.id
                                    ? "bg-blue-600/10 border border-blue-600/20"
                                    : "hover:bg-foreground/5 border border-transparent"
                                    }`}
                            >
                                <div className="relative shrink-0">
                                    <img src={conv.other_party_avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
                                    {conv.other_party_last_seen && (new Date().getTime() - new Date(conv.other_party_last_seen).getTime() < 60000) && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h4 className="text-sm font-bold text-foreground truncate">{conv.other_party_name}</h4>
                                        {conv.last_message_at && (
                                            <span className="text-[9px] text-gray-500 shrink-0 mt-0.5 font-medium">
                                                {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate font-light">
                                        {conv.last_message || `Start a conversation...`}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
