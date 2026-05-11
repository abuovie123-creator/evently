import React from "react";
import { Footer } from "@/components/Footer";
import Link from "next/link";

const cookieTypes = [
    {
        name: "Strictly Necessary Cookies",
        required: true,
        description:
            "These cookies are essential for the Platform to function correctly. They enable core features such as session management, authentication, and security. The Platform cannot be used without these cookies and they cannot be disabled.",
        examples: ["Session tokens", "CSRF protection tokens", "Security identifiers"],
    },
    {
        name: "Functional Cookies",
        required: false,
        description:
            "Functional cookies allow the Platform to remember your preferences and provide enhanced, more personalised features. For example, they may remember your language preference or the last page you visited. Disabling these will not prevent you from using the Platform, but some features may not work as intended.",
        examples: ["Language preferences", "User interface settings", "Recently viewed profiles"],
    },
    {
        name: "Analytics Cookies",
        required: false,
        description:
            "We use analytics cookies to understand how our users interact with the Platform. This helps us identify areas for improvement and measure the effectiveness of our features. All data collected is anonymised and aggregated — it is never used to identify you personally.",
        examples: ["Page view counts", "Session duration", "Navigation paths"],
    },
    {
        name: "Marketing Cookies",
        required: false,
        description:
            "Marketing cookies are used to deliver relevant content and, where applicable, advertisements aligned with your interests. These cookies may be set by us or by third-party advertising partners. You may opt out of marketing cookies without affecting your use of the Platform's core features.",
        examples: ["Interest-based advertising", "Retargeting tags", "Campaign attribution"],
    },
];

export default function CookiesPage() {
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
                    Cookie Policy
                </h1>
                <div className="w-16 h-px bg-[#C4A55A] mx-auto mt-8" />
                <p className="mt-8 text-sm font-light text-[#FAF8F3]/70 max-w-xl mx-auto leading-relaxed">
                    We use cookies to ensure the highest quality experience on the Evently
                    Heritage platform. This policy explains what cookies we use and why.
                </p>
                <p className="mt-6 text-[10px] font-light text-[#FAF8F3]/40 tracking-widest uppercase">
                    Last updated: May 2025
                </p>
            </section>

            {/* What are cookies */}
            <section className="max-w-3xl mx-auto px-6 pt-20 pb-12">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-6 h-px bg-[#C4A55A]" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C4A55A]">
                        What Are Cookies?
                    </h2>
                </div>
                <p className="text-sm font-light text-[#1C1C1C]/70 leading-relaxed">
                    Cookies are small text files placed on your device when you visit a
                    website. They are widely used to make websites work more efficiently,
                    to remember your preferences, and to provide information to the
                    website's operators. Cookies do not harm your device and do not
                    contain any personally identifiable information unless you have
                    provided it to us.
                </p>
            </section>

            {/* Cookie types */}
            <section className="max-w-3xl mx-auto px-6 pb-20 space-y-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-6 h-px bg-[#C4A55A]" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C4A55A]">
                        Types of Cookies We Use
                    </h2>
                </div>

                {cookieTypes.map(({ name, required, description, examples }) => (
                    <div
                        key={name}
                        className="border border-[#1C1C1C]/10 p-8 space-y-5 relative"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <h3 className="font-serif text-lg font-semibold text-[#1A2E1A]">
                                {name}
                            </h3>
                            <span
                                className={`flex-shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 ${required
                                        ? "bg-[#1A2E1A] text-[#C4A55A]"
                                        : "bg-[#1C1C1C]/5 text-[#1C1C1C]/50"
                                    }`}
                            >
                                {required ? "Required" : "Optional"}
                            </span>
                        </div>
                        <p className="text-sm font-light text-[#1C1C1C]/60 leading-relaxed">
                            {description}
                        </p>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C1C1C]/40 mb-3">
                                Examples
                            </p>
                            <ul className="flex flex-wrap gap-2">
                                {examples.map((ex) => (
                                    <li
                                        key={ex}
                                        className="text-[10px] font-light text-[#1C1C1C]/60 border border-[#1C1C1C]/10 px-3 py-1"
                                    >
                                        {ex}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}

                {/* Managing cookies */}
                <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-4">
                        <div className="w-6 h-px bg-[#C4A55A]" />
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C4A55A]">
                            Managing Your Cookie Preferences
                        </h2>
                    </div>
                    <p className="text-sm font-light text-[#1C1C1C]/70 leading-relaxed">
                        You may control and/or delete cookies at any time through your
                        browser settings. Please note that disabling strictly necessary
                        cookies will impair the Platform's ability to function. For
                        optional cookies, your preferences will be saved and respected on
                        all subsequent visits.
                    </p>
                    <p className="text-sm font-light text-[#1C1C1C]/70 leading-relaxed">
                        Most modern browsers allow you to view, manage, delete, and block
                        cookies for any website. Find out how to do this for your browser
                        of choice via the browser's help documentation.
                    </p>
                </div>

                <div className="border-t border-[#1C1C1C]/10 pt-12 space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1C1C1C]/40">
                        Further Reading
                    </p>
                    <p className="text-sm font-light text-[#1C1C1C]/60 leading-relaxed">
                        For more information on how we handle your data, please review our{" "}
                        <Link
                            href="/privacy"
                            className="text-[#1A2E1A] underline underline-offset-4 hover:text-[#C4A55A] transition-colors"
                        >
                            Privacy Policy
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/terms"
                            className="text-[#1A2E1A] underline underline-offset-4 hover:text-[#C4A55A] transition-colors"
                        >
                            Terms & Conditions
                        </Link>
                        . Questions? Contact us at{" "}
                        <a
                            href="mailto:privacy@evently.com"
                            className="text-[#1A2E1A] underline underline-offset-4 hover:text-[#C4A55A] transition-colors"
                        >
                            privacy@evently.com
                        </a>
                        .
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}
