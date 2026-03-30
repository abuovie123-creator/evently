"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "./ui/Card";

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

export function FAQ() {
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchFaqs = async () => {
            const { data, error } = await supabase
                .from('faqs')
                .select('*')
                .eq('is_published', true)
                .order('order_index', { ascending: true });

            if (!error && data) {
                setFaqs(data);
            }
            setIsLoading(false);
        };
        fetchFaqs();
    }, [supabase]);

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto py-24 px-6 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-foreground/5 rounded-3xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (faqs.length === 0) return null;

    return (
        <section className="max-w-3xl mx-auto py-32 px-6">
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest shadow-xl">
                    <Sparkles size={12} />
                    Got Questions?
                </div>
                <h2 className="text-4xl font-black tracking-tight">Frequently Asked Questions</h2>
                <p className="text-muted-foreground font-light">Everything you need to know about the platform.</p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, i) => (
                    <Card
                        key={faq.id}
                        className={`p-0 overflow-hidden border-foreground/5 transition-all duration-500 ${openIndex === i ? 'border-blue-500/30 ring-1 ring-blue-500/10' : 'hover:border-foreground/10'}`}
                        hover={false}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            className="w-full p-8 text-left flex items-center justify-between group"
                        >
                            <span className={`text-lg font-bold transition-colors ${openIndex === i ? 'text-blue-500' : 'text-foreground group-hover:text-blue-400'}`}>
                                {faq.question}
                            </span>
                            <ChevronDown
                                size={20}
                                className={`text-muted-foreground transition-transform duration-500 ${openIndex === i ? 'rotate-180 text-blue-500' : ''}`}
                            />
                        </button>
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === i ? 'max-h-96 opacity-100 p-8 pt-0' : 'max-h-0 opacity-0'}`}>
                            <p className="text-muted-foreground leading-relaxed border-t border-foreground/5 pt-6 font-light">
                                {faq.answer}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
