"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-[#FAF8F3] text-[#1C1C1C]">
            {/* Hero */}
            <section className="bg-[#1A2E1A] py-28 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 80px, #C4A55A 80px, #C4A55A 81px),
              repeating-linear-gradient(90deg, transparent, transparent 80px, #C4A55A 80px, #C4A55A 81px)`,
                    }}
                />
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#C4A55A] mb-6">
                    Evently Heritage
                </p>
                <h1 className="font-serif text-4xl md:text-6xl font-semibold tracking-wide text-[#FAF8F3]">
                    Contact Us
                </h1>
                <div className="w-16 h-px bg-[#C4A55A] mx-auto mt-8" />
                <p className="mt-8 text-sm font-light text-[#FAF8F3]/70 max-w-xl mx-auto leading-relaxed">
                    Our curators are at your service. Reach out and we shall respond with
                    the discretion and care your enquiry deserves.
                </p>
            </section>

            {/* Contact Section */}
            <section className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-20">
                {/* Info */}
                <div className="space-y-12">
                    <div>
                        <h2 className="font-serif text-3xl font-semibold text-[#1A2E1A] mb-4">
                            Get in Touch
                        </h2>
                        <p className="text-sm font-light text-[#1C1C1C]/60 leading-relaxed max-w-sm">
                            Whether you are seeking to join our planner network, require
                            assistance with an existing account, or simply wish to enquire
                            about our services, we are here.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {[
                            {
                                icon: Mail,
                                label: "Email",
                                value: "concierge@evently.com",
                                href: "mailto:concierge@evently.com",
                            },
                            {
                                icon: Phone,
                                label: "Telephone",
                                value: "+1 (800) 383 5689",
                                href: "tel:+18003835689",
                            },
                            {
                                icon: MapPin,
                                label: "Address",
                                value: "10 Heritage Lane, New York, NY 10001",
                                href: "#",
                            },
                        ].map(({ icon: Icon, label, value, href }) => (
                            <div key={label} className="flex items-start gap-5">
                                <div className="w-10 h-10 border border-[#C4A55A]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Icon size={16} className="text-[#C4A55A]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1C1C1C]/40 mb-1">
                                        {label}
                                    </p>
                                    <a
                                        href={href}
                                        className="text-sm font-light text-[#1C1C1C] hover:text-[#1A2E1A] transition-colors"
                                    >
                                        {value}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-[#1C1C1C]/10 pt-8">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1C1C1C]/40 mb-2">
                            Office Hours
                        </p>
                        <p className="text-sm font-light text-[#1C1C1C]/70">
                            Monday – Friday, 9:00 AM – 6:00 PM EST
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div>
                    {submitted ? (
                        <div className="flex flex-col items-start justify-center h-full space-y-6 py-12">
                            <div className="w-12 h-px bg-[#C4A55A]" />
                            <h3 className="font-serif text-2xl font-semibold text-[#1A2E1A]">
                                Message Received
                            </h3>
                            <p className="text-sm font-light text-[#1C1C1C]/60 leading-relaxed max-w-xs">
                                Thank you for your enquiry. A member of our team will respond
                                within one business day.
                            </p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C4A55A] hover:text-[#1A2E1A] transition-colors"
                            >
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {[
                                { label: "Full Name", name: "name", type: "text" },
                                { label: "Email Address", name: "email", type: "email" },
                            ].map(({ label, name, type }) => (
                                <div key={name} className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1C1C1C]/50">
                                        {label}
                                    </label>
                                    <input
                                        required
                                        type={type}
                                        name={name}
                                        value={formData[name as keyof typeof formData]}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b border-[#1C1C1C]/20 py-3 text-sm font-light focus:outline-none focus:border-[#C4A55A] transition-colors"
                                    />
                                </div>
                            ))}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1C1C1C]/50">
                                    Subject
                                </label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-transparent border-b border-[#1C1C1C]/20 py-3 text-sm font-light focus:outline-none focus:border-[#C4A55A] transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="">Select a subject</option>
                                    <option value="account">Account Enquiry</option>
                                    <option value="planner">Planner Membership</option>
                                    <option value="billing">Billing & Payments</option>
                                    <option value="partnership">Partnership</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1C1C1C]/50">
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    className="w-full bg-transparent border-b border-[#1C1C1C]/20 py-3 text-sm font-light focus:outline-none focus:border-[#C4A55A] transition-colors resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="group flex items-center gap-3 bg-[#1A2E1A] text-[#FAF8F3] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-[#C4A55A] transition-colors duration-300"
                            >
                                Send Message
                                <ArrowRight
                                    size={14}
                                    className="group-hover:translate-x-1 transition-transform duration-300"
                                />
                            </button>
                        </form>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}
