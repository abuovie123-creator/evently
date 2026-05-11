import React from "react";
import { Footer } from "@/components/Footer";
import Link from "next/link";

const sections = [
    {
        title: "Acceptance of Terms",
        content: `By accessing or using the Evently Heritage platform ("the Platform"), you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must discontinue use of the Platform immediately. These Terms constitute a binding legal agreement between you and Evently Heritage Ltd.`,
    },
    {
        title: "Account Registration",
        content: `To access the full features of the Platform, you must register an account using accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately at concierge@evently.com of any unauthorised access or suspected security breach.`,
    },
    {
        title: "Planner Obligations",
        content: `Planners accepted onto the Evently Heritage network agree to maintain the standards of professionalism, quality, and conduct consistent with a premium service provider. Planners must fulfil all confirmed bookings, communicate in a timely and professional manner, and adhere to the Platform's code of conduct. Failure to uphold these standards may result in suspension or removal from the Platform.`,
    },
    {
        title: "Client Obligations",
        content: `Clients agree to provide accurate information when creating profiles and submitting enquiries. Clients must honour confirmed bookings and communicate with planners respectfully and in good faith. Fraudulent chargebacks, misuse of the escrow system, or abuse of any platform feature will result in immediate account termination and may be subject to legal action.`,
    },
    {
        title: "Payments & Escrow",
        content: `All financial transactions conducted through the Platform are processed via our accredited payment partners. Client funds are held in escrow until mutually agreed project milestones are fulfilled. Evently Heritage reserves the right to withhold or reverse payments in the event of disputes, fraud investigations, or verified breaches of these Terms. Service fees are non-refundable once a booking is confirmed unless otherwise stipulated in our Refund Policy.`,
    },
    {
        title: "Intellectual Property",
        content: `All content on the Platform, including design, text, graphics, logos, and software, is the intellectual property of Evently Heritage Ltd or its licensors. You may not reproduce, distribute, or create derivative works from any Platform content without prior written authorisation. User-generated content submitted to the Platform grants Evently Heritage a non-exclusive, royalty-free licence to use such content for the purposes of operating and promoting the Platform.`,
    },
    {
        title: "Limitation of Liability",
        content: `To the maximum extent permitted by applicable law, Evently Heritage shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the Platform. Our total liability for any claim arising in connection with the Platform shall not exceed the greater of (a) the fees paid by you to us in the 12 months preceding the claim, or (b) £100. We make no warranty that the Platform will be uninterrupted, error-free, or free from harmful components.`,
    },
    {
        title: "Termination",
        content: `We reserve the right to suspend or terminate your account at any time, with or without notice, if we reasonably believe you have violated these Terms, engaged in fraudulent activity, or otherwise acted in a manner detrimental to the Platform or its users. Upon termination, your right to access the Platform ceases immediately. Provisions of these Terms that by their nature should survive termination shall do so.`,
    },
    {
        title: "Governing Law",
        content: `These Terms & Conditions are governed by and construed in accordance with the laws of England and Wales. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.`,
    },
    {
        title: "Amendments",
        content: `We reserve the right to amend these Terms at any time. Registered users will be notified of material changes via email. Continued use of the Platform following such notification constitutes your acceptance of the revised Terms. We recommend reviewing these Terms periodically to remain informed of any updates.`,
    },
];

export default function TermsPage() {
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
                    Legal
                </p>
                <h1 className="font-serif text-4xl md:text-6xl font-semibold tracking-wide text-[#FAF8F3]">
                    Terms & Conditions
                </h1>
                <div className="w-16 h-px bg-[#C4A55A] mx-auto mt-8" />
                <p className="mt-8 text-sm font-light text-[#FAF8F3]/70 max-w-xl mx-auto leading-relaxed">
                    Please read these Terms & Conditions carefully before using the
                    Evently Heritage platform. They govern your relationship with us.
                </p>
                <p className="mt-6 text-[10px] font-light text-[#FAF8F3]/40 tracking-widest uppercase">
                    Last updated: May 2025
                </p>
            </section>

            {/* Quick Nav */}
            <section className="border-b border-[#1C1C1C]/10 py-6 px-6">
                <div className="max-w-3xl mx-auto flex flex-wrap gap-x-8 gap-y-2">
                    {sections.map(({ title }) => (
                        <a
                            key={title}
                            href={`#${title.toLowerCase().replace(/[\s&]+/g, "-")}`}
                            className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C1C1C]/40 hover:text-[#C4A55A] transition-colors"
                        >
                            {title}
                        </a>
                    ))}
                </div>
            </section>

            {/* Content */}
            <section className="max-w-3xl mx-auto px-6 py-20 space-y-16">
                {sections.map(({ title, content }) => (
                    <div
                        key={title}
                        id={title.toLowerCase().replace(/[\s&]+/g, "-")}
                        className="scroll-mt-10"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-6 h-px bg-[#C4A55A]" />
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C4A55A]">
                                {title}
                            </h2>
                        </div>
                        <p className="text-sm font-light text-[#1C1C1C]/70 leading-relaxed">
                            {content}
                        </p>
                    </div>
                ))}

                <div className="border-t border-[#1C1C1C]/10 pt-12 space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1C1C1C]/40">
                        Questions?
                    </p>
                    <p className="text-sm font-light text-[#1C1C1C]/60 leading-relaxed">
                        For any questions regarding these Terms, please contact us at{" "}
                        <a
                            href="mailto:legal@evently.com"
                            className="text-[#1A2E1A] underline underline-offset-4 hover:text-[#C4A55A] transition-colors"
                        >
                            legal@evently.com
                        </a>
                        . You may also review our{" "}
                        <Link
                            href="/privacy"
                            className="text-[#1A2E1A] underline underline-offset-4 hover:text-[#C4A55A] transition-colors"
                        >
                            Privacy Policy
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/cookies"
                            className="text-[#1A2E1A] underline underline-offset-4 hover:text-[#C4A55A] transition-colors"
                        >
                            Cookie Policy
                        </Link>
                        .
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}
