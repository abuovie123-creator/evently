"use client";

import React, { useState } from "react";
import { Send, LifeBuoy, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "./ui/Toast";

export function SupportTicketForm() {
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { showToast } = useToast();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
            showToast("You must be logged in to submit a ticket", "error");
            setIsSubmitting(false);
            return;
        }

        const { error } = await supabase
            .from('support_tickets')
            .insert({
                user_id: session.user.id,
                subject,
                description,
                priority,
                status: 'open'
            });

        if (error) {
            console.error("Error submitting ticket:", error);
            showToast("Failed to submit ticket. Please try again.", "error");
        } else {
            setIsSuccess(true);
            showToast("Support ticket submitted successfully", "success");
            setSubject("");
            setDescription("");
        }
        setIsSubmitting(false);
    };

    if (isSuccess) {
        return (
            <Card className="p-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                    <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight">Ticket Received!</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Our support team has been notified and will get back to you as soon as possible.
                    </p>
                </div>
                <Button variant="outline" onClick={() => setIsSuccess(false)} className="rounded-2xl px-8">
                    Submit Another Ticket
                </Button>
            </Card>
        );
    }

    return (
        <Card className="p-8 space-y-8" hover={false}>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20">
                    <LifeBuoy size={24} className="text-blue-600" />
                </div>
                <div>
                    <h3 className="text-xl font-black tracking-tight">Need Help?</h3>
                    <p className="text-xs text-muted-foreground">Submit a support ticket and we'll help you out.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Subject</label>
                    <Input
                        required
                        placeholder="What can we help you with?"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="h-12 rounded-2xl bg-foreground/[0.02] border-foreground/5 focus:border-blue-500/50"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Priority</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['low', 'medium', 'high'].map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPriority(p)}
                                className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${priority === p
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                                        : 'bg-foreground/[0.02] border-foreground/5 text-muted-foreground hover:border-foreground/10'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                    <textarea
                        required
                        placeholder="Provide as much detail as possible..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        className="w-full rounded-[2rem] bg-foreground/[0.02] border border-foreground/5 focus:border-blue-500/50 outline-none p-6 text-sm resize-none transition-all"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-blue-600/20"
                >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <span className="flex items-center gap-2">
                            <Send size={16} />
                            Send Ticket
                        </span>
                    )}
                </Button>

                <div className="p-4 bg-amber-500/[0.05] border border-amber-500/10 rounded-2xl flex gap-3">
                    <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
                    <p className="text-[10px] text-amber-600/80 leading-relaxed font-medium">
                        Standard support response time is 24-48 hours. For urgent billing issues, please select "High" priority.
                    </p>
                </div>
            </form>
        </Card>
    );
}
