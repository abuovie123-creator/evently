"use client";

import React, { useState } from "react";
import { Footer } from "@/components/Footer";
import { Plus, Minus } from "lucide-react";

const faqs = [
    {
        category: "Getting Started",
        items: [
            {
                q: "What is Evently Heritage?",
                a: "Evently Heritage is an exclusive platform connecting discerning clients with the world's finest event planners. We curate relationships built on trust, discretion, and an unwavering commitment to excellence.",
            },
            {
                q: "How do I create an account?",
                a: "You may register as a client or apply to join as a professional event planner. Simply navigate to our registration page and follow the guided onboarding process. Client accounts are approved instantly, while planner applications are reviewed within 3–5 business days.",
            },
            {
                q: "Is Evently Heritage available worldwide?",
                a: "Yes. Our network spans across North America, Europe, the Middle East, and Asia-Pacific. All transactions are conducted in USD with support for major international payment methods.",
            },
        ],
    },
    {
        category: "For Clients",
        items: [
            {
                q: "How do I find and hire a planner?",
                a: "Browse our curated roster of planners at evently.com/planners. Each profile reflects the planner's specialisation, portfolio, and availability. You may submit an enquiry directly through their profile.",
            },
            {
                q: "What is included in my client membership?",
                a: "Client membership grants access to our full roster of vetted planners, priority booking windows, concierge support, and secure in-platform messaging. Premium tiers unlock additional features such as dedicated account management.",
            },
            {
                q: "How are payments handled?",
                a: "All payments are processed securely through our platform. Funds are held in escrow until project milestones are met, ensuring your investment is protected at every stage.",
            },
        ],
    },
    {
        category: "For Planners",
        items: [
            {
                q: "How do I join as a planner?",
                a: "Complete our planner application at evently.com/auth/register-planner. Our curation team reviews each submission to ensure alignment with our standards of excellence. Approved planners receive a fully-featured profile and access to client enquiries.",
            },
            {
                q: "What are the platform fees?",
                a: "Evently Heritage charges a modest service fee on each completed booking. Detailed fee structures are outlined within our membership tiers on the Pricing page.",
            },
            {
                q: "How and when do I receive payouts?",
                a: "Payouts are processed automatically upon milestone completion. Funds are transferred to your registered bank account within 3–5 business days. You may review your payout history and configure your banking details from the Planner Dashboard.",
            },
        ],
    },
    {
        category: "Trust & Privacy",
        items: [
            {
                q: "How is my personal information protected?",
                a: "We take privacy with the utmost seriousness. Your data is encrypted at rest and in transit, never sold to third parties, and handled in accordance with our Privacy Policy and applicable data protection regulations.",
            },
            {
                q: "How do I report an issue or dispute?",
                a: "Should any dispute arise, please contact our concierge team at concierge@evently.com or via the Support section of your dashboard. We aim to resolve all matters discreetly and equitably within 48 hours.",
            },
        ],
    },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-[#1C1C1C]/10 last:border-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-start justify-between gap-6 py-6 text-left group"
            >
                <span className="text-sm font-light text-[#1C1C1C] group-hover:text-[#1A2E1A] transition-colors leading-relaxed">
                    {q}
                </span>
                <span className="flex-shrink-0 mt-0.5 text-[#C4A55A]">
                    {open ? <Minus size={16} /> : <Plus size={16} />}
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-500 ${open ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0"
                    }`}
            >
                <p className="text-sm font-light text-[#1C1C1C]/60 leading-relaxed pr-8">
                    {a}
                </p>
            </div>
        </div>
    );
}

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-[#FAF8F3] text-[#1C1C1C]">
            {/* Hero */}
            <section className="bg-[#1A2E1A] py-28 px-6 text-center relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 80px, #C4A55A 80px, #C4A55A 81px),
              repeating-linear-gradient(90deg, transparent, transparent 80px, #C4A55A 80px, #C4A55A 81px)`,
                    }}
                />
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#C4A55A] mb-6">
                    Evently Heritage
                </p>
                <h1 className="font-serif text-4xl md:text-6xl font-semibold tracking-wide text-[#FAF8F3]">
                    Frequently Asked Questions
                </h1>
                <div className="w-16 h-px bg-[#C4A55A] mx-auto mt-8" />
                <p className="mt-8 text-sm font-light text-[#FAF8F3]/70 max-w-xl mx-auto leading-relaxed">
                    Answers to the questions we are most frequently asked. Should you
                    require further assistance, our concierge team is available to help.
                </p>
            </section>

            {/* FAQ Content */}
            <section className="max-w-3xl mx-auto px-6 py-24 space-y-16">
                {faqs.map(({ category, items }) => (
                    <div key={category}>
                        <div className="flex items-center gap-4 mb-8">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C4A55A]">
                                {category}
                            </p>
                            <div className="flex-1 h-px bg-[#1C1C1C]/10" />
                        </div>
                        <div>
                            {items.map((item) => (
                                <AccordionItem key={item.q} q={item.q} a={item.a} />
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            {/* CTA */}
            <section className="bg-[#1A2E1A]/5 border-t border-[#1C1C1C]/10 py-20 px-6 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C4A55A] mb-4">
                    Still have questions?
                </p>
                <h3 className="font-serif text-2xl font-semibold text-[#1A2E1A] mb-6">
                    Our Concierge Team is Here
                </h3>
                <a
                    href="/contact"
                    className="inline-flex items-center gap-3 bg-[#1A2E1A] text-[#FAF8F3] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-[#C4A55A] transition-colors duration-300"
                >
                    Contact Us
                </a>
            </section>

            <Footer />
        </div>
    );
}
