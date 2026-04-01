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

        const messageId = crypto.randomUUID();
        const newMessage: Message = {
            id: messageId,
            conversation_id: conversationId,
            sender_id: senderId,
            content: content.trim(),
            created_at: new Date().toISOString(),
            is_read: false
        };

        // Optimistic Update
        setMessages((prev) => [...prev, newMessage]);

        // 1. Insert the message (sending the same ID to avoid duplicates in realtime)
        const { error: messageError } = await supabase
            .from('messages')
            .insert({
                id: messageId,
                conversation_id: conversationId,
                sender_id: senderId,
                content: content.trim()
            });

        if (messageError) {
            console.error("Supabase Message Insert Error:", messageError);
            // Revert optimistic update
            setMessages((prev) => prev.filter(m => m.id !== newMessage.id));
            return;
        }
    };

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTypingStateRef = useRef<boolean>(false);

    const broadcastTyping = (typing: boolean) => {
        if (!channelRef.current) return;

        // Only broadcast if the state actually changed OR it's a "still typing" signal
        if (typing === lastTypingStateRef.current && typing === false) return;

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        if (typing !== lastTypingStateRef.current) {
            lastTypingStateRef.current = typing;
            channelRef.current.send({
                type: 'broadcast',
                event: 'typing',
                payload: { typing }
            });
        }

        // If typing, set a timeout to reset it
        if (typing) {
            typingTimeoutRef.current = setTimeout(() => {
                lastTypingStateRef.current = false;
                channelRef.current?.send({
                    type: 'broadcast',
                    event: 'typing',
                    payload: { typing: false }
                });
            }, 3000);
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
                    const newMessage = payload.new as Message;
                    setMessages((prev) => {
                        if (prev.some(m => m.id === newMessage.id)) return prev;
                        // Sort by created_at to ensure order
                        const updated = [...prev, newMessage].sort((a, b) =>
                            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                        );
                        return updated;
                    });
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
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
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

