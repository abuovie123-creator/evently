import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
}

export interface Conversation {
    id: string;
    client_id: string;
    planner_id: string;
    last_message: string;
    last_message_at: string;
    other_party_name?: string;
    other_party_avatar?: string;
    other_party_role?: string;
    other_party_last_seen?: string;
}

export function useChat(conversationId: string | null) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [otherPartyTyping, setOtherPartyTyping] = useState(false);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const supabase = createClient();

    const fetchMessages = useCallback(async () => {
        if (!conversationId) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (!error && data) {
            setMessages(data);
        }
        setLoading(false);
    }, [conversationId, supabase]);

    const sendMessage = async (content: string, senderId: string) => {
        if (!conversationId || !content.trim()) return;

        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                content: content.trim()
            });

        if (error) {
            console.error("Error sending message:", error);
        }
    };

    const broadcastTyping = (typing: boolean) => {
        if (channelRef.current) {
            channelRef.current.send({
                type: 'broadcast',
                event: 'typing',
                payload: { typing }
            });
        }
    };

    useEffect(() => {
        if (!conversationId) return;

        fetchMessages();

        // Subscribe to New Messages
        const messageSubscription = supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as Message]);
                }
            )
            .subscribe();

        // Presence & Broadcast for Typing
        const typingChannel = supabase.channel(`typing:${conversationId}`);

        typingChannel
            .on('broadcast', { event: 'typing' }, (payload) => {
                setOtherPartyTyping(payload.payload.typing);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    channelRef.current = typingChannel;
                }
            });

        return () => {
            supabase.removeChannel(messageSubscription);
            supabase.removeChannel(typingChannel);
            channelRef.current = null;
        };
    }, [conversationId, fetchMessages, supabase]);

    return {
        messages,
        loading,
        sendMessage,
        broadcastTyping,
        otherPartyTyping,
        setMessages
    };
}
