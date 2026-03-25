"use client";

import React, { useState, useEffect } from "react";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Conversation } from "@/lib/hooks/useChat";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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
        <div className="flex flex-col md:flex-row h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] glass-panel border-white/5 overflow-hidden rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sidebar List */}
            <div className={`md:block ${selectedConv ? 'hidden' : 'block'} border-r border-white/5`}>
                <ChatList
                    currentUserId={currentUserId}
                    onSelectConversation={(conv) => setSelectedConv(conv)}
                    activeId={selectedConv?.id}
                />
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-black/20 ${selectedConv ? 'block' : 'hidden md:flex'}`}>
                {selectedConv ? (
                    <div className="h-full flex items-center justify-center md:p-4">
                        <ChatWindow
                            conversationId={selectedConv.id}
                            currentUserId={currentUserId}
                            recipientName={(selectedConv as any).other_party_name}
                            recipientAvatar={(selectedConv as any).other_party_avatar}
                            recipientRole={(selectedConv as any).other_party_role}
                            recipientLastSeen={(selectedConv as any).other_party_last_seen}
                            onClose={() => setSelectedConv(null)}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center p-12">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-700">
                            <MessageSquare size={32} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-white">Your Messages</h2>
                            <p className="text-sm text-gray-500 max-w-xs">Select a conversation from the list to start chatting with your planner or client.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
