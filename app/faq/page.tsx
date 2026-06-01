"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/Footer";

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category?: string;
}

export default function FAQPage() {
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



    return (
        <main className="min-h-screen bg-[#FAF8F3] text-[#1C1A16]">
            {/* Hero Section */}
            <section className="relative pt-48 pb-24 px-6 bg-[#1A2E1A] overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/linen.png')]" />
                </div>

                <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
                    <span className="section-label text-[#C4A55A]">FAQs</span>
                    <h1 className="text-5xl md:text-7xl font-serif italic text-[#FAF8F3] leading-tight animate-fade-up">
                        Frequently Asked <br /> Questions.
                    </h1>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6 py-24 space-y-12">
                {isLoading ? (
                    <div className="space-y-6">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-24 bg-[#1C1A16]/5 animate-pulse" />
                        ))}
                    </div>
                ) : faqs.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-[#D4C5A9]/40">
                        <p className="text-[#6B5E4E] italic font-light">No FAQs available yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {faqs.map((faq, i) => (
                            <Card
                                key={faq.id}
                                className={`p-0 overflow-hidden border-[#D4C5A9]/30 transition-all duration-700 bg-white ${openIndex === i ? 'ring-1 ring-[#C4A55A]/20 shadow-xl' : 'hover:border-[#C4A55A]'}`}
                                hover={false}
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                    className="w-full p-8 text-left flex items-center justify-between group"
                                >
                                    <span className={`text-xl font-serif transition-colors ${openIndex === i ? 'text-[#8B7355]' : 'text-[#1C1A16] group-hover:text-[#8B7355]'}`}>
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        size={20}
                                        className={`text-[#8B7355] transition-transform duration-500 ${openIndex === i ? 'rotate-180' : ''}`}
                                    />
                                </button>
                                <div className={`overflow-hidden transition-all duration-700 ease-in-out ${openIndex === i ? 'max-h-[500px] opacity-100 px-8 pb-8' : 'max-h-0 opacity-0'}`}>
                                    <p className="text-[#6B5E4E] text-base leading-relaxed border-t border-[#D4C5A9]/20 pt-8 font-light italic">
                                        {faq.answer}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Support CTA */}
                <div className="mt-32 p-12 border border-[#D4C5A9]/30 bg-[#F5F0E8] text-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <MessageSquare size={80} className="text-[#1A2E1A]" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-3xl font-serif text-[#1C1A16]">Need further assistance?</h3>
                        <p className="text-[#6B5E4E] font-light max-w-xl mx-auto italic">
                            Our dedicated support team is available to assist you with any bespoke requirements or technical inquiries.
                        </p>
                    </div>
                    <Link href="/contact" className="inline-block">
                        <Button variant="primary" size="lg" className="h-16 px-12">Contact Support</Button>
                    </Link>
                </div>
            </div>

            <Footer />
        </main>
    );
}
