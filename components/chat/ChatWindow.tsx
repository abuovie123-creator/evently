"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, MoreVertical, Phone, Video, X, Check, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useChat, Message } from "@/lib/hooks/useChat";

interface ChatWindowProps {
    conversationId: string;
    currentUserId: string;
    recipientName: string;
    recipientAvatar: string;
    recipientRole: string;
    recipientLastSeen?: string;
    onClose?: () => void;
}

export function ChatWindow({
    conversationId,
    currentUserId,
    recipientName,
    recipientAvatar,
    recipientRole,
    recipientLastSeen,
    onClose
}: ChatWindowProps) {
    const { messages, sendMessage, broadcastTyping, otherPartyTyping, loading } = useChat(conversationId);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, otherPartyTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const content = input;
        setInput("");
        broadcastTyping(false);
        await sendMessage(content, currentUserId);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        broadcastTyping(e.target.value.length > 0);
    };

    const isOnline = recipientLastSeen && (new Date().getTime() - new Date(recipientLastSeen).getTime() < 60000); // Online if seen in last 1 min

    return (
        <Card className="flex flex-col h-[600px] w-full max-w-md bg-black/90 backdrop-blur-2xl border-white/10 shadow-2xl rounded-[2rem] overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img src={recipientAvatar} className="w-10 h-10 rounded-full object-cover" alt={recipientName} />
                        {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white leading-none">{recipientName}</h3>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">
                            {isOnline ? "Online" : "Away"} • {recipientRole}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white"><Phone size={16} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white"><Video size={16} /></Button>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-400 hover:text-white"><X size={16} /></Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide" ref={scrollRef}>
                {loading && (
                    <div className="flex justify-center py-4">
                        <Loader2 className="animate-spin text-blue-500" />
                    </div>
                )}

                {messages.map((msg, i) => {
                    const isMe = msg.sender_id === currentUserId;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMe
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : "bg-white/10 text-gray-200 rounded-tl-none border border-white/5"
                                }`}>
                                <p>{msg.content}</p>
                                <div className={`flex items-center gap-1 mt-1 justify-end opacity-50 text-[9px]`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMe && <CheckCheck size={10} className="text-blue-300" />}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Typing Indicator UX */}
                {otherPartyTyping && (
                    <div className="flex items-end gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="relative group">
                            {/* Avatar "holding phone" peek */}
                            <img
                                src={recipientAvatar}
                                className="w-6 h-6 rounded-full object-cover border border-white/20 translate-y-1"
                                alt="typing avatar"
                            />
                            <div className="absolute -top-1 -right-1">
                                <Phone size={8} className="text-blue-400 animate-bounce" />
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-2 px-3 rounded-2xl rounded-bl-none flex gap-1 items-center">
                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-white/[0.01]">
                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                        value={input}
                        onChange={handleInputChange}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                        disabled={!input.trim()}
                    >
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
