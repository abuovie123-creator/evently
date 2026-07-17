"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, MoreVertical, X, CheckCheck, Loader2, MessageSquare, Smile, ImageIcon, Plus, ArrowLeft } from "lucide-react";
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

/* ── Helpers ─────────────────────────────────────────────── */
function formatDateSeparator(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    }).toUpperCase();
}

function formatMsgTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function groupByDate(messages: Message[]) {
    const groups: { dateLabel: string; messages: Message[] }[] = [];
    for (const msg of messages) {
        const label = formatDateSeparator(msg.created_at);
        const last = groups[groups.length - 1];
        if (last && last.dateLabel === label) {
            last.messages.push(msg);
        } else {
            groups.push({ dateLabel: label, messages: [msg] });
        }
    }
    return groups;
}

function formatRole(role: string) {
    if (!role) return 'Member';
    if (role === 'planner') return 'Event Planner';
    if (role === 'client') return 'Event Client';
    return role.charAt(0).toUpperCase() + role.slice(1);
}

/* ── Simple emoji palette ────────────────────────────────── */
const EMOJIS = ['😊', '👍', '🎉', '❤️', '🙏', '✨', '👌', '😂', '🔥', '💯', '😍', '🥂'];

/* ── ChatWindow ──────────────────────────────────────────── */
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
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const isOnline = recipientLastSeen &&
        (new Date().getTime() - new Date(recipientLastSeen).getTime() < 60000);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, otherPartyTyping]);

    const grouped = groupByDate(messages);

    return (
        <div className="flex flex-col h-full w-full" style={{ background: 'var(--background)' }}>

            {/* ── Header ─────────────────────────────────────── */}
            <div
                className="flex items-center justify-between px-4 md:px-6 py-4 shrink-0"
                style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
            >
                <div className="flex items-center gap-3">
                    {/* Mobile back button */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="md:hidden w-8 h-8 flex items-center justify-center shrink-0 transition-colors rounded"
                            style={{ color: 'var(--muted-foreground)' }}
                            aria-label="Back to conversations"
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}

                    <div className="relative">
                        <img
                            src={recipientAvatar}
                            className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover"
                            style={{ border: '1px solid var(--border)' }}
                            alt={recipientName}
                        />
                        {isOnline && (
                            <div
                                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
                                style={{ background: '#5C7A5C', border: '2px solid var(--surface)' }}
                            />
                        )}
                    </div>

                    <div>
                        <h3 className="text-sm md:text-base font-serif italic leading-none" style={{ color: 'var(--charcoal)' }}>
                            {recipientName}
                        </h3>
                        <p className="text-[9px] font-bold tracking-[0.2em] uppercase mt-1" style={{ color: 'var(--muted-foreground)' }}>
                            {formatRole(recipientRole)}{isOnline ? ' · Online' : ''}
                        </p>
                    </div>
                </div>

                {/* More options */}
                <button
                    className="w-8 h-8 flex items-center justify-center rounded transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--charcoal)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'}
                    aria-label="More options"
                >
                    <MoreVertical size={18} />
                </button>
            </div>

            {/* ── Messages ───────────────────────────────────── */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-6"
                style={{ background: 'var(--background)' }}
            >
                {loading && (
                    <div className="flex justify-center py-8">
                        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent)' }} />
                    </div>
                )}

                {!loading && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-16 space-y-4">
                        <MessageSquare size={32} style={{ color: 'var(--border)' }} />
                        <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--muted-foreground)' }}>
                            Begin your correspondence
                        </p>
                    </div>
                )}

                {grouped.map(({ dateLabel, messages: dayMsgs }) => (
                    <div key={dateLabel} className="space-y-4">
                        {/* Date Separator */}
                        <div className="flex items-center gap-4 py-1">
                            <div className="flex-1 h-px" style={{ background: 'var(--border-light)' }} />
                            <span className="text-[9px] tracking-[0.22em] font-medium shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                                {dateLabel}
                            </span>
                            <div className="flex-1 h-px" style={{ background: 'var(--border-light)' }} />
                        </div>

                        {dayMsgs.map((msg) => (
                            <MessageBubble
                                key={msg.id}
                                msg={msg}
                                isMe={msg.sender_id === currentUserId}
                                avatar={recipientAvatar}
                            />
                        ))}
                    </div>
                ))}

                {/* Typing indicator */}
                {otherPartyTyping && (
                    <div className="flex items-end gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                        <img
                            src={recipientAvatar}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                            style={{ border: '1px solid var(--border)' }}
                            alt=""
                        />
                        <div
                            className="px-4 py-3 flex gap-1.5 items-center"
                            style={{ background: 'var(--secondary)', border: '1px solid var(--border-light)' }}
                        >
                            {['-0.3s', '-0.15s', '0s'].map((delay, i) => (
                                <span
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                                    style={{ background: 'var(--accent)', animationDelay: delay }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Input ──────────────────────────────────────── */}
            {/* Hidden file inputs — wired to the + and image buttons */}
            <input ref={fileInputRef} type="file" className="hidden" accept="*/*" />
            <input ref={imageInputRef} type="file" className="hidden" accept="image/*" />

            <ChatInput
                onSendMessage={(content) => sendMessage(content, currentUserId)}
                onTyping={broadcastTyping}
                onAttach={() => fileInputRef.current?.click()}
                onImage={() => imageInputRef.current?.click()}
            />
        </div>
    );
}

/* ── Message Bubble ─────────────────────────────────────── */
const MessageBubble = React.memo(({
    msg,
    isMe,
    avatar
}: {
    msg: Message;
    isMe: boolean;
    avatar: string;
}) => (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2 animate-in fade-in slide-in-from-bottom-1`}>
        {!isMe && (
            <img src={avatar} className="w-6 h-6 rounded-full object-cover shrink-0 mb-0.5" style={{ border: '1px solid var(--border)' }} alt="" />
        )}

        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%] md:max-w-[65%]`}>
            <div
                className="px-4 py-3 text-sm leading-relaxed"
                style={isMe
                    ? { background: 'var(--charcoal)', color: 'var(--cream)' }
                    : { background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--border-light)' }
                }
            >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
            </div>

            <div className={`flex items-center gap-1.5 mt-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="text-[9px] tracking-wider font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    {isMe && msg.is_read ? 'READ · ' : ''}{formatMsgTime(msg.created_at)}
                </span>
                {isMe && <CheckCheck size={10} style={{ color: msg.is_read ? 'var(--gold)' : 'var(--border)' }} />}
            </div>
        </div>

        {isMe && <div className="w-6 shrink-0" />}
    </div>
));
MessageBubble.displayName = "MessageBubble";

/* ── Chat Input ─────────────────────────────────────────── */
function ChatInput({
    onSendMessage,
    onTyping,
    onAttach,
    onImage,
}: {
    onSendMessage: (content: string) => void;
    onTyping: (typing: boolean) => void;
    onAttach: () => void;
    onImage: () => void;
}) {
    const [input, setInput] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input.trim());
        setInput("");
        onTyping(false);
        setShowEmoji(false);
    };

    const insertEmoji = (emoji: string) => {
        setInput(prev => prev + emoji);
        setShowEmoji(false);
    };

    return (
        <div className="shrink-0 relative" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>

            {/* Emoji palette */}
            {showEmoji && (
                <div
                    className="absolute bottom-full left-4 mb-2 p-3 grid grid-cols-6 gap-2 shadow-lg z-20 rounded"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                    {EMOJIS.map(e => (
                        <button
                            key={e}
                            onClick={() => insertEmoji(e)}
                            className="text-lg hover:scale-125 transition-transform"
                        >
                            {e}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2 px-3 md:px-4 py-3">
                {/* Attach file */}
                <button
                    onClick={onAttach}
                    className="w-8 h-8 flex items-center justify-center shrink-0 rounded-full transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--charcoal)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'}
                    title="Attach file"
                    aria-label="Attach file"
                >
                    <Plus size={18} />
                </button>

                {/* Text input */}
                <input
                    type="text"
                    placeholder="WRITE YOUR MESSAGE..."
                    className="flex-1 bg-transparent text-xs focus:outline-none min-w-0"
                    style={{ color: 'var(--foreground)', letterSpacing: '0.07em', caretColor: 'var(--accent)' }}
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        onTyping(e.target.value.length > 0);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />

                {/* Right icons */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {/* Emoji */}
                    <button
                        onClick={() => setShowEmoji(prev => !prev)}
                        className="w-7 h-7 flex items-center justify-center transition-colors rounded"
                        style={{ color: showEmoji ? 'var(--accent)' : 'var(--muted-foreground)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--charcoal)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = showEmoji ? 'var(--accent)' : 'var(--muted-foreground)'}
                        title="Emoji"
                        aria-label="Emoji"
                    >
                        <Smile size={17} />
                    </button>

                    {/* Image */}
                    <button
                        onClick={onImage}
                        className="w-7 h-7 flex items-center justify-center transition-colors rounded"
                        style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--charcoal)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)'}
                        title="Send image"
                        aria-label="Send image"
                    >
                        <ImageIcon size={16} />
                    </button>

                    {/* Send */}
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="flex items-center gap-1.5 px-4 h-8 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-200 disabled:opacity-40 rounded-sm"
                        style={{ background: 'var(--charcoal)', color: 'var(--cream)' }}
                        onMouseEnter={e => { if (input.trim()) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--charcoal)'; }}
                        aria-label="Send message"
                    >
                        Send <Send size={11} />
                    </button>
                </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-[8px] tracking-[0.25em] uppercase pb-2" style={{ color: 'var(--border)' }}>
                Encryption Active · Private Concierge Channel
            </p>
        </div>
    );
}
