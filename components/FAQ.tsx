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
        <section className="max-w-4xl mx-auto py-24 md:py-32 px-6">
            <div className="text-center mb-12 md:mb-16 space-y-4">
                <span className="section-label">Assistance</span>
                <h2 className="text-3xl md:text-5xl font-serif text-[#1C1A16] leading-tight">Frequently Asked Questions</h2>
                <p className="text-base md:text-lg text-[#6B5E4E] font-light leading-relaxed">Refining the details of your heritage journey.</p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, i) => (
                    <Card
                        key={faq.id}
                        className={`p-0 overflow-hidden border-[#D4C5A9]/30 transition-all duration-500 bg-white ${openIndex === i ? 'ring-1 ring-[#C4A55A]/20' : 'hover:border-[#D4C5A9]/60'}`}
                        hover={false}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            className="w-full p-6 md:p-8 text-left flex items-center justify-between group"
                        >
                            <span className={`text-base md:text-xl font-serif transition-colors ${openIndex === i ? 'text-[#8B7355]' : 'text-[#1C1A16] group-hover:text-[#8B7355]'}`}>
                                {faq.question}
                            </span>
                            <ChevronDown
                                size={20}
                                className={`text-[#8B7355] transition-transform duration-500 ${openIndex === i ? 'rotate-180' : ''}`}
                            />
                        </button>
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === i ? 'max-h-96 opacity-100 px-6 md:px-8 pb-6 md:pb-8' : 'max-h-0 opacity-0'}`}>
                            <p className="text-[#6B5E4E] text-sm md:text-base leading-relaxed border-t border-[#D4C5A9]/20 pt-6 font-light italic">
                                {faq.answer}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
