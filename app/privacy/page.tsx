import React from "react";
import { Footer } from "@/components/Footer";
import Link from "next/link";

const sections = [
    {
        title: "Information We Collect",
        content: `We collect information you voluntarily provide when registering an account, submitting an enquiry, or communicating through our platform. This includes your name, email address, telephone number, and professional credentials where applicable. We also collect usage data, device identifiers, and cookies to improve your experience on our platform. Payment information is handled exclusively by our accredited payment processors and is never stored on our servers.`,
    },
    {
        title: "How We Use Your Information",
        content: `Your information is used solely to operate and improve the Evently Heritage platform. This includes facilitating connections between clients and planners, processing bookings and payments, sending service notifications, and providing customer support. We do not sell, rent, or barter your personal data to any third party under any circumstances.`,
    },
    {
        title: "Information Sharing",
        content: `We share your information only with parties essential to the delivery of our service: verified planners with whom you choose to engage, payment processors necessary to complete transactions, and regulatory authorities where required by law. All third-party partners are bound by confidentiality agreements and may not use your data for any purpose outside their contracted service.`,
    },
    {
        title: "Data Retention",
        content: `We retain your personal data for as long as your account remains active or as required by applicable law. Upon account deletion, we remove your identifiable information within 30 days, save for data we are legally obligated to retain. Anonymised, aggregated data may be retained indefinitely for analytical purposes.`,
    },
    {
        title: "Your Rights",
        content: `You have the right to access, correct, or request deletion of your personal data at any time. You may also object to or restrict certain processing, and in applicable jurisdictions, request portability of your data. To exercise these rights, please contact our data team at privacy@evently.com. We will respond to all requests within 30 days.`,
    },
    {
        title: "Security",
        content: `We employ industry-standard security measures including end-to-end encryption for communications, TLS for data in transit, and AES-256 encryption for data at rest. Access to personal data is restricted to authorised personnel on a strict need-to-know basis. We conduct regular security audits and penetration tests to maintain the highest standards of data protection.`,
    },
    {
        title: "Cookies",
        content: `We use cookies and similar technologies to maintain session integrity, personalise your experience, and analyse platform usage. You may manage your cookie preferences at any time via our Cookie Policy page. Refusing non-essential cookies will not affect the core functionality of the platform.`,
    },
    {
        title: "Changes to This Policy",
        content: `We may update this Privacy Policy from time to time to reflect changes in law, regulation, or our business practices. Material changes will be communicated to registered users via email. Continued use of the platform following such notification constitutes acceptance of the revised policy.`,
    },
];

export default function PrivacyPage() {
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
                    Privacy Policy
                </h1>
                <div className="w-16 h-px bg-[#C4A55A] mx-auto mt-8" />
                <p className="mt-8 text-sm font-light text-[#FAF8F3]/70 max-w-xl mx-auto leading-relaxed">
                    Your privacy is a matter of the utmost importance to us. This policy
                    sets out how Evently Heritage collects, uses, and protects your
                    personal information.
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
                            href={`#${title.toLowerCase().replace(/\s+/g, "-")}`}
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
                        id={title.toLowerCase().replace(/\s+/g, "-")}
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
                        Questions or Concerns?
                    </p>
                    <p className="text-sm font-light text-[#1C1C1C]/60 leading-relaxed">
                        Please direct all privacy-related enquiries to{" "}
                        <a
                            href="mailto:privacy@evently.com"
                            className="text-[#1A2E1A] underline underline-offset-4 hover:text-[#C4A55A] transition-colors"
                        >
                            privacy@evently.com
                        </a>
                        . You may also review our{" "}
                        <Link
                            href="/terms"
                            className="text-[#1A2E1A] underline underline-offset-4 hover:text-[#C4A55A] transition-colors"
                        >
                            Terms &amp; Conditions
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
