"use client";

import React, { useState, useEffect } from "react";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Conversation } from "@/lib/hooks/useChat";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const convId = searchParams.get('id');
    const supabase = createClient();

    useEffect(() => {
        const getUserId = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setCurrentUserId(session?.user?.id || null);
        };
        getUserId();
    }, [supabase]);

    if (!currentUserId) return null;

    return (
        <div
            className="flex mt-6 md:mt-0 h-[calc(100dvh-12.5rem)] md:h-[calc(100vh-7rem)] overflow-hidden rounded-2xl"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
        >
            {/* ── Conversation List ─────────────────────────────── */}
            {/* On mobile: show list when no conv selected. On desktop: always show */}
            <div
                className={`
                    flex-col h-full border-r
                    ${selectedConv ? 'hidden md:flex' : 'flex w-full md:w-80'}
                    md:w-80 shrink-0
                `}
                style={{ borderColor: 'var(--border)' }}
            >
                <ChatList
                    currentUserId={currentUserId}
                    onSelectConversation={(conv) => setSelectedConv(conv)}
                    activeId={selectedConv?.id || convId || undefined}
                />
            </div>

            {/* ── Chat Window ───────────────────────────────────── */}
            <div
                className={`
                    flex-col h-full flex-1
                    ${selectedConv ? 'flex' : 'hidden md:flex'}
                `}
            >
                {selectedConv ? (
                    <ChatWindow
                        conversationId={selectedConv.id}
                        currentUserId={currentUserId}
                        recipientName={(selectedConv as any).other_party_name}
                        recipientAvatar={(selectedConv as any).other_party_avatar}
                        recipientRole={(selectedConv as any).other_party_role}
                        recipientLastSeen={(selectedConv as any).other_party_last_seen}
                        onClose={() => setSelectedConv(null)}
                    />
                ) : (
                    /* Empty state — desktop only */
                    <div
                        className="flex-1 flex flex-col items-center justify-center gap-5 text-center p-12"
                        style={{ background: 'var(--background)' }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-px w-12" style={{ background: 'var(--gold)' }} />
                            <MessageSquare size={20} style={{ color: 'var(--accent)' }} />
                            <div className="h-px w-12" style={{ background: 'var(--gold)' }} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-serif italic" style={{ color: 'var(--charcoal)' }}>
                                Your Correspondence
                            </h2>
                            <p className="text-[11px] tracking-widest uppercase max-w-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                                Select a conversation to begin your private exchange
                            </p>
                        </div>
                        <div className="h-px w-16 mx-auto" style={{ background: 'var(--border)' }} />
                    </div>
                )}
            </div>
        </div>
    );
}
