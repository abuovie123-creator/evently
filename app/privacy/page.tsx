import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[#FAF8F3] text-[#1C1A16]">
            {/* Hero Section */}
            <section className="relative pt-48 pb-20 px-6 bg-[#1A2E1A] overflow-hidden text-center">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/linen.png')]" />
                </div>

                <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                    <span className="section-label text-[#C4A55A]">Legal Protocol</span>
                    <h1 className="text-4xl md:text-6xl font-serif italic text-[#FAF8F3] leading-tight">
                        Privacy Protocol.
                    </h1>
                    <p className="text-[#FAF8F3]/50 text-[10px] font-bold uppercase tracking-[0.3em] mt-4">
                        Last Modified: May 2026
                    </p>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6 py-24 space-y-16">
                <div className="prose prose-stone max-w-none">
                    <section className="space-y-8">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-[#C4A55A] uppercase tracking-widest">01. Overview</span>
                            <h2 className="text-3xl font-serif text-[#1C1A16]">The Stewardship of Data</h2>
                            <p className="text-[#6B5E4E] leading-relaxed font-light italic border-l border-[#D4C5A9] pl-6">
                                "At Evently, we treat your information with the same level of curation and protection that we apply to the events we facilitate. Your privacy is not a mere compliance requirement, but a fundamental pillar of our heritage platform."
                            </p>
                            <p className="text-[#1C1A16]/80 text-sm leading-relaxed">
                                This Privacy Protocol describes how Evently ("we," "us," or "our") collects, protects, and utilizes the digital information of our distinguished members and guests.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-[#C4A55A] uppercase tracking-widest">02. Collection</span>
                            <h2 className="text-3xl font-serif text-[#1C1A16]">Information Gathered</h2>
                            <p className="text-[#1C1A16]/80 text-sm leading-relaxed">
                                We gather information that enables us to provide a bespoke experience:
                            </p>
                            <ul className="space-y-4 text-sm text-[#6B5E4E] list-none pl-0">
                                <li className="flex items-start gap-4">
                                    <span className="w-1.5 h-1.5 bg-[#C4A55A] mt-1.5 flex-shrink-0" />
                                    <span><strong>Bespoke Identification:</strong> Full name, professional credentials, and contact methodology provided during enrollment.</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-1.5 h-1.5 bg-[#C4A55A] mt-1.5 flex-shrink-0" />
                                    <span><strong>Digital Anthology:</strong> Portfolio imagery, project descriptions, and verified performance metrics.</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-1.5 h-1.5 bg-[#C4A55A] mt-1.5 flex-shrink-0" />
                                    <span><strong>Interaction Analytics:</strong> Nuanced data on how you explore the digital estate, ensuring our platform evolves with your preferences.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-4 py-8 border-y border-[#D4C5A9]/20">
                            <span className="text-[10px] font-black text-[#C4A55A] uppercase tracking-widest">03. Protection</span>
                            <h2 className="text-3xl font-serif text-[#1C1A16]">The Architectural Safeguards</h2>
                            <p className="text-[#1C1A16]/80 text-sm leading-relaxed font-light">
                                All data within the Evently estate is protected by architectural-grade encryption and audited security protocols. We do not engage in the commercial dissemination of your private data to third-party entities.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-[#C4A55A] uppercase tracking-widest">04. Contact</span>
                            <h2 className="text-3xl font-serif text-[#1C1A16]">Privacy Inquiries</h2>
                            <p className="text-[#1C1A16]/80 text-sm leading-relaxed font-light mb-8">
                                For formal inquiries regarding your data rights or to request an anthology of the information we hold, please contact our Legal Concierge.
                            </p>
                            <p className="text-[11px] font-black text-[#8B7355] uppercase tracking-widest">concierge@evently.heritage</p>
                        </div>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
}
