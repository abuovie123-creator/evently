"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        alert("Thank you. Our concierge will be in touch shortly.");
    };

    return (
        <main className="min-h-screen bg-[#FAF8F3] text-[#1C1A16]">
            {/* Hero Section */}
            <section className="relative pt-48 pb-24 px-6 bg-[#1A2E1A] overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/linen.png')]" />
                </div>

                <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
                    <span className="section-label text-[#C4A55A]">Concierge</span>
                    <h1 className="text-5xl md:text-7xl font-serif italic text-[#FAF8F3] leading-tight animate-fade-up">
                        Get in Touch.
                    </h1>
                    <p className="text-xl text-[#FAF8F3]/70 max-w-2xl mx-auto leading-relaxed font-light italic mt-8 animate-fade-up">
                        Our team is dedicated to providing a bespoke experience for the world's most discerning event architects and guests.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                    {/* Contact Info */}
                    <div className="lg:col-span-5 space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-serif text-[#1C1A16]">The Estate Office</h2>
                            <p className="text-[#6B5E4E] font-light leading-relaxed">
                                Experience a new era of event planning. Reach out for partnership inquiries, support, or to learn more about our heritage.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {[
                                { icon: Mail, label: "Correspondence", value: "concierge@evently.heritage", sub: "Replies within 24 hours" },
                                { icon: Phone, label: "Priority Line", value: "+234 (0) 800 HERITAGE", sub: "Available 9am - 6pm WAT" },
                                { icon: MapPin, label: "Headquarters", value: "Victoria Island, Lagos", sub: "Federal Republic of Nigeria" },
                                { icon: Clock, label: "Business Hours", value: "Monday – Friday", sub: "9:00 AM – 6:00 PM" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-6 group">
                                    <div className="w-12 h-12 rounded-full border border-[#D4C5A9]/30 flex items-center justify-center text-[#8B7355] bg-white group-hover:bg-[#1A2E1A] group-hover:text-white transition-all duration-500">
                                        <item.icon size={20} strokeWidth={1.5} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="section-label opacity-40">{item.label}</p>
                                        <p className="text-lg font-serif text-[#1C1A16]">{item.value}</p>
                                        <p className="text-xs text-[#6B5E4E] opacity-60 italic">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-12 border-t border-[#D4C5A9]/30">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A55A] mb-4">Virtual Visit</h4>
                            <div className="aspect-video w-full border border-[#D4C5A9]/30 grayscale overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
                                    alt="Office Interior"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-7">
                        <Card className="p-8 md:p-12 border-[#D4C5A9]/30 bg-white" hover={false}>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-serif text-[#1C1A16]">Inquiry Protocol</h3>
                                    <p className="text-sm text-[#6B5E4E] font-light">Complete the fields below to initiate your formal inquiry.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="section-label opacity-60">Full Name</label>
                                        <Input
                                            required
                                            placeholder="Enter your name"
                                            className="h-14 rounded-none border-[#D4C5A9]/20 bg-[#FAF8F3] focus:border-[#C4A55A] transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="section-label opacity-60">Email Address</label>
                                        <Input
                                            required
                                            type="email"
                                            placeholder="your@email.com"
                                            className="h-14 rounded-none border-[#D4C5A9]/20 bg-[#FAF8F3] focus:border-[#C4A55A] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="section-label opacity-60">Subject</label>
                                    <Input
                                        required
                                        placeholder="Reason for inquiry"
                                        className="h-14 rounded-none border-[#D4C5A9]/20 bg-[#FAF8F3] focus:border-[#C4A55A] transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="section-label opacity-60">Message</label>
                                    <textarea
                                        required
                                        rows={6}
                                        placeholder="How may we assist you?"
                                        className="w-full p-4 rounded-none border border-[#D4C5A9]/20 bg-[#FAF8F3] focus:border-[#C4A55A] focus:outline-none transition-all text-sm min-h-[150px]"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-16 rounded-none bg-[#1A2E1A] hover:bg-[#2C3A2E] text-white flex items-center gap-3 transition-all duration-300"
                                >
                                    {isSubmitting ? (
                                        "Transmitting..."
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Submit Inquiry
                                        </>
                                    )}
                                </Button>

                                <p className="text-[10px] text-center text-[#6B5E4E] opacity-40 font-bold uppercase tracking-widest leading-relaxed">
                                    By submitting this form, you acknowledge our privacy protocol and terms of engagement.
                                </p>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
