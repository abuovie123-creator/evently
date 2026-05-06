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
            <Card className="p-10 md:p-20 text-center space-y-8 animate-in zoom-in-95 duration-700 rounded-none bg-surface border border-om-border/30 shadow-none">
                <div className="w-20 h-20 bg-charcoal/5 flex items-center justify-center mx-auto mb-8 border border-om-border/20 rounded-none">
                    <CheckCircle2 size={32} className="text-charcoal" />
                </div>
                <div className="space-y-4">
                    <h3 className="text-3xl md:text-5xl font-serif italic text-charcoal leading-tight">Inquiry Received.</h3>
                    <p className="text-[11px] text-[#6B5E4E] max-w-sm mx-auto leading-relaxed font-sans uppercase tracking-[0.2em] opacity-60">
                        Our specialized concierge team has been notified and will contact you directly within your secure portal.
                    </p>
                </div>
                <Button variant="outline" onClick={() => setIsSuccess(false)} className="w-full md:w-auto rounded-none px-12 h-14 border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-all duration-500 uppercase tracking-[0.3em] text-[9px] font-bold">
                    Submit Another Inquiry
                </Button>
            </Card>
        );
    }

    return (
        <Card className="p-8 md:p-16 space-y-12 rounded-none bg-surface border border-om-border/30 shadow-none" hover={false}>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 border-b border-om-border/20 pb-10">
                <div className="w-16 h-16 bg-cream flex items-center justify-center border border-om-border/40 text-charcoal shrink-0">
                    <LifeBuoy size={28} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-3xl md:text-4xl font-serif italic text-charcoal leading-tight">Concierge Assistance</h3>
                    <p className="text-[10px] md:text-[11px] font-sans text-[#6B5E4E] uppercase tracking-[0.25em] opacity-60">Direct dispatch to our private estate management team.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8B7355] ml-1">Subject of Inquiry</label>
                        <Input
                            required
                            placeholder="What can we help you with?"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="h-16 rounded-none bg-transparent border-om-border/40 focus:border-charcoal focus:ring-0 text-charcoal placeholder:text-muted-foreground/30 transition-all font-serif text-[18px]"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8B7355] ml-1">Urgency Preference</label>
                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                            {['low', 'medium', 'high'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={`h-12 text-[10px] font-bold uppercase tracking-[0.25em] transition-all border ${priority === p
                                        ? 'bg-charcoal text-cream border-charcoal'
                                        : 'bg-transparent border-om-border/30 text-[#6B5E4E]/60 hover:border-gold'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8B7355] ml-1">Brief Description</label>
                        <textarea
                            required
                            placeholder="Provide details to assist our specialists..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={8}
                            className="w-full rounded-none bg-transparent border border-om-border/40 focus:border-charcoal outline-none p-6 text-[18px] font-serif resize-none transition-all placeholder:text-muted-foreground/30 leading-relaxed"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-16 bg-charcoal hover:bg-black text-cream font-bold uppercase tracking-[0.3em] text-[10px] rounded-none transition-all border border-charcoal shadow-none"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-cream/20 border-t-cream rounded-full animate-spin" />
                        ) : (
                            "Dispatch Inquiry"
                        )}
                    </Button>
                </div>

                <div className="p-8 bg-charcoal/[0.02] border border-om-border/20 rounded-none flex items-start gap-6">
                    <AlertCircle size={14} className="text-gold flex-shrink-0 mt-1" />
                    <p className="text-[10px] text-[#6B5E4E] leading-relaxed font-sans uppercase tracking-widest opacity-60">
                        Priority access protocols ensure response within 24 hours. For technical emergencies, please mark as "High" priority.
                    </p>
                </div>
            </form>
        </Card>
    );
}
