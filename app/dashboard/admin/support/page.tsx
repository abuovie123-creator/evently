"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    LifeBuoy,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    AlertTriangle,
    MessageCircle,
    ChevronRight,
    User,
    ArrowLeft
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

interface SupportTicket {
    id: string;
    user_id: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    profiles: {
        full_name: string;
        email?: string;
        role: string;
    };
}

export default function SupportDashboard() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [reply, setReply] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();
    const supabase = createClient();

    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        const query = supabase
            .from('support_tickets')
            .select('*, profiles:user_id(full_name, role)')
            .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
            query.eq('status', statusFilter);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching tickets:", error);
            showToast("Failed to fetch tickets", "error");
        } else {
            setTickets(data || []);
        }
        setIsLoading(false);
    }, [supabase, statusFilter, showToast]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const updateTicketStatus = async (id: string, status: string) => {
        const { error } = await supabase
            .from('support_tickets')
            .update({ status })
            .eq('id', id);

        if (error) {
            showToast("Failed to update status", "error");
        } else {
            showToast(`Ticket ${status} successfully`, "success");
            fetchTickets();
            if (selectedTicket?.id === id) {
                setSelectedTicket(prev => prev ? { ...prev, status } : null);
            }
        }
    };

    const handleReply = async () => {
        if (!selectedTicket || !reply.trim()) return;
        setIsSubmitting(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        const { error: msgError } = await supabase
            .from('ticket_messages')
            .insert({
                ticket_id: selectedTicket.id,
                sender_id: session.user.id,
                content: reply
            });

        if (msgError) {
            showToast("Failed to send reply", "error");
        } else {
            // Also notify the user
            await supabase.from('notifications').insert({
                user_id: selectedTicket.user_id,
                type: 'platform_update',
                title: 'New Reply to Support Ticket',
                message: `An admin has replied to your ticket: "${selectedTicket.subject}"`,
                link_url: '/dashboard/settings' // Or specific ticket view if implemented
            });

            showToast("Reply sent successfully", "success");
            setReply("");
            // In a real app we'd fetch messages here
        }
        setIsSubmitting(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'in_progress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'resolved': return 'bg-green-500/10 text-green-500 border-green-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-500 font-black';
            case 'medium': return 'text-amber-500 font-bold';
            default: return 'text-blue-500 font-medium';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
                        <LifeBuoy className="text-blue-500" />
                        Support Center
                    </h1>
                    <p className="text-muted-foreground text-sm">Manage user inquiries and platform support requests.</p>
                </div>
                <div className="flex gap-3">
                    {['all', 'open', 'in_progress', 'resolved'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${statusFilter === s
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                                    : 'bg-foreground/5 border-foreground/5 text-muted-foreground hover:bg-foreground/10'
                                }`}
                        >
                            {s.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Ticket List */}
                <Card className={`lg:col-span-1 p-0 overflow-hidden ${selectedTicket ? 'hidden lg:block' : ''}`} hover={false}>
                    <div className="p-4 border-b border-foreground/5 bg-foreground/[0.01] flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recent Tickets</span>
                        <span className="bg-foreground/5 px-2 py-0.5 rounded text-[10px] font-bold">{tickets.length}</span>
                    </div>
                    <div className="max-h-[700px] overflow-y-auto custom-scrollbar divide-y divide-foreground/5">
                        {isLoading ? (
                            <div className="p-12 text-center">
                                <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="p-12 text-center space-y-4">
                                <CheckCircle2 size={40} className="mx-auto text-muted-foreground/10" />
                                <p className="text-sm text-muted-foreground font-medium">No tickets found!</p>
                            </div>
                        ) : tickets.map((ticket) => (
                            <button
                                key={ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                                className={`w-full p-6 text-left hover:bg-foreground/[0.02] transition-all relative block ${selectedTicket?.id === ticket.id ? 'bg-blue-500/[0.03]' : ''}`}
                            >
                                {selectedTicket?.id === ticket.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                                )}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start gap-3">
                                        <h4 className="font-bold text-sm leading-tight text-foreground line-clamp-1">{ticket.subject}</h4>
                                        <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                            <User size={10} />
                                            {ticket.profiles.full_name}
                                        </span>
                                        <span className="text-muted-foreground flex items-center gap-1.5 font-medium italic">
                                            <Clock size={10} />
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Priority:</span>
                                        <span className={`text-[9px] uppercase tracking-widest ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Ticket Detail */}
                <Card className={`lg:col-span-2 p-0 overflow-hidden min-h-[600px] flex flex-col ${!selectedTicket ? 'hidden lg:flex items-center justify-center p-20 text-center bg-foreground/[0.01]' : ''}`} hover={false}>
                    {selectedTicket ? (
                        <>
                            {/* Header */}
                            <div className="p-8 border-b border-foreground/5 bg-foreground/[0.01] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedTicket(null)}
                                        className="lg:hidden text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 mb-4"
                                    >
                                        <ArrowLeft size={14} /> Back to list
                                    </button>
                                    <h3 className="text-2xl font-black tracking-tight">{selectedTicket.subject}</h3>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(selectedTicket.status)}`}>
                                            {selectedTicket.status}
                                        </span>
                                        <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 bg-foreground/5 rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                                            {selectedTicket.priority} Priority
                                        </span>
                                        <div className="h-4 w-px bg-foreground/10" />
                                        <span className="text-[10px] font-bold text-muted-foreground">ID: {selectedTicket.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {selectedTicket.status !== 'resolved' && (
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold"
                                            onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                                        >
                                            Mark Resolved
                                        </Button>
                                    )}
                                    {selectedTicket.status === 'open' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-xl font-bold"
                                            onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}
                                        >
                                            Mark In Progress
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Conversation / Content */}
                            <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-[500px] custom-scrollbar">
                                {/* Initial Inquiry */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500 font-bold uppercase">
                                            {selectedTicket.profiles.full_name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black">{selectedTicket.profiles.full_name}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold">{selectedTicket.profiles.role.toUpperCase()} • {new Date(selectedTicket.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="bg-foreground/[0.02] border border-foreground/5 p-6 rounded-[2rem] text-sm text-muted-foreground leading-relaxed">
                                        {selectedTicket.description}
                                    </div>
                                </div>

                                {/* Placeholder for message thread */}
                                <div className="relative py-4">
                                    <div className="absolute inset-x-0 top-1/2 h-px bg-foreground/5" />
                                    <span className="relative z-10 mx-auto w-fit bg-background px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 block">Discussion started</span>
                                </div>
                            </div>

                            {/* Reply Box */}
                            <div className="p-8 border-t border-foreground/5 bg-foreground/[0.01]">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <textarea
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                            placeholder="Write your response here..."
                                            rows={4}
                                            className="w-full rounded-[2rem] bg-foreground/5 border border-foreground/10 focus:border-blue-500/50 outline-none p-6 text-sm resize-none transition-all pr-12"
                                        />
                                        <div className="absolute right-6 bottom-6 flex items-center gap-4 text-muted-foreground opacity-50">
                                            <span className="text-[9px] font-bold">Markdown supported</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] text-muted-foreground italic font-medium">Replying as Admin • Notifications will be sent automatically</p>
                                        <Button
                                            onClick={handleReply}
                                            disabled={!reply.trim() || isSubmitting}
                                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 font-black uppercase tracking-widest text-[11px] h-12 shadow-lg shadow-blue-600/20"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <MessageCircle size={14} />
                                                    Send Reply
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6 max-w-sm">
                            <div className="w-24 h-24 bg-blue-500/5 rounded-full flex items-center justify-center mx-auto border border-blue-500/10">
                                <LifeBuoy size={48} className="text-blue-500/20" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold">No Ticket Selected</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Choose a ticket from the left sidebar to view details, update status, and communicate with the user.
                                </p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
